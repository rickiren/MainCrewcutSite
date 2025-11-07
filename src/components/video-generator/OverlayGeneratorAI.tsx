import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X, Image as ImageIcon, Code, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from './ImageUploader';
import { HTMLTemplateLibrary } from './HTMLTemplateLibrary';
import { DraggableOverlayEditor } from './DraggableOverlayEditor';
import { claudeAPI } from '@/services/claudeApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageData?: string;
}

interface OverlayElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
}

interface OverlayConfig {
  html: string;
  css: string;
  elements: OverlayElement[];
}

interface OverlayGeneratorAIProps {
  onClose?: () => void;
}

export const OverlayGeneratorAI: React.FC<OverlayGeneratorAIProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI overlay designer. I can help you create custom overlays in three ways:\n\n1. 📸 Upload a screenshot of a design you like, and I'll analyze it\n2. 📝 Choose or provide an HTML template to customize\n3. 🎨 Use drag-and-drop to position elements\n\nYou can also give me prompts like:\n• \"Make the title bigger and blue\"\n• \"Add a gradient background\"\n• \"Move the button to the center\"\n\nWhat would you like to create?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    html: '',
    css: '',
    elements: [],
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildSystemPrompt = () => {
    return `You are an AI assistant that helps users create and customize overlay designs for videos. You can analyze design screenshots, modify HTML/CSS templates, and help position elements.

CURRENT OVERLAY STATE:
HTML: ${overlayConfig.html || 'None'}
CSS: ${overlayConfig.css || 'None'}
Elements: ${JSON.stringify(overlayConfig.elements, null, 2)}

CAPABILITIES:
1. Analyze design screenshots and suggest overlay configurations
2. Modify HTML and CSS to match user requests
3. Suggest element positions and styles
4. Generate complete overlay designs from descriptions

RESPONSE FORMAT:
You must respond with TWO parts:

1. A friendly conversational message to the user
2. A JSON object with overlay changes (if any)

Format your response EXACTLY like this:
[MESSAGE]
Your friendly message here
[/MESSAGE]

[JSON]
{
  "html": "...",  // only include if HTML should change
  "css": "...",   // only include if CSS should change
  "elements": [...] // only include if elements should change
}
[/JSON]

For image analysis, describe the design elements you see and suggest how to recreate them.

RULES:
- Always include [MESSAGE] and [/MESSAGE] tags
- Only include [JSON] section if making changes
- Be conversational and helpful
- Suggest improvements when appropriate
- When analyzing images, describe colors, layout, typography, and spacing

Now respond to the user's request.`;
  };

  const parseAIResponse = (response: string) => {
    const messageMatch = response.match(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/);
    const message = messageMatch ? messageMatch[1].trim() : response;

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

  const handleImageUpload = async (imageData: string, fileName: string) => {
    setUploadedImage(imageData);
    setIsAnalyzing(true);

    const userMessage = `I've uploaded a design screenshot (${fileName}). Please analyze it and help me recreate it as an overlay.`;
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, imageData },
    ];
    setMessages(newMessages);

    try {
      const response = await claudeAPI.analyzeImage(
        imageData,
        'Analyze this design screenshot. Describe the key visual elements including colors, layout, typography, spacing, and any notable design patterns. Suggest how to recreate this as an HTML/CSS overlay with specific color codes, font sizes, and positioning.',
        buildSystemPrompt()
      );

      const { message: aiMessage, updates } = parseAIResponse(response);

      setMessages([...newMessages, { role: 'assistant', content: aiMessage }]);

      if (updates) {
        setOverlayConfig((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I had trouble analyzing that image. Please try again or describe what you'd like to create.",
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
  };

  const handleTemplateSelect = (html: string, css: string) => {
    setOverlayConfig((prev) => ({
      ...prev,
      html,
      css,
    }));

    const templateMessage = 'I\'ve selected a template. You can now customize it with prompts or drag-and-drop!';
    setMessages([
      ...messages,
      { role: 'assistant', content: templateMessage },
    ]);
  };

  const handleElementsChange = (elements: OverlayElement[]) => {
    setOverlayConfig((prev) => ({
      ...prev,
      elements,
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const conversationHistory = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await claudeAPI.chat(
        userMessage,
        conversationHistory.slice(0, -1),
        buildSystemPrompt()
      );

      const { message: aiMessage, updates } = parseAIResponse(response);

      setMessages([...newMessages, { role: 'assistant', content: aiMessage }]);

      if (updates) {
        setOverlayConfig((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
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
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
        size="lg"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">AI Overlay Generator</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20"
            >
              Minimize
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Design Tools */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <Code className="w-4 h-4 mr-1" />
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0">
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
                          {msg.imageData && (
                            <img
                              src={msg.imageData}
                              alt="User upload"
                              className="w-full rounded mb-2"
                            />
                          )}
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
                      placeholder="Describe what you want..."
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
                    Try: "Make the title larger" or "Add a blue gradient"
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="image" className="flex-1 p-4 overflow-auto">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  uploadedImage={uploadedImage}
                  isAnalyzing={isAnalyzing}
                />
              </TabsContent>

              <TabsContent value="templates" className="flex-1 p-4 overflow-auto">
                <HTMLTemplateLibrary onTemplateSelect={handleTemplateSelect} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview & Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {overlayConfig.html ? (
              <DraggableOverlayEditor
                html={overlayConfig.html}
                css={overlayConfig.css}
                onElementsChange={handleElementsChange}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No overlay yet</p>
                  <p className="text-sm mt-2">
                    Upload an image, select a template, or describe what you want
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
