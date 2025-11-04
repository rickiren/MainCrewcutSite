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
  | 'welcome'           // Introduce AI, ask for name
  | 'discovery'         // Understand business needs
  | 'solutions'         // Provide 3 AI solutions
  | 'email_collection'  // Ask for email for detailed guide
  | 'phone_collection'  // Optional: ask for phone
  | 'qualification'     // Budget, timeline, decision-maker
  | 'followup';         // General support

interface AIChatProps {
  onExpandedChange?: (expanded: boolean) => void;
}

const AIChat = ({ onExpandedChange }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationStage, setConversationStage] = useState<ConversationStage>('welcome');
  const [leadData, setLeadData] = useState<LeadData>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
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

  // Send PDF report email and store contact with all collected lead data
  const sendPDFReport = async () => {
    if (!leadData.email) {
      console.error('Cannot send PDF report: email not collected');
      return;
    }

    setIsSendingEmail(true);

    try {
      // Store contact information with all collected lead data
      const result = await subscribeToNewsletter({
        email: leadData.email,
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

      console.log('Contact stored successfully:', result);
      console.log('Lead data collected:', leadData);

      // Personalized success message
      const firstName = leadData.firstName || 'there';
      let successContent = `Perfect${leadData.firstName ? ', ' + leadData.firstName : ''}! I've sent your personalized AI implementation guide to ${leadData.email}. You should receive it in the next few minutes.`;

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

      // Move to phone collection if we don't have phone yet, otherwise qualification
      if (!leadData.phone) {
        setConversationStage('phone_collection');
      } else if (!leadData.timeline) {
        setConversationStage('qualification');
      } else {
        setConversationStage('followup');
      }

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

      // Store business context on first discovery message
      if (conversationStage === 'discovery' && !leadData.businessContext) {
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
      // STAGE-SPECIFIC LOGIC - Handle transitions and special actions
      // ============================================================================

      // Welcome stage: Look for name, then progress to discovery
      if (conversationStage === 'welcome' && detectedFirstName) {
        setLeadData(prev => ({ ...prev, firstName: detectedFirstName }));
        // AI will acknowledge name and ask about business in its response
      }

      // Email collection stage: If email detected, send PDF report
      if (conversationStage === 'email_collection' && detectedEmail) {
        setLeadData(prev => ({ ...prev, email: detectedEmail }));
        await sendPDFReport();
        setIsLoading(false);
        return; // sendPDFReport handles the success message and stage transition
      }

      // Phone collection stage: If phone detected, acknowledge and move to qualification
      if (conversationStage === 'phone_collection' && detectedPhone) {
        setLeadData(prev => ({ ...prev, phone: detectedPhone }));
        // AI will acknowledge and move to qualification
      }

      // Qualification stage: Extract timeline, budget, decision-maker status
      if (conversationStage === 'qualification') {
        const lowerInput = currentInput.toLowerCase();

        // Timeline detection
        if (!leadData.timeline) {
          if (lowerInput.includes('next month') || lowerInput.includes('asap') || lowerInput.includes('immediately')) {
            detectedData.timeline = 'Next month';
          } else if (lowerInput.includes('next quarter') || lowerInput.includes('3 months') || lowerInput.includes('few months')) {
            detectedData.timeline = 'Next quarter';
          } else if (lowerInput.includes('exploring') || lowerInput.includes('researching') || lowerInput.includes('just looking')) {
            detectedData.timeline = 'Exploring';
          }
        }

        // Budget detection
        if (!leadData.budget && (lowerInput.includes('$') || lowerInput.includes('budget') || lowerInput.includes('allocated'))) {
          if (lowerInput.includes('no budget') || lowerInput.includes('research phase')) {
            detectedData.budget = 'Research phase';
          } else {
            detectedData.budget = 'Budget allocated';
          }
        }

        // Decision maker detection
        if (leadData.decisionMaker === undefined) {
          if (lowerInput.includes('founder') || lowerInput.includes('ceo') || lowerInput.includes('owner') || lowerInput.includes('my decision') || lowerInput.includes("it's my call")) {
            detectedData.decisionMaker = true;
          } else if (lowerInput.includes('team') || lowerInput.includes('others involved') || lowerInput.includes('need approval')) {
            detectedData.decisionMaker = false;
          }
        }

        // Update lead data
        if (Object.keys(detectedData).length > 0) {
          setLeadData(prev => ({ ...prev, ...detectedData }));
        }
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
      const userEmail = leadData.email || detectedData.email || '';

      if (conversationStage === 'welcome') {
        systemPrompt = `You are Crewcut AI — a friendly, witty business consultant who helps companies unlock hidden profit through AI automation.

${userName ? `The user just told you their name is ${userName}.` : 'This is your first interaction with a potential client.'}

Your goal:
${userName
  ? `• Greet ${userName} warmly by name\n• Ask about their business in a conversational way\n• Example: "Great to meet you, ${userName}! Tell me about your business - what industry are you in and what's your biggest challenge right now?"\n• Keep it SHORT - 2-3 sentences max`
  : `• Introduce yourself briefly (1 sentence)\n• Ask for their first name in a natural way\n• Example: "Hi! I'm Crewcut AI, and I help businesses cut costs and boost efficiency with AI. What should I call you?"\n• Keep it SHORT - 2 sentences max`
}

DO NOT ask multiple questions at once. Just get their name OR ask about their business (depending on if you have their name).`;
      } else if (conversationStage === 'discovery') {
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'}. ${leadData.businessContext ? 'You are learning about their business.' : 'You need to understand their business to help them.'}

Your goal is to discover their business situation:
• Ask thoughtful questions to understand:
  - Industry/business type
  - Team size or company size
  - Current biggest pain points or challenges
• Keep it conversational - like a consultant getting to know a client
• DON'T immediately jump to solutions - gather info first
• DON'T ask for email yet
• Show genuine interest and empathy

${leadData.businessContext ? 'You have some context. Ask 1-2 follow-up questions to clarify their challenges before providing solutions.' : 'Start by asking what type of business they run and their main challenges.'}`;
      } else if (conversationStage === 'solutions') {
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'} who runs ${leadData.businessContext || 'a business'}.

Your goal is to provide immediate value:
• Acknowledge their specific challenges
• Provide exactly 3 specific, actionable AI solutions tailored to their business
• For each solution:
  - Specific AI tool or approach (e.g., "Make.com + Claude API")
  - Concrete time/cost savings estimate
  - Implementation complexity (Low/Medium/High)
  - Brief 1-sentence description
• Use clear, jargon-free language
• Show ROI potential clearly

After providing solutions, naturally transition:
"These are just the high-level opportunities I can see${userName ? ', ' + userName : ''}. I can create a detailed implementation guide with step-by-step instructions, specific tool recommendations, and ROI calculations tailored to your ${businessInfo}. Where should I send that? What's your email?"

Make the email ask feel natural, not like a form field.`;
      } else if (conversationStage === 'email_collection') {
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'}. They should be providing their email address.

${detectedEmail
  ? `They just provided their email: ${detectedEmail}. Acknowledge it and confirm the guide is being sent.`
  : `Gently remind them to share their email address so you can send the detailed implementation guide.`
}

Keep it brief and friendly.`;
      } else if (conversationStage === 'phone_collection') {
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'}. You've just sent them the implementation guide to ${userEmail}.

Your goal:
• Thank them for their email (if just received)
• Naturally offer a consultation call
• Example: "I'd love to schedule a quick 15-minute call to walk you through the implementation and answer any questions. What's the best number to reach you?"
• Make it feel optional but valuable (free consultation, personalized guidance)
• If they provide a phone number, acknowledge it warmly
• If they decline, that's fine - move to asking about timeline

Keep it conversational and low-pressure.`;
      } else if (conversationStage === 'qualification') {
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'} from ${leadData.company || 'their company'}. You've provided solutions and collected contact info.

Your goal is to understand project fit. Ask ONE question at a time:

${!leadData.timeline
  ? `Ask about timeline: "When are you looking to implement AI solutions - next month, next quarter, or just exploring for now?"`
  : !leadData.budget
  ? `Ask about budget: "Have you allocated budget for AI automation, or are we in the research phase?"`
  : leadData.decisionMaker === undefined
  ? `Ask about decision-making: "Are you the main decision-maker on this, or will others need to be involved?"`
  : 'You have all qualification info. Summarize next steps based on their answers.'
}

Keep it conversational and consultative, not interrogative.

${leadData.timeline && leadData.budget && leadData.decisionMaker !== undefined
  ? `Based on their profile:\n- Timeline: ${leadData.timeline}\n- Budget: ${leadData.budget}\n- Decision maker: ${leadData.decisionMaker ? 'Yes' : 'Needs approval'}\n\nProvide appropriate next steps:\n- Hot lead (soon + budget + decision-maker): Suggest booking a call\n- Warm lead (3-6 months): Offer to stay in touch\n- Cold lead (exploring): Provide educational content`
  : ''
}`;
      } else {
        // Follow-up conversation mode
        systemPrompt = `You are Crewcut AI speaking with ${userName || 'a potential client'}. You've provided AI recommendations and collected their contact info. Now you're in support mode.

Your role:
• Answer implementation questions
• Provide additional insights
• Help troubleshoot challenges
• Suggest specific tools and resources
• If they describe a NEW challenge, treat it as a new discovery phase
• Be genuinely helpful and build long-term relationship
• Keep responses concise but informative

You're not just here to capture leads - you're here to be a valuable resource.`;
      }

      const response = await claudeAPI.chat(currentInput, conversationHistory, systemPrompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // ============================================================================
      // STAGE PROGRESSION LOGIC
      // ============================================================================
      // Progress to next stage based on collected data
      if (conversationStage === 'welcome' && detectedFirstName) {
        setConversationStage('discovery');
      } else if (conversationStage === 'discovery' && leadData.businessContext && messages.length >= 4) {
        // After some back-and-forth in discovery, move to solutions
        setConversationStage('solutions');
      } else if (conversationStage === 'solutions' && messages.length >= 6) {
        // After providing solutions, ask for email
        setConversationStage('email_collection');
      } else if (conversationStage === 'phone_collection' && (detectedPhone || messages.filter(m => m.role === 'assistant').length >= 8)) {
        // If phone provided or user declines, move to qualification
        setConversationStage('qualification');
      } else if (conversationStage === 'qualification' && leadData.timeline && leadData.budget !== undefined && leadData.decisionMaker !== undefined) {
        // All qualification data collected, move to followup
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
            {conversationStage === 'welcome' && "👋 Let's unlock hidden profit in your business with AI"}
            {conversationStage === 'discovery' && "💡 Tell me about your business challenges"}
            {conversationStage === 'solutions' && "🎯 Getting your personalized AI solutions ready..."}
            {conversationStage === 'email_collection' && "📧 Share your email to receive your implementation guide"}
            {conversationStage === 'phone_collection' && "📞 Optional: Get a free consultation call"}
            {conversationStage === 'qualification' && "🎯 Let's make sure you get the right solution"}
            {conversationStage === 'followup' && "💬 Ask me anything about implementing AI in your business"}
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
              conversationStage === 'welcome'
                ? "Hi! What should I call you?"
                : conversationStage === 'discovery'
                ? "Tell me about your business - industry, team size, and biggest challenges..."
                : conversationStage === 'solutions'
                ? "Any questions about these solutions?"
                : conversationStage === 'email_collection'
                ? "Enter your email (e.g., sarah@company.com)"
                : conversationStage === 'phone_collection'
                ? "Best number to reach you? (e.g., 555-123-4567)"
                : conversationStage === 'qualification'
                ? "Share your timeline, budget, or decision-making process..."
                : "Ask me anything about AI implementation..."
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
                    setConversationStage('welcome');
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
