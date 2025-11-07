import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { claudeAPI, ClaudeMessage } from '@/services/claudeApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatBubbleProps {
  currentHTML: string;
  currentCSS: string;
  onHTMLUpdate: (html: string, css: string) => void;
}

export function AIChatBubble({ currentHTML, currentCSS, onHTMLUpdate }: AIChatBubbleProps) {
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
  const lastHTMLRef = useRef<string>('');
  const lastCSSRef = useRef<string>('');
  const htmlCSSInitializedRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset HTML/CSS tracking when chat closes or HTML/CSS changes externally
  useEffect(() => {
    if (!isOpen) {
      lastHTMLRef.current = '';
      lastCSSRef.current = '';
      htmlCSSInitializedRef.current = false;
    }
  }, [isOpen, currentHTML, currentCSS]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Build conversation history BEFORE adding the new message to state
    const conversationHistory: ClaudeMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })) as ClaudeMessage[];

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Always include current HTML/CSS to ensure AI has full context
      // This prevents the AI from removing content
      let userMessage = '';
      if (currentHTML || currentCSS) {
        userMessage = `Current overlay:

\`\`\`html
${currentHTML || ''}
\`\`\`

\`\`\`css
${currentCSS || ''}
\`\`\`

User request: ${currentInput}`;
      } else {
        userMessage = currentInput;
      }
      
      // Update refs
      lastHTMLRef.current = currentHTML;
      lastCSSRef.current = currentCSS;
      htmlCSSInitializedRef.current = true;

      // Enhanced system prompt with strong preservation instructions
      const systemPrompt = `You are an expert HTML/CSS overlay designer. You make PRECISE, MINIMAL edits.

CRITICAL RULES:
1. PRESERVE ALL existing content, elements, classes, IDs, and attributes
2. Make ONLY the specific change requested by the user
3. NEVER remove or delete anything unless explicitly asked
4. If user says "change X", keep everything else exactly the same
5. Always return the COMPLETE HTML and CSS (even if only one changed)

RESPONSE FORMAT:
1. Brief explanation (1 sentence)
2. Complete HTML in \`\`\`html code block
3. Complete CSS in \`\`\`css code block

Example: User says "change text color to blue"
- Keep ALL HTML exactly the same
- Only modify CSS color property
- Return complete HTML and CSS`;

      // Call Claude API using the service (same as other parts of the site)
      const assistantContent = await claudeAPI.chat(userMessage, conversationHistory, systemPrompt);

      // Parse HTML and CSS from response - try multiple patterns
      let htmlMatch = assistantContent.match(/```html\n([\s\S]*?)\n```/);
      let cssMatch = assistantContent.match(/```css\n([\s\S]*?)\n```/);
      
      // Try alternative patterns if first attempt fails
      if (!htmlMatch) {
        htmlMatch = assistantContent.match(/```html\s*\n([\s\S]*?)\n```/);
      }
      if (!htmlMatch) {
        htmlMatch = assistantContent.match(/<html>([\s\S]*?)<\/html>/i);
      }
      if (!htmlMatch && assistantContent.includes('<div') || assistantContent.includes('<span')) {
        // Try to extract HTML-like content
        const htmlStart = assistantContent.indexOf('<');
        const htmlEnd = assistantContent.lastIndexOf('>');
        if (htmlStart !== -1 && htmlEnd !== -1 && htmlEnd > htmlStart) {
          const potentialHTML = assistantContent.substring(htmlStart, htmlEnd + 1);
          if (potentialHTML.includes('<') && potentialHTML.includes('>')) {
            htmlMatch = [null, potentialHTML];
          }
        }
      }
      
      if (!cssMatch) {
        cssMatch = assistantContent.match(/```css\s*\n([\s\S]*?)\n```/);
      }
      if (!cssMatch) {
        cssMatch = assistantContent.match(/<style>([\s\S]*?)<\/style>/i);
      }

      // Apply changes if we found HTML, otherwise show the response as-is
      if (htmlMatch && htmlMatch[1]) {
        const newHTML = htmlMatch[1].trim();
        const newCSS = (cssMatch && cssMatch[1]) ? cssMatch[1].trim() : currentCSS;

        // Safety check: Don't apply if result seems empty or too different
        // This prevents accidental deletion
        const htmlLengthDiff = Math.abs(newHTML.length - (currentHTML?.length || 0));
        const isSignificantChange = htmlLengthDiff > (currentHTML?.length || 0) * 0.5; // More than 50% change
        
        // Safety check: Don't apply if result seems suspiciously small
        if (newHTML.length < 50 && currentHTML && currentHTML.length > 100) {
          // Result is suspiciously small - don't apply automatically
          const assistantMessage: Message = {
            role: 'assistant',
            content: assistantContent + '\n\n⚠️ Warning: The result seems incomplete (too small). Please review the changes above. If they look correct, you can manually copy the HTML/CSS from the code blocks.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          // Apply the changes immediately for real-time preview
          onHTMLUpdate(newHTML, newCSS);
          
          // Update refs to track the new HTML/CSS
          lastHTMLRef.current = newHTML;
          lastCSSRef.current = newCSS;
        
          // Extract explanation text (text before code blocks)
          const explanationMatch = assistantContent.match(/^([^`]*?)(?:```|$)/);
          const explanation = explanationMatch ? explanationMatch[1].trim() : '';
          
          // Show response with explanation
          const assistantMessage: Message = {
            role: 'assistant',
            content: explanation 
              ? `${explanation}\n\n✅ Changes have been applied to your overlay in real-time!`
              : "✅ Changes have been applied to your overlay in real-time!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        // If we couldn't parse HTML, show the full response
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent + '\n\n⚠️ Note: Could not automatically parse and apply changes. Please check the response above.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling Claude API:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`,
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
