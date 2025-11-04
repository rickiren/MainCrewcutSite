import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  base: '/', // Explicitly set base path for Firebase
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Add API route handler for local development
    mode === 'development' && {
      name: 'claude-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/claude', async (req, res, next) => {
          // Only handle POST requests
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          // Handle preflight
          if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
          }

          try {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const { userMessage, conversationHistory, systemPrompt } = JSON.parse(body);
                
                // Load API key from environment variables
                // Vite loads VITE_* variables into process.env during dev server startup
                const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_CLAUDE_API_KEY || env.VITE_CLAUDE_API_KEY;
                
                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Claude API key not configured. Set ANTHROPIC_API_KEY or VITE_CLAUDE_API_KEY in your .env file' }));
                  return;
                }

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
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

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  text,
                  usage: data.usage
                }));
              } catch (error) {
                console.error('Error in Claude API middleware:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: error instanceof Error ? error.message : 'Unknown error' 
                }));
              }
            });
          } catch (error) {
            console.error('Error parsing request:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
          }
        });

        // Add Resend API middleware for local development
        server.middlewares.use('/api/resend', async (req, res, next) => {
          // Handle OPTIONS preflight
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.writeHead(200);
            res.end();
            return;
          }

          // Only handle POST requests
          if (req.method !== 'POST') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          try {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const { emailData } = JSON.parse(body);

                if (!emailData) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'emailData is required' }));
                  return;
                }

                const { to, subject, html, from } = emailData;

                if (!to || !subject || !html) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'to, subject, and html are required' }));
                  return;
                }

                // Load API key from environment variables
                const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || env.VITE_RESEND_API_KEY;
                
                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Resend API key not configured. Set RESEND_API_KEY or VITE_RESEND_API_KEY in your .env file' }));
                  return;
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

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  data: data,
                  message: 'Email sent successfully'
                }));
              } catch (error) {
                console.error('Error in Resend API middleware:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Internal server error',
                  message: error instanceof Error ? error.message : 'Unknown error' 
                }));
              }
            });
          } catch (error) {
            console.error('Error parsing request:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body' }));
          }
        });
      }
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  };
});
