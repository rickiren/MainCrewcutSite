# Resend Email Service Integration

This document explains how to set up and use the Resend email service integration in the CREW CUT platform.

## What is Resend?

[Resend](https://resend.com) is a modern email API that makes it easy to send transactional and marketing emails. It's developer-friendly, reliable, and cost-effective.

## Features Implemented

- ✅ **Welcome Emails**: Automatically sent when users subscribe to the newsletter
- ✅ **Email Templates**: Beautiful, responsive HTML email templates
- ✅ **Error Handling**: Graceful fallbacks if email sending fails
- ✅ **Mock Mode**: Development-friendly mode when API keys aren't configured
- ✅ **TypeScript Support**: Full type safety for email operations

## Quick Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the key (starts with `re_`)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
VITE_RESEND_API_KEY=re_your_api_key_here
```

### 3. Verify Domain (Optional but Recommended)

For production use, verify your domain in Resend to send from custom email addresses like `noreply@yourdomain.com`.

## Email Templates

### Welcome Email Template

The welcome email includes:
- Personalized greeting
- Company overview
- Value proposition
- Call-to-action button
- Professional styling
- Responsive design

### Newsletter Confirmation Template

A simple confirmation email for newsletter subscriptions.

## Usage Examples

### Sending a Welcome Email

```typescript
import { sendWelcomeEmail } from '@/services/resendService';

const result = await sendWelcomeEmail({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
});
```

### Sending a Custom Email

```typescript
import { sendEmail } from '@/services/resendService';

const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML Content</h1>'
});
```

## API Reference

### `sendEmail(emailData: EmailData)`

Sends a custom email.

**Parameters:**
- `to`: Recipient email address
- `subject`: Email subject line
- `html`: HTML content of the email
- `from`: Optional sender email (defaults to `noreply@crewcut.ai`)

### `sendWelcomeEmail(userData: WelcomeEmailData)`

Sends a welcome email to new subscribers.

**Parameters:**
- `email`: Recipient email address
- `firstName`: Optional first name
- `lastName`: Optional last name

### `sendNewsletterConfirmation(email: string)`

Sends a newsletter confirmation email.

**Parameters:**
- `email`: Recipient email address

## Error Handling

The service includes comprehensive error handling:

- **API Errors**: Logged and thrown for proper error handling
- **Missing API Key**: Falls back to mock mode for development
- **Email Failures**: Don't break the main subscription flow
- **Graceful Degradation**: System continues to work even if emails fail

## Mock Mode

When `VITE_RESEND_API_KEY` is not set, the system runs in mock mode:

- Logs what emails would be sent
- Doesn't make actual API calls
- Perfect for development and testing
- No errors thrown for missing configuration

## Production Considerations

### Rate Limits

Resend has generous rate limits:
- 100 emails per second on free plan
- 10,000 emails per second on paid plans

### Domain Verification

For production, verify your domain to:
- Send from custom email addresses
- Improve deliverability
- Build brand trust

### Monitoring

Monitor email delivery in the Resend dashboard:
- Delivery rates
- Bounce rates
- Spam complaints
- Open rates (if tracking enabled)

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check API key is correct
   - Verify domain is verified (if using custom domain)
   - Check Resend dashboard for errors

2. **API key errors**
   - Ensure key starts with `re_`
   - Check key permissions in Resend dashboard
   - Verify key is active

3. **Domain verification issues**
   - Follow Resend's DNS setup guide
   - Wait for DNS propagation (can take up to 48 hours)
   - Check DNS records are correct

### Debug Mode

Enable debug logging by checking the browser console for:
- `📧 Mock mode: Email would be sent via Resend`
- `✅ Email sent successfully via Resend`
- `❌ Resend error: [error details]`

## Future Enhancements

Potential improvements to consider:

- **Email Analytics**: Track open rates, click rates
- **A/B Testing**: Test different email templates
- **Scheduled Emails**: Send emails at specific times
- **Email Lists**: Manage subscriber segments
- **Unsubscribe Handling**: Proper unsubscribe mechanisms
- **Email Preferences**: Let users choose email frequency

## Support

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Resend Support**: Available in their dashboard
- **Community**: Active Discord community for developers

## Security Notes

- API keys are environment variables and not exposed in client code
- Emails are sent server-side via Resend's secure API
- No sensitive data is logged in production
- Follow email best practices for compliance (CAN-SPAM, GDPR)
