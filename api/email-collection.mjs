// ES Module for Vercel - Email Collection API

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
    console.log('Email collection API called with method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { email, businessContext, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Store email in your database or CRM system here
    // For now, we'll just log it
    console.log('Email collected:', {
      email,
      businessContext: businessContext || 'Not provided',
      name: name || 'Not provided',
      timestamp: new Date().toISOString()
    });

    // You can integrate with services like:
    // - Mailchimp
    // - ConvertKit
    // - HubSpot
    // - Your own database
    // - EmailJS (which you're already using)

    // Send confirmation email using EmailJS or your preferred email service
    // For now, we'll return success

    res.json({
      success: true,
      message: 'Email collected successfully',
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in email collection API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
