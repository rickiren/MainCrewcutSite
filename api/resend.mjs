// ES Module for Vercel - Resend Email API Proxy
// This endpoint proxies email requests to Resend API to avoid CORS issues

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Resend API proxy called with method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { emailData } = req.body;

    if (!emailData) {
      return res.status(400).json({ error: 'emailData is required' });
    }

    const { to, subject, html, from } = emailData;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }

    // Get Resend API key from environment variable (without VITE_ prefix)
    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      console.error('Resend API key not configured');
      return res.status(500).json({ error: 'Resend API key not configured' });
    }

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: from || 'CREW CUT <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Email sent successfully via Resend:', data);

    res.json({
      success: true,
      data: data,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error in Resend API proxy:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

