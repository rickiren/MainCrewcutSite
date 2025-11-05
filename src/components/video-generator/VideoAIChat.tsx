import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { claudeAPI } from '@/services/claudeApi';
import { ScriptLine, VideoStyle } from '@/types/video';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VideoAIChatProps {
  currentScript: ScriptLine[];
  currentStyle: VideoStyle;
  onUpdateVideo: (updates: {
    scriptLines?: ScriptLine[];
    style?: Partial<VideoStyle>;
  }) => void;
}

export const VideoAIChat: React.FC<VideoAIChatProps> = ({
  currentScript,
  currentStyle,
  onUpdateVideo,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI video assistant. I can help you create and customize videos. Try telling me:\n\n• \"Create a video about [topic]\"\n• \"Change the colors to ocean blue\"\n• \"Make it 5 seconds per scene\"\n• \"Add a scene that says [text]\"\n\nWhat would you like to create today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildSystemPrompt = () => {
    return `You are an AI assistant that helps users create and customize animated videos. Your job is to understand their requests and return structured JSON that will update the video configuration.

CURRENT VIDEO STATE:
Script Lines: ${JSON.stringify(currentScript, null, 2)}
Style: ${JSON.stringify(currentStyle, null, 2)}

CAPABILITIES:
1. Create/modify script lines (scenes with text and duration)
2. Change colors (primary, secondary, accent, text color)
3. Change font family
4. Change animation speed (0.5 to 2.0)
5. Change scene type (3d cinematic with floating glass cards, or 2d classic)
6. Change background style for 2D (3d-cards, gradient, solid)
7. Change text style (solid, gradient)

RESPONSE FORMAT:
You must respond with TWO parts:

1. A friendly conversational message to the user
2. A JSON object with changes (if any)

Format your response EXACTLY like this:
[MESSAGE]
Your friendly message here
[/MESSAGE]

[JSON]
{
  "scriptLines": [...] // only include if script should change
  "style": { ... }     // only include style properties that should change
}
[/JSON]

RULES:
- Always include [MESSAGE] and [/MESSAGE] tags with a friendly response
- Only include [JSON] section if you're making changes to the video
- In JSON, only include fields that should be updated
- Script lines must have: id, text, duration
- Be conversational and helpful in your message
- If unclear, ask for clarification instead of making changes
- Suggest improvements when appropriate

EXAMPLES:

User: "Create a video about coffee"
[MESSAGE]
I've created a video about coffee with 3 engaging scenes! Each scene will display for 3 seconds with cinematic 3D effects. Would you like me to adjust the timing or change the colors?
[/MESSAGE]
[JSON]
{
  "scriptLines": [
    {"id": "1", "text": "Start Your Day Right", "duration": 3},
    {"id": "2", "text": "With Perfect Coffee", "duration": 3},
    {"id": "3", "text": "Every Single Morning", "duration": 3}
  ],
  "style": {
    "sceneType": "3d"
  }
}
[/JSON]

User: "Make it more cinematic with 3D effects"
[MESSAGE]
Awesome! I've switched to cinematic 3D mode. Your text now floats over beautiful glass cards that rotate in 3D space. The camera orbits around the scene for a stunning effect!
[/MESSAGE]
[JSON]
{
  "style": {
    "sceneType": "3d"
  }
}
[/JSON]

User: "Use classic 2D design instead"
[MESSAGE]
Got it! Switched to classic 2D design. This gives a cleaner, flatter look with your chosen background style.
[/MESSAGE]
[JSON]
{
  "style": {
    "sceneType": "2d"
  }
}
[/JSON]

User: "Make it ocean themed with blue colors"
[MESSAGE]
Beautiful! I've updated the colors to an ocean blue theme. The gradient goes from deep ocean blue to bright aqua. Should look great with your coffee video!
[/MESSAGE]
[JSON]
{
  "style": {
    "primaryColor": "#2E3192",
    "secondaryColor": "#1BFFFF",
    "accentColor": "#00D4FF"
  }
}
[/JSON]

User: "What colors are available?"
[MESSAGE]
I can set any colors you like! I have these presets ready:
• Purple Dream (purple/pink)
• Ocean Blue (blue/aqua)
• Sunset Orange (orange/yellow)
• Forest Green (green/teal)
• Pink Candy (pink/yellow)

Or tell me any colors you want and I'll customize them for you!
[/MESSAGE]

Now respond to the user's request below.`;
  };

  const parseAIResponse = (response: string) => {
    // Extract message
    const messageMatch = response.match(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/);
    const message = messageMatch ? messageMatch[1].trim() : response;

    // Extract JSON
    const jsonMatch = response.match(/\[JSON\]([\s\S]*?)\[\/JSON\]/);
    let updates = null;

    if (jsonMatch) {
      try {
        updates = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error('Failed to parse AI JSON response:', e);
      }
    }

    return { message, updates };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    try {
      // Build conversation history for Claude
      const conversationHistory = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Claude API
      const response = await claudeAPI.chat(
        userMessage,
        conversationHistory.slice(0, -1), // Exclude the last user message (it's passed separately)
        buildSystemPrompt()
      );

      // Parse response
      const { message: aiMessage, updates } = parseAIResponse(response);

      // Add AI message
      setMessages([...newMessages, { role: 'assistant', content: aiMessage }]);

      // Apply updates if any
      if (updates) {
        onUpdateVideo(updates);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again or rephrase your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        size="lg"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Video Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your video..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: "Create a video about [topic]" or "Change to ocean colors"
        </p>
      </div>
    </div>
  );
};
