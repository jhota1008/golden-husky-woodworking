import Stripe from "npm:stripe@14.24.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Whitelist allowed origins for production
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4000", 
  "https://goldenhusky.shop",
  "https://www.goldenhusky.shop"
];

function getAllowedOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

// Use the service role key so we can insert orders bypassing RLS
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

  try {
    const { items, shipping, userId, totalCents } = await req.json();

    // Reject unauthenticated requests — guest checkout is not supported
    if (!userId) {
      return new Response(JSON.stringify({ error: "You must be signed in to check out." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- SECURITY: Validate prices against database ---
    // Never trust prices from the client! Users can modify them.
    const productIds = items.map((i: any) => i.productId);
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, price_cents, title")
      .in("id", productIds);

    if (productsError || !dbProducts) {
      throw new Error("Failed to verify product prices");
    }

    // Build a map of product_id -> actual price from database
    const priceMap = new Map(dbProducts.map(p => [p.id, p.price_cents]));

    // Verify each item's price matches the database
    let calculatedTotal = 0;
    for (const item of items) {
      const actualPrice = priceMap.get(item.productId);
      if (!actualPrice) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (item.price_cents !== actualPrice) {
        throw new Error(`Price mismatch for ${item.title}`);
      }
      calculatedTotal += actualPrice * item.quantity;
    }

    // Verify the total matches what client calculated
    if (calculatedTotal !== totalCents) {
      throw new Error("Cart total mismatch");
    }

    // --- 1. Create a pending order in DB BEFORE going to Stripe ---
    // This gives us an order_id to embed in the Stripe session metadata.
    // The webhook will update this order to 'paid' after payment succeeds.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([{
        user_id: userId,
        status: "pending",
        total_cents: totalCents,
        customer_email: shipping.email,
        shipping,
        metadata: { item_count: items.length },
      }])
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // --- 2. Insert order_items snapshot ---
    const lineItemRows = items.map((i: any) => ({
      order_id: order.id,
      product_id: i.productId,
      title: i.title,
      price_cents: i.price_cents,
      quantity: i.quantity,
      metadata: { image: i.image ?? null },
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(lineItemRows);

    if (itemsError) {
      // Clean up the order if items insert fails
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error(itemsError.message);
    }

    // --- 3. Build Stripe line_items from cart ---
    const stripeLineItems = items.map((i: any) => ({
      price_data: {
        currency: "usd",
        unit_amount: i.price_cents,          // Stripe expects cents
        product_data: { name: i.title },
      },
      quantity: i.quantity,
    }));

    // --- 4. Create the Stripe Checkout Session ---
    // Embed order_id in metadata so the webhook knows which DB row to update.
    const requestOrigin = req.headers.get("origin");
    const origin = getAllowedOrigin(requestOrigin);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      customer_email: shipping.email,
      metadata: {
        order_id: order.id,         // webhook reads this
        user_id: userId ?? "guest",
      },
      // Stripe redirects the browser here after payment
      success_url: `${origin}/order-confirmation/${order.id}`,
      cancel_url: `${origin}/checkout`,
    });

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        order_id: order.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
