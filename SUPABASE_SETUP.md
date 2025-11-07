# Supabase Setup for Email Collection

This project has been updated to use Supabase for collecting and storing email contacts from various forms throughout the website, and Resend for sending automated emails.

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email Service Configuration
VITE_RESEND_API_KEY=your_resend_api_key
```

### Example:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RESEND_API_KEY=re_1234567890abcdef...
```

## Resend Setup

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get API Key**: In your Resend dashboard, go to API Keys and create a new key
3. **Verify Domain** (Optional): For production, verify your domain to send from custom email addresses
4. **Add API Key**: Add your Resend API key to your `.env` file

## Database Setup

The project includes a `supabase_setup.sql` file that creates the necessary table structure:

- **Table**: `contacts`
- **Fields**: 
  - `id` (UUID, Primary Key)
  - `email` (VARCHAR, Unique)
  - `first_name` (VARCHAR, Optional)
  - `last_name` (VARCHAR, Optional)
  - `phone_number` (VARCHAR, Optional)
  - `form_source` (VARCHAR, Required) - tracks which form the contact came from
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

## Forms Updated

The following forms now store contacts in Supabase and send automated emails via Resend:

1. **Footer Newsletter Subscription** (`form_source: 'footer_newsletter'`)
   - Stores contact in Supabase
   - Sends welcome email via Resend
2. **Contact Form** (`form_source: 'contact_form'`)
   - Stores contact in Supabase
3. **AI Chat** (`form_source: 'ai_chat'`)
   - Stores contact in Supabase

## Email Automation

When users subscribe to the newsletter:

1. **Contact Storage**: Information is stored in the Supabase `contacts` table
2. **Welcome Email**: A beautifully formatted welcome email is automatically sent via Resend
3. **Email Content**: Welcome emails include:
   - Personalized greeting (if name provided)
   - Company overview and value proposition
   - Call-to-action to explore the platform
   - Professional styling and branding

## How It Works

1. **Email Collection**: When users submit any form, their information is stored in the Supabase `contacts` table
2. **Duplicate Handling**: The system gracefully handles duplicate emails (unique constraint violations)
3. **Form Tracking**: Each contact is tagged with its source form for analytics
4. **Automated Emails**: Welcome emails are sent automatically via Resend
5. **Error Handling**: Comprehensive error handling with user-friendly messages
6. **Fallback**: If email sending fails, the subscription still succeeds

## Security

- Row Level Security (RLS) is enabled on the contacts table
- Policies allow inserting new contacts and reading existing ones
- The anon key is safe to use in the frontend as it only has the permissions defined in the policies
- Resend API keys should be kept secure and not exposed in client-side code

## Vercel Deployment

Make sure to add the environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all required environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESEND_API_KEY`
4. Redeploy your application

## Testing

To test the email collection and automation:

1. Fill out the footer newsletter form
2. Submit the contact form
3. Use the AI chat and provide an email
4. Check your Supabase dashboard to see the contacts being stored
5. Check your email inbox for the welcome email
6. Check Resend dashboard for email delivery status

## Troubleshooting

- **Missing Environment Variables**: Check that all required environment variables are set
- **Database Connection Issues**: Verify your Supabase project is active and the URL is correct
- **Permission Errors**: Ensure the RLS policies are properly configured in your Supabase dashboard
- **Email Delivery Issues**: Check your Resend API key and domain verification status
- **Mock Mode**: If environment variables are missing, the system will run in mock mode for development

## Email Templates

The system includes two email templates:

1. **Welcome Email**: Sent to new newsletter subscribers
2. **Newsletter Confirmation**: Simple confirmation email (can be used for additional purposes)

Both templates are responsive and professionally styled with CREW CUT branding.
