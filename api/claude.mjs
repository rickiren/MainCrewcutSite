// ES Module for Vercel

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
    console.log('API called with method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { userMessage, conversationHistory, systemPrompt } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: conversationHistory ? [...conversationHistory, { role: 'user', content: userMessage }] : [{ role: 'user', content: userMessage }],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = Array.isArray(data?.content)
      ? data.content
        .map((block) => (block?.type === 'text' && typeof block?.text === 'string' ? block.text : ''))
        .filter(Boolean)
        .join('\n\n')
      : '';

    console.log('Success! Response sent:', { textLength: text.length, usage: data.usage });

    res.json({
      text,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    console.error('Error details:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    });
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
