# Email Contact Form Setup

This guide will help you set up the email contact form so that customer inquiries are sent directly to your email.

## Steps to Set Up

### 1. Sign up for Resend (Free Email Service)

1. Go to [https://resend.com](https://resend.com) and create a free account
2. The free tier includes **100 emails/day** and **3,000 emails/month** - perfect for contact forms!
3. Verify your email address

### 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name like "Golden Husky Contact Form"
4. Copy the API key (it starts with `re_...`)
5. **Save it somewhere safe** - you won't be able to see it again!

### 3. Set Your Contact Email

Decide which email address you want to receive contact form submissions at. This will be where all inquiries are sent.

### 4. Configure Supabase Environment Variables

You need to add two secrets to your Supabase project:

```bash
# From your project root, run these commands:

# Set your Resend API key
npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Set your email address where you want to receive inquiries
npx supabase secrets set CONTACT_EMAIL=your-email@example.com
```

Replace `re_your_actual_api_key_here` with your actual Resend API key and `your-email@example.com` with your actual email address.

### 5. Deploy the Edge Function

Deploy the new edge function to Supabase:

```bash
npx supabase functions deploy send-contact-email
```

### 6. Test It!

1. Go to your Custom Guitars page
2. Fill out the contact form
3. Submit it
4. Check your email - you should receive the inquiry!
5. When you hit "Reply" in your email client, it will reply directly to the customer's email address

## Customizing the Email Sender

By default, Resend uses `onboarding@resend.dev` as the sender address. To use your own domain (like `contact@goldenhusky.shop`):

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Add your domain and verify it by adding DNS records
4. Update the `from` field in `supabase/functions/send-contact-email/index.ts`:
   ```typescript
   from: "Golden Husky Woodworking <contact@goldenhusky.shop>",
   ```
5. Redeploy the function: `npx supabase functions deploy send-contact-email`

## How It Works

1. Customer fills out the contact form
2. Form data is sent to your Supabase Edge Function
3. Edge Function uses Resend to send you an email
4. You receive the email with all their details
5. The `replyTo` is set to the customer's email, so you can reply directly
6. Customer receives your reply in their inbox

## Troubleshooting

**Error: "Failed to send email"**
- Check that your `RESEND_API_KEY` is set correctly in Supabase secrets
- Verify your Resend account is active and has available quota

**Not receiving emails?**
- Check your spam folder
- Verify the `CONTACT_EMAIL` secret is set to the correct address
- Check the Resend dashboard for delivery logs

**"CORS error" in browser console?**
- Make sure your domain is listed in the `ALLOWED_ORIGINS` array in the edge function
- Redeploy the function after making changes

## Cost

- **Resend Free Tier**: 100 emails/day, 3,000/month
- **Supabase Edge Functions**: Included in free tier (500K invocations/month)

Both services are completely free for typical contact form usage!
