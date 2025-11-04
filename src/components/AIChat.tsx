import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { claudeAPI, ClaudeMessage } from '@/services/claudeApi';
import { subscribeToNewsletter } from '@/services/emailSubscription';
import { sendAIImplementationGuide } from '@/services/resendService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface LeadData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  businessType?: string;
  teamSize?: string;
  budget?: string;
  timeline?: string;
  decisionMaker?: boolean;
  businessContext?: string; // Store initial business description
}

type ConversationStage =
  | 'initial'           // Ask about business, provide solutions immediately
  | 'email_collection'  // Collect email/phone for detailed guide
  | 'followup';         // General support after contact collected

interface AIChatProps {
  onExpandedChange?: (expanded: boolean) => void;
}

const AIChat = ({ onExpandedChange }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial');
  const [leadData, setLeadData] = useState<LeadData>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [aiSolutionsText, setAiSolutionsText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EXTRACTION FUNCTIONS - Auto-detect contact info from user messages
  // ============================================================================

  // Extract first name from greeting patterns
  const extractFirstName = (text: string): string | null => {
    const patterns = [
      /(?:my name is|i'm|i am|this is|call me)\s+([a-z]+)/i,
      /^([A-Z][a-z]+)$/,  // Just a capitalized name
      /^hi,?\s*(?:my name is)?\s*([A-Z][a-z]+)/i,
      /^([A-Z][a-z]+)[,\s]/i  // Name at start followed by comma or space
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 1) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      }
    }
    return null;
  };

  // Extract email address
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const extractEmail = (text: string): string | null => {
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  };

  // Extract phone number
  const extractPhone = (text: string): string | null => {
    const phonePatterns = [
      /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/,     // 123-456-7890
      /\b(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})\b/,     // (123) 456-7890
      /\b(\+?1?\s*\d{10,})\b/                     // International format
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract company name from context
  const extractCompany = (text: string): string | null => {
    const patterns = [
      /(?:i work at|i'm with|i'm from|company is|our company)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+(?:and|in|as|with|where|that|which)|[,.]|$)/i,
      /(?:at|for)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+(?:and|in|as|with|where|that|which)|[,.]|$)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        return match[1].trim();
      }
    }
    return null;
  };

  // Extract team size indicators
  const extractTeamSize = (text: string): string | null => {
    const patterns = [
      /(\d+)[-\s]person\s+(?:team|company|business)/i,
      /team\s+of\s+(\d+)/i,
      /we\s+(?:have|are)\s+(\d+)\s+(?:people|employees|team members)/i,
      /(\d+)\s+employees/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] + ' people';
    }
    return null;
  };

  // Send AI implementation guide email and store contact with all collected lead data
  const sendPDFReport = async (emailToUse?: string) => {
    const email = emailToUse || leadData.email;

    if (!email) {
      console.error('Cannot send PDF report: email not provided');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Store contact information with all collected lead data
      const subscriptionResult = await subscribeToNewsletter({
        email: email,
        form_source: 'ai_chat',
        first_name: leadData.firstName,
        last_name: leadData.lastName,
        phone_number: leadData.phone,
        // Additional metadata
        company: leadData.company,
        business_type: leadData.businessType,
        team_size: leadData.teamSize,
        budget: leadData.budget,
        timeline: leadData.timeline,
        decision_maker: leadData.decisionMaker
      });

      console.log('Contact stored successfully:', subscriptionResult);
      console.log('Lead data collected:', { ...leadData, email });

      // Send the AI implementation guide email
      try {
        await sendAIImplementationGuide({
          email: email,
          firstName: leadData.firstName,
          businessType: leadData.businessType,
          aiSolutions: aiSolutionsText
        });
        console.log('✅ AI implementation guide sent successfully to', email);
      } catch (emailError) {
        console.error('❌ Error sending AI implementation guide:', emailError);
        // Don't fail the whole flow if email fails - just log it
      }

      // Personalized success message
      let successContent = `Perfect${leadData.firstName ? ', ' + leadData.firstName : ''}! I've sent your personalized AI implementation guide to ${email}. You should receive it in the next few minutes.`;

      // If we have phone, mention callback
      if (leadData.phone) {
        successContent += `\n\nI'll have someone from our team give you a call at ${leadData.phone} to discuss implementation and answer any questions.`;
      }

      successContent += '\n\nFeel free to ask me anything in the meantime!';

      const successMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: successContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);

      // Move directly to followup mode
      setConversationStage('followup');

    } catch (error) {
      console.error('Error processing request:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I encountered an issue processing your request. Please try again or contact us directly at hello@crewcut.ai",
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
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // ============================================================================
      // EXTRACT ALL POSSIBLE DATA FROM USER MESSAGE
      // ============================================================================
      const detectedData: Partial<LeadData> = {};

      const detectedFirstName = extractFirstName(currentInput);
      const detectedEmail = extractEmail(currentInput);
      const detectedPhone = extractPhone(currentInput);
      const detectedCompany = extractCompany(currentInput);
      const detectedTeamSize = extractTeamSize(currentInput);

      if (detectedFirstName && !leadData.firstName) detectedData.firstName = detectedFirstName;
      if (detectedEmail && !leadData.email) detectedData.email = detectedEmail;
      if (detectedPhone && !leadData.phone) detectedData.phone = detectedPhone;
      if (detectedCompany && !leadData.company) detectedData.company = detectedCompany;
      if (detectedTeamSize && !leadData.teamSize) detectedData.teamSize = detectedTeamSize;

      // Store business context on first message
      if (conversationStage === 'initial' && !leadData.businessContext && messages.length === 0) {
        detectedData.businessContext = currentInput;
        // Extract business type from context
        if (currentInput.toLowerCase().includes('agency')) detectedData.businessType = 'Agency';
        else if (currentInput.toLowerCase().includes('ecommerce') || currentInput.toLowerCase().includes('e-commerce')) detectedData.businessType = 'E-commerce';
        else if (currentInput.toLowerCase().includes('saas')) detectedData.businessType = 'SaaS';
        else if (currentInput.toLowerCase().includes('consulting')) detectedData.businessType = 'Consulting';
        else if (currentInput.toLowerCase().includes('retail')) detectedData.businessType = 'Retail';
        // Add more as needed
      }

      // Update lead data with any detected information
      if (Object.keys(detectedData).length > 0) {
        setLeadData(prev => ({ ...prev, ...detectedData }));
      }

      // ============================================================================
      // STAGE-SPECIFIC LOGIC - Handle email/phone detection and PDF sending
      // ============================================================================

      // If email detected at any stage before followup, send PDF report
      if (detectedEmail && conversationStage !== 'followup') {
        setLeadData(prev => ({ ...prev, email: detectedEmail }));
        await sendPDFReport(detectedEmail);
        setIsLoading(false);
        return; // sendPDFReport handles the success message and stage transition
      }

      // ============================================================================
      // BUILD CONVERSATION HISTORY AND SYSTEM PROMPT
      // ============================================================================
      const conversationHistory: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes("I'm sorry, I encountered an error"))
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Dynamic system prompt based on conversation stage
      let systemPrompt = '';
      const userName = leadData.firstName || detectedData.firstName || '';
      const businessInfo = leadData.businessType || 'business';

      if (conversationStage === 'initial') {
        // First interaction - provide value FAST
        if (messages.length === 0) {
          // Very first message - ask about business
          systemPrompt = `You are Crewcut AI — a direct, value-focused AI consultant.

Your ONE job: Show people how to use AI to make more money in their business TODAY.

The user just arrived. Keep it SUPER short (1-2 sentences):
• Ask what type of business they run
• Example: "Tell me about your business and I'll show you 3 ways to use AI to make more money today."

DO NOT introduce yourself with fluff. Get straight to the point.`;
        } else {
          // They've described their business - provide solutions IMMEDIATELY
          systemPrompt = `You are Crewcut AI. The user described their business: "${leadData.businessContext || currentInput}"

Your goal: Show them how to make MORE MONEY with AI TODAY.

Provide exactly 3 specific, money-making AI solutions:
• Each solution should focus on REVENUE or COST SAVINGS (be specific with $ amounts)
• Mention specific AI tools (ChatGPT, Claude, Make.com, Zapier, etc.)
• Keep each solution to 2-3 sentences MAX
• Use this format:
  1. **[Solution Name]**: [What it does] → [Saves $X/month OR Makes $X/month]

After the 3 solutions, end with:
"Want the full implementation guide with step-by-step instructions? Just drop your email${userName ? ', ' + userName : ''} and I'll send it over. (Or share your phone if you want us to call and walk you through it)"

Be enthusiastic but not salesy. Focus on VALUE and MONEY.`;
        }
      } else if (conversationStage === 'email_collection') {
        // Waiting for contact info
        systemPrompt = `You are Crewcut AI. You've shown them how to make money with AI. Now you're waiting for their email/phone.

${detectedEmail
  ? `They just shared their email: ${detectedEmail}. Acknowledge it enthusiastically and confirm the guide is being sent.`
  : `They haven't shared contact info yet. Gently remind them: "Just share your email or phone number and I'll send you the full implementation guide!"`
}

Keep it brief and upbeat.`;
      } else {
        // Follow-up mode - they've received the guide
        systemPrompt = `You are Crewcut AI${userName ? ' speaking with ' + userName : ''}. You've shown them AI money-making opportunities and sent them the implementation guide.

Your role:
• Answer any questions about implementation
• Provide specific tool recommendations
• Help them get started TODAY
• If they ask a new question about their business, give them MORE money-making AI ideas
• Keep responses SHORT and ACTION-oriented

Focus on helping them IMPLEMENT and MAKE MONEY, not just theory.`;
      }

      const response = await claudeAPI.chat(currentInput, conversationHistory, systemPrompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Capture AI solutions text if this is the initial stage (providing solutions)
      if (conversationStage === 'initial' && messages.length >= 1 && response.length > 100) {
        // This is likely the AI providing the 3 solutions
        setAiSolutionsText(response);
      }

      // ============================================================================
      // STAGE PROGRESSION LOGIC
      // ============================================================================
      // Simple progression: initial → email_collection → followup
      if (conversationStage === 'initial' && messages.length >= 2) {
        // After AI provides solutions (2+ messages), move to email collection stage
        setConversationStage('email_collection');
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
            {conversationStage === 'initial' && "💰 Discover how AI can make you more money today"}
            {conversationStage === 'email_collection' && "📧 Get your free implementation guide"}
            {conversationStage === 'followup' && "💬 Ask me anything about implementing AI"}
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
                ? "What type of business do you run?"
                : conversationStage === 'email_collection'
                ? "Your email or phone number..."
                : "Ask me anything..."
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
                    setLeadData({});
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
