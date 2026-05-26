import Stripe from "npm:stripe@14.24.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, stripe-signature, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const DATABASE_PAYMENT_EVENTS_TABLE = Deno.env.get("PAYMENT_EVENTS_TABLE") ?? "payment_events";

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error("Missing STRIPE_SECRET_KEY and/or STRIPE_WEBHOOK_SECRET env vars");
}

const stripe = new Stripe(STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

// Service role key required — this runs server-side and needs to bypass RLS
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Persist every Stripe event for auditing (idempotent via upsert)
  try {
    const createdAt = event.created 
      ? new Date(event.created * 1000).toISOString() 
      : new Date().toISOString();
    
    await supabaseAdmin
      .from(DATABASE_PAYMENT_EVENTS_TABLE)
      .upsert(
        {
          event_id: event.id,
          type: event.type,
          created_at: createdAt,
          raw: event as unknown as Record<string, unknown>,
        },
        { onConflict: "event_id" },
      );
  } catch (err) {
    // Don't fail the webhook over an audit-log failure — Stripe would retry forever
    console.error("Failed saving Stripe event to audit log", err);
  }

  // --- Business logic per event type ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      // Session was not created by create-checkout-session — nothing to update
      console.warn("checkout.session.completed: no order_id in session metadata, skipping order update");
    } else {
      try {
        // Mark the order as paid. The order row and items were already inserted
        // by create-checkout-session, so this is just a status update.
        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            customer_email: session.customer_details?.email ?? session.customer_email,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            metadata: {
              paid_at: new Date().toISOString(),
            },
          })
          .eq("id", orderId);        if (error) {
          console.error(`Failed to mark order ${orderId} as paid:`, error.message);
        } else {
          console.log(`Order ${orderId} marked as paid`);
        }

        // TODO: Trigger a confirmation email here (e.g. via Resend or SendGrid)
        // Example: await sendConfirmationEmail(session.customer_details?.email, orderId)

      } catch (err) {
        console.error("Unexpected error updating order:", err);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    // Payment window expired — mark the pending order as cancelled
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
    }
  }

  // TODO: Handle payment_intent.payment_failed to mark order as 'failed'

  return new Response(
    JSON.stringify({ received: true, event_id: event.id, type: event.type }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
