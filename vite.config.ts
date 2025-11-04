import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add middleware to handle API requests during development
    middlewareMode: false,
    warmup: {
      clientFiles: ['./src/main.tsx']
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Custom plugin to handle /api/claude during development
    mode === 'development' && {
      name: 'dev-api-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/claude' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const { userMessage, conversationHistory, systemPrompt } = JSON.parse(body);

                const apiKey = process.env.ANTHROPIC_API_KEY;
                if (!apiKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Claude API key not configured' }));
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
                  throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const text = Array.isArray(data?.content)
                  ? data.content
                    .map((block) => (block?.type === 'text' && typeof block?.text === 'string' ? block.text : ''))
                    .filter(Boolean)
                    .join('\n\n')
                  : '';

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ text, usage: data.usage }));
              } catch (error) {
                console.error('Error calling Claude API:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
