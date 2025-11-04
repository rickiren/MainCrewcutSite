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

// Determine API URL - use relative path for both dev and prod
const getApiUrl = () => {
  // In development, use relative path (handled by Vite middleware)
  // In production, Vercel will handle /api/resend automatically
  return '/api/resend';
};

export const sendEmail = async (emailData: EmailData) => {
  try {
    // Check if we're in mock mode (no API key)
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      console.log('📧 Mock mode: Email would be sent via Resend:', emailData);
      return { success: true, message: 'Email sent successfully (mock mode)' };
    }

    console.log('📧 Attempting to send email via Resend API proxy...');
    console.log('📧 From:', emailData.from || 'CREW CUT <onboarding@resend.dev>');
    console.log('📧 To:', emailData.to);
    console.log('📧 Subject:', emailData.subject);

    const apiUrl = getApiUrl();
    
    // Call our backend API endpoint which will proxy to Resend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailData: {
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          from: emailData.from || 'CREW CUT <onboarding@resend.dev>',
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorData.message || errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via Resend:', result);
    return { success: true, data: result.data, message: result.message || 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: (error as Error).message,
      name: (error as Error).name
    });
    
    // In development, if it's a network error, provide helpful info
    if ((error as Error).message.includes('fetch') || (error as Error).message.includes('network') || (error as Error).message.includes('CORS')) {
      console.warn('⚠️  Network/CORS error detected.');
      console.warn('💡 Make sure the API endpoint is properly configured.');
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

export interface AIImplementationGuideData {
  email: string;
  firstName?: string;
  businessType?: string;
  aiSolutions?: string; // The 3 AI solutions we showed them
}

export const sendAIImplementationGuide = async (data: AIImplementationGuideData) => {
  const { email, firstName, businessType, aiSolutions } = data;

  const guideHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI Implementation Guide</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .intro { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.8; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: 600; color: #667eea; margin-bottom: 15px; display: flex; align-items: center; }
        .section-title span { margin-right: 8px; }
        .solution-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px; }
        .solution-title { font-weight: 600; font-size: 18px; color: #333; margin-bottom: 10px; }
        .solution-description { color: #555; margin-bottom: 15px; line-height: 1.7; }
        .solution-steps { color: #555; line-height: 1.8; }
        .solution-steps li { margin-bottom: 8px; }
        .cta-box { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; }
        .cta-box h3 { margin: 0 0 15px; font-size: 22px; }
        .cta-box p { margin: 0 0 20px; font-size: 16px; opacity: 0.95; }
        .cta-button { display: inline-block; background: white; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .cta-button:hover { background: #f0f0f0; }
        .tips { background: #fffbf0; border: 1px solid #ffe066; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .tips-title { font-weight: 600; color: #d97706; margin-bottom: 10px; display: flex; align-items: center; }
        .tips-title span { margin-right: 8px; }
        .tips ul { margin: 10px 0 0; padding-left: 20px; }
        .tips li { margin-bottom: 8px; color: #555; }
        .footer { background: #f9f9f9; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .footer-links { margin: 15px 0; }
        .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
        .money-stat { background: #f0fdf4; border: 2px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .money-stat-big { font-size: 32px; font-weight: 700; color: #16a34a; margin-bottom: 5px; }
        .money-stat-label { font-size: 14px; color: #15803d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Your AI Implementation Guide</h1>
          <p>Turn these AI opportunities into real revenue</p>
        </div>

        <div class="content">
          <div class="greeting">
            Hi ${firstName || 'there'}! 👋
          </div>

          <div class="intro">
            Thanks for chatting with our AI consultant! Based on your ${businessType || 'business'}, we've prepared a detailed implementation guide to help you start making money with AI <strong>today</strong>.
          </div>

          ${aiSolutions ? `
          <div class="section">
            <div class="section-title"><span>🎯</span>Your Personalized AI Solutions</div>
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; white-space: pre-line; line-height: 1.8; color: #333;">
${aiSolutions}
            </div>
          </div>
          ` : ''}

          <div class="money-stat">
            <div class="money-stat-big">$50K+/year</div>
            <div class="money-stat-label">Average revenue increase from implementing these AI solutions</div>
          </div>

          <div class="section">
            <div class="section-title"><span>🚀</span>Quick Start: Your Next Steps</div>
            <div class="solution-steps">
              <ol>
                <li><strong>Pick ONE solution to start with</strong> - Don't try to implement everything at once. Choose the one with the biggest impact for your business.</li>
                <li><strong>Set up the tools</strong> - Most AI tools have free trials. Start experimenting without any financial commitment.</li>
                <li><strong>Build a simple prototype</strong> - Get something working in 1-2 days, even if it's basic.</li>
                <li><strong>Measure the results</strong> - Track time saved or revenue generated to prove ROI.</li>
                <li><strong>Scale what works</strong> - Once you see results, invest more resources to maximize the impact.</li>
              </ol>
            </div>
          </div>

          <div class="tips">
            <div class="tips-title"><span>💡</span>Pro Tips for Success</div>
            <ul>
              <li><strong>Start small:</strong> Pick the lowest-hanging fruit first to build momentum</li>
              <li><strong>Use free tiers:</strong> ChatGPT, Claude, Make.com all have free plans - test before you commit</li>
              <li><strong>Track everything:</strong> Measure time saved and money made to justify further investment</li>
              <li><strong>Get help:</strong> Don't hesitate to reach out if you get stuck - we're here to help</li>
            </ul>
          </div>

          <div class="cta-box">
            <h3>Need Help Implementing?</h3>
            <p>We build custom AI solutions in 14 days. Let's turn these opportunities into reality.</p>
            <a href="https://calendly.com/rickibodner/30min" class="cta-button">Book a Free 15-Min Call</a>
          </div>

          <div class="section">
            <div class="section-title"><span>🛠️</span>Recommended Tools to Get Started</div>
            <div class="solution-steps">
              <ul>
                <li><strong>ChatGPT (OpenAI):</strong> Best for content creation, customer support, data analysis</li>
                <li><strong>Claude (Anthropic):</strong> Excellent for complex reasoning, writing, and analysis</li>
                <li><strong>Make.com:</strong> Automation platform to connect AI with your existing tools</li>
                <li><strong>Zapier:</strong> Alternative automation platform with 5,000+ integrations</li>
                <li><strong>Notion AI:</strong> Great for document automation and knowledge management</li>
              </ul>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
            <p style="font-size: 16px; color: #333;">Questions? Just reply to this email - I read every response.</p>
            <p style="font-size: 16px; color: #333;">Best,<br><strong>The CREW CUT Team</strong></p>
          </div>
        </div>

        <div class="footer">
          <p><strong>CREW CUT</strong> - Custom AI & SaaS Solutions</p>
          <div class="footer-links">
            <a href="https://home.crewcut.agency/">Visit Website</a> |
            <a href="https://calendly.com/rickibodner/30min">Book a Call</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} CREW CUT. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `💰 Your AI Implementation Guide${businessType ? ' for ' + businessType : ''} - Start Making Money Today`,
    html: guideHtml,
  });
};
