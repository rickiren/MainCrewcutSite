// ES Module for Vercel - Claude Overlay Editor API
// Handles AI-powered HTML/CSS overlay editing

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
    console.log('Overlay AI API called');
    const { currentHTML, currentCSS, userRequest } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    if (!userRequest) {
      return res.status(400).json({ error: 'User request is required' });
    }

    // Build the system prompt for overlay editing
    const systemPrompt = `You are an expert HTML/CSS overlay designer for streaming platforms like Kick. Your job is to make precise, real-time edits to HTML and CSS based on user requests.

IMPORTANT INSTRUCTIONS:
- When the user asks to change text, colors, sizes, positions, or styling, make ONLY those specific changes
- Preserve ALL existing HTML structure, classes, IDs, and attributes unless explicitly asked to change them
- Keep the response format consistent: always include the complete updated HTML and CSS
- If only HTML changes are needed, still include the CSS (even if unchanged)
- If only CSS changes are needed, still include the HTML (even if unchanged)
- Make changes directly to the code - don't just describe what to change

Current HTML:
\`\`\`html
${currentHTML || '(No HTML yet)'}
\`\`\`

Current CSS:
\`\`\`css
${currentCSS || '(No CSS yet)'}
\`\`\`

RESPONSE FORMAT (REQUIRED):
1. A brief explanation (1-2 sentences) of what you changed
2. The COMPLETE updated HTML wrapped in \`\`\`html code block
3. The COMPLETE updated CSS wrapped in \`\`\`css code block

Example response format:
"I've changed the text color to blue and updated the heading text.

\`\`\`html
<div>...</div>
\`\`\`

\`\`\`css
body { color: blue; }
\`\`\`"`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: userRequest
          }
        ],
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

    console.log('Success! Overlay AI response sent:', { textLength: text.length, usage: data.usage });

    res.json({
      text,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error calling Claude Overlay API:', error);
    console.error('Error details:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    });
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
