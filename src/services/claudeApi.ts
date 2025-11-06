interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
}

interface ClaudeResponse {
  content: ClaudeMessage[];
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeAPIService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.defaultModel = 'claude-3-sonnet-20240229';
  }

  private async makeRequest(requestBody: ClaudeRequest): Promise<any> {
    try {
      // In development, use local API route. In production, try Firebase Function URL first, then fallback to Vercel API route
      const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
      const firebaseFunctionUrl = import.meta.env.VITE_FIREBASE_FUNCTION_URL;
      
      // Prioritize local API route in development, Firebase URL in production
      const apiUrl = isDevelopment ? '/api/claude' : (firebaseFunctionUrl || '/api/claude');
      
      console.log('🔌 Calling Claude API at:', apiUrl);
      
      // Call our backend function
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: requestBody.messages[requestBody.messages.length - 1].content,
          conversationHistory: requestBody.messages.slice(0, -1),
          systemPrompt: requestBody.system
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling backend:', error);
      // If API is not available, provide a helpful message
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        throw new Error('AI chat is currently unavailable. Please contact us directly using the contact form below.');
      }
      throw error;
    }
  }

  async chat(
    userMessage: string,
    conversationHistory: ClaudeMessage[] = [],
    systemPrompt?: string
  ): Promise<string> {
    const messages: ClaudeMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const requestBody: ClaudeRequest = {
      model: this.defaultModel,
      max_tokens: 1000,
      messages,
      ...(systemPrompt && { system: systemPrompt })
    };

    try {
      const response = await this.makeRequest(requestBody);
      if (response?.text && typeof response.text === 'string') {
        return response.text;
      }
      throw new Error('No response text received from backend');
    } catch (error) {
      console.error('Error in Claude chat:', error);
      throw error;
    }
  }

  // Method to check if API is properly configured
  isConfigured(): boolean {
    return true; // Backend handles the API key
  }

  // Method to get API configuration status
  getConfigStatus(): { configured: boolean; model: string } {
    return {
      configured: true,
      model: this.defaultModel
    };
  }

  // Vision analysis method
  async analyzeImage(
    imageData: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    // Extract base64 data and media type from data URL
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image data format');
    }

    const mediaType = matches[1];
    const base64Data = matches[2];

    const content: ContentBlock[] = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      },
      {
        type: 'text',
        text: prompt,
      },
    ];

    const messages: ClaudeMessage[] = [
      { role: 'user', content }
    ];

    const requestBody: ClaudeRequest = {
      model: 'claude-3-sonnet-20240229', // Vision requires Claude 3
      max_tokens: 2000,
      messages,
      ...(systemPrompt && { system: systemPrompt })
    };

    try {
      const response = await this.makeRequest(requestBody);
      if (response?.text && typeof response.text === 'string') {
        return response.text;
      }
      throw new Error('No response text received from backend');
    } catch (error) {
      console.error('Error in Claude vision analysis:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const claudeAPI = new ClaudeAPIService();

// Export types for use in components
export type { ClaudeMessage, ClaudeRequest, ClaudeResponse, ContentBlock };
