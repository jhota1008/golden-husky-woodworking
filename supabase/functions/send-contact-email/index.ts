import { Resend } from "npm:resend@3.2.0";

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

Deno.serve(async (req) => {
  const requestOrigin = req.headers.get("Origin");
  const allowedOrigin = getAllowedOrigin(requestOrigin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": allowedOrigin,
      },
    });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Parse the request body
    const { name, email, phone, guitarIdea, budget, timeline } = await req.json();

    console.log("Received contact form submission:", { name, email });

    // Validate required fields
    if (!name || !email || !guitarIdea) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Access-Control-Allow-Origin": allowedOrigin,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Your email address where you want to receive inquiries
    const YOUR_EMAIL = Deno.env.get("CONTACT_EMAIL") || "jhota1008@gmail.com";
    
    console.log("Attempting to send email to:", YOUR_EMAIL);
    console.log("Resend API Key exists:", !!Deno.env.get("RESEND_API_KEY"));
    console.log("Reply-To will be set to:", email);

    // Send email using Resend
    const data = await resend.emails.send({
      from: "Golden Husky Woodworking <contact@goldenhusky.shop>",
      to: [YOUR_EMAIL],
      replyTo: [email], // This allows you to reply directly to the customer
      subject: `Custom Guitar Inquiry from ${name}`,
      html: `
        <h2>New Custom Guitar Inquiry</h2>
        <div style="background: #f0f0f0; padding: 15px; margin-bottom: 20px; border-left: 4px solid #1976d2;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
        </div>
        
        <h3>Guitar Idea:</h3>
        <p>${guitarIdea.replace(/\n/g, "<br>")}</p>
        
        <h3>Additional Details:</h3>
        <p><strong>Budget Range:</strong> ${budget || "Not specified"}</p>
        <p><strong>Desired Timeline:</strong> ${timeline || "Flexible"}</p>
        
        <hr>
        <p style="background: #fff3cd; padding: 10px; border-radius: 4px;">
          <strong>💡 To respond:</strong> Simply hit Reply to send your message directly to <a href="mailto:${email}">${email}</a>
        </p>
      `,
      text: `
New Custom Guitar Inquiry

From: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}

Guitar Idea:
${guitarIdea}

Budget Range: ${budget || "Not specified"}
Desired Timeline: ${timeline || "Flexible"}

---
You can reply directly to this email to respond to ${name}
      `,
    });

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email",
        details: error.message,
        errorName: error.name
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
