import { Resend } from 'resend';

// Initialize Resend with API key only if it exists
let resend: Resend | null = null;
if (import.meta.env.VITE_RESEND_API_KEY) {
  resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    // Check if we're in mock mode (no API key or resend not initialized)
    if (!import.meta.env.VITE_RESEND_API_KEY || !resend) {
      console.log('📧 Mock mode: Email would be sent via Resend:', emailData);
      return { success: true, message: 'Email sent successfully (mock mode)' };
    }

    console.log('📧 Attempting to send email via Resend...');
    console.log('📧 From:', emailData.from || 'CREW CUT <onboarding@resend.dev>');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);

    // Add timeout and better error handling for development
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });

    const emailPromise = resend.emails.send({
      from: emailData.from || 'CREW CUT <onboarding@resend.dev>',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
    });

    const { data, error } = await Promise.race([emailPromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Resend error details:', {
        message: error.message,
        statusCode: (error as any).statusCode,
        name: error.name
      });
      throw error;
    }

    console.log('✅ Email sent successfully via Resend:', data);
    return { success: true, data, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: (error as Error).message,
      statusCode: (error as any)?.statusCode,
      name: (error as Error).name
    });
    
    // In development, if it's a network error, provide helpful info
    if ((error as Error).message.includes('fetch') || (error as Error).message.includes('network')) {
      console.warn('⚠️  Network error detected. This is common in development environments.');
      console.warn('💡 Try refreshing the page or check your network connection.');
      console.warn('💡 The subscription was successful - only the welcome email failed.');
    }
    
    throw error;
  }
};

export const sendWelcomeEmail = async (userData: WelcomeEmailData) => {
  const welcomeEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CREW CUT</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Welcome to CREW CUT!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userData.firstName || 'there'}!</h2>
          <p>Thank you for subscribing to our newsletter! We're excited to have you on board.</p>
          
          <p>At CREW CUT, we build custom AI and SaaS tools that:</p>
          <ul>
            <li>💰 Cut costs and unlock new revenue streams</li>
            <li>⚡ Deliver production-ready solutions in just 14 days</li>
            <li>🔒 Give you 100% ownership of your tools</li>
          </ul>
          
          <p>You'll be the first to know about:</p>
          <ul>
            <li>🎯 New AI tools and solutions</li>
            <li>📊 Industry insights and case studies</li>
            <li>🚀 Exclusive offers and early access</li>
            <li>💡 Tips for leveraging AI in your business</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://crewcut.ai" class="cta-button">Explore Our Platform</a>
          </div>
          
          <p>If you have any questions or want to discuss how we can help your business, feel free to reach out!</p>
          
          <p>Best regards,<br>The CREW CUT Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CREW CUT. All rights reserved.</p>
          <p>You can unsubscribe at any time by clicking the link below.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userData.email,
    subject: 'Welcome to CREW CUT! 🚀',
    html: welcomeEmailHtml,
  });
};

export const sendNewsletterConfirmation = async (email: string) => {
  const confirmationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Newsletter Subscription Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Subscription Confirmed</h2>
        </div>
        <div class="content">
          <p>Your newsletter subscription has been confirmed!</p>
          <p>You'll start receiving our updates and insights soon.</p>
          <p>Thank you for joining the CREW CUT community!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CREW CUT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Newsletter Subscription Confirmed ✅',
    html: confirmationHtml,
  });
};
