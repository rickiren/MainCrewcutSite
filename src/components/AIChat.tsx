import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { claudeAPI, ClaudeMessage } from '@/services/claudeApi';
import { subscribeToNewsletter } from '@/services/emailSubscription';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  onExpandedChange?: (expanded: boolean) => void;
}

const AIChat = ({ onExpandedChange }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationStage, setConversationStage] = useState<'initial' | 'followup' | 'email_collection'>('initial');
  const [collectedEmail, setCollectedEmail] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Email configuration

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if message contains an email
  const extractEmail = (text: string): string | null => {
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  };

  // Send PDF report email and store contact
  const sendPDFReport = async (email: string, businessContext: string) => {
    setIsSendingEmail(true);
    
    try {
      // Store contact information
      const result = await subscribeToNewsletter({
        email,
        form_source: 'ai_chat',
        first_name: undefined,
        last_name: undefined,
        phone_number: undefined
      });
      
      console.log('Contact stored successfully:', result);
      
      // Add success message
      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Perfect! I've sent your personalized AI implementation guide to your email. You should receive it shortly. Feel free to ask me any follow-up questions about implementing these AI solutions in your business!",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      setConversationStage('followup');
      
    } catch (error) {
      console.error('Error storing contact:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I encountered an issue processing your request. Please try again or contact us directly at hello@wrlds.com",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingEmail(false);
    }
  };


  useEffect(() => {
    // Don't scroll the page - just expand the chat in place
    // Notify parent component of expanded state change
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Expand the chat if this is the first message
    if (!isExpanded) {
      setIsExpanded(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if user provided an email
      const email = extractEmail(inputValue);
      
      if (email && conversationStage === 'initial') {
        // User provided email, send PDF report
        setCollectedEmail(email);
        setConversationStage('email_collection');
        await sendPDFReport(email, messages[0]?.content || 'Business consultation');
        setIsLoading(false);
        return;
      }

      // Convert messages to Claude format
      const conversationHistory: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes("I'm sorry, I encountered an error"))
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Dynamic system prompt based on conversation stage
      let systemPrompt = '';
      
      if (conversationStage === 'initial') {
        systemPrompt = `You are Crewcut AI — a witty but compassionate business consultant. Your job is to show companies how AI can cut costs, save time, and streamline teams in ways that are easy to understand.

When a user describes their business:
	•	Give exactly 3 specific, actionable ways they can use AI to reduce expenses, save hours, or operate with a leaner team.
	•	Use simple, clear language that anyone can understand — avoid jargon.
	•	Show compassion: frame team reduction as freeing people up for higher-value work, not cold replacement.
	•	Mention concrete AI tools or approaches when relevant.
	•	Format with clear numbered points.
	•	End every response with:
"We can generate you a full PDF report with step-by-step instructions on how to do this — just tell us the best email to send it to."`;
      } else {
        // Follow-up conversation mode
        systemPrompt = `You are Crewcut AI — a helpful business consultant. The user has already received their initial AI recommendations and PDF report. Now you're in follow-up conversation mode.

Your role is to:
	•	Answer any questions they have about implementing the AI solutions
	•	Provide additional insights and clarification
	•	Help them think through specific challenges
	•	Be conversational and helpful
	•	If they want to discuss a new business challenge, you can provide fresh AI recommendations
	•	Keep responses concise but informative

Be friendly, professional, and genuinely helpful. You're here to support their AI implementation journey.`;
      }

      const response = await claudeAPI.chat(inputValue, conversationHistory, systemPrompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation stage after first response
      if (conversationStage === 'initial') {
        setConversationStage('followup');
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "I'm sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleInputFocus - no longer auto-expands on focus

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Chat Input - Always visible at top */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <div className="bg-[#242424] border-2 border-black rounded-xl p-4 shadow-sm w-full">
          <div className="text-xs text-gray-400 mb-2 text-center">
            {conversationStage === 'initial' && "💡 Describe your business type, size, and current pain points for personalized AI solutions"}
            {conversationStage === 'email_collection' && "📧 Please provide your email address to receive your personalized AI implementation guide"}
            {conversationStage === 'followup' && "💬 Ask me anything about implementing AI solutions in your business"}
          </div>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() && !isLoading) {
                  handleSubmit(e as any);
                }
              }
            }}
            placeholder={
              conversationStage === 'initial' 
                ? "Describe your business (industry, size, current challenges) — we'll instantly reveal 3 AI solutions to save you money..."
                : conversationStage === 'email_collection'
                ? "Enter your email address (e.g., john@company.com)"
                : "Ask me anything about AI implementation, or describe a new business challenge..."
            }
            className="w-full resize-none border-none outline-none text-white placeholder-gray-400 text-sm caret-orange-500 bg-transparent"
            rows={3}
            disabled={isLoading || isSendingEmail}
            autoFocus
          />

          {/* Send Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isSendingEmail}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={
                isSendingEmail 
                  ? "Sending email..." 
                  : conversationStage === 'email_collection' 
                    ? "Send email" 
                    : "Send message"
              }
            >
              {isSendingEmail ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : conversationStage === 'email_collection' ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Chat Messages - Appears below input and pushes content down */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden relative"
            style={{ zIndex: 1 }}
          >
            {/* Messages Container */}
            <div className="bg-black/80 border-2 border-black rounded-xl p-4 mb-4 min-h-[12rem] max-h-80 overflow-y-auto shadow-sm relative w-full">
              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors z-10"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Reset Button - Show when in followup mode */}
              {conversationStage === 'followup' && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setConversationStage('initial');
                    setCollectedEmail('');
                  }}
                  className="absolute top-2 right-12 p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full transition-colors z-10"
                  title="Start new conversation"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}

              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-xl ${message.role === 'user'
                        ? 'bg-gray-800 text-white ml-auto'
                        : 'bg-white/80 text-black border-2 border-purple-400'
                        }`}
                    >
                      <p className={`text-sm leading-relaxed ${message.role === 'assistant' ? 'whitespace-pre-line' : ''
                        }`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-blue-400 text-xs ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {isSendingEmail && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-gradient-to-br from-green-800 to-green-900 border border-green-700 p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-green-400 text-xs ml-2">Sending your AI guide...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChat;
