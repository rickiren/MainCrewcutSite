import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatBubbleProps {
  currentHTML: string;
  currentCSS: string;
  onHTMLUpdate: (html: string, css: string) => void;
  apiKey?: string;
}

export function AIChatBubble({ currentHTML, currentCSS, onHTMLUpdate, apiKey }: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Claude, your AI assistant. I can help you modify your overlay with natural language. Try asking me to:\n\n• Change colors or text\n• Add new elements\n• Adjust sizes and positions\n• Modify styling\n\nWhat would you like to change?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Claude API with context
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: `You are an expert HTML/CSS overlay designer for streaming platforms like Kick.

Current HTML:
\`\`\`html
${currentHTML || '(No HTML yet)'}
\`\`\`

Current CSS:
\`\`\`css
${currentCSS || '(No CSS yet)'}
\`\`\`

User request: ${input}

Please respond with:
1. A brief explanation of what you'll change
2. The complete updated HTML wrapped in \`\`\`html tags
3. The complete updated CSS wrapped in \`\`\`css tags (if CSS changes are needed)

Keep the changes minimal and focused on the user's request. Maintain the existing structure unless asked to change it.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.content[0].text;

      // Parse HTML and CSS from response
      const htmlMatch = assistantContent.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = assistantContent.match(/```css\n([\s\S]*?)\n```/);

      if (htmlMatch) {
        const newHTML = htmlMatch[1];
        const newCSS = cssMatch ? cssMatch[1] : currentCSS;

        // Apply the changes
        onHTMLUpdate(newHTML, newCSS);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Claude API:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. ${!apiKey ? '\n\n⚠️ Please set your Anthropic API key in the settings to use AI features.' : ''}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50 group"
        title="Ask Claude AI"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <Card
      className={`fixed right-6 bg-gray-900 border-gray-700 shadow-2xl z-50 flex flex-col transition-all ${
        isMinimized
          ? 'bottom-6 w-80 h-16'
          : 'bottom-6 w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Claude AI Assistant</h3>
            <p className="text-xs text-gray-400">Overlay Designer</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-200 border border-gray-700'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-400 font-semibold">Claude</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm text-gray-400">Claude is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 bg-gray-900/50">
            {!apiKey && (
              <div className="mb-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-xs text-yellow-400">
                ⚠️ API key not set. Add your Anthropic API key to use AI features.
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Claude to modify your overlay..."
                className="flex-1 bg-gray-800 border-gray-700 text-white text-sm resize-none focus:border-purple-500"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white self-end"
                size="sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
