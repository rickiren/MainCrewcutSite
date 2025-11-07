# AI Chat Setup Guide

## Claude AI API Integration

The chat component is now integrated with Claude AI API to provide intelligent responses about custom AI & SaaS tools.

### Setup Instructions

1. **Get a Claude API Key**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in to your account
   - Navigate to API Keys section
   - Create a new API key

2. **Configure Environment Variable**
   - Create a `.env` file in your project root (if it doesn't exist)
   - Add your API key:
   ```bash
   VITE_CLAUDE_API_KEY=your_actual_api_key_here
   ```
   - Replace `your_actual_api_key_here` with your real API key

3. **Restart Development Server**
   - Stop your current dev server (Ctrl+C)
   - Run `npm run dev` or `bun dev` again

### Features

- **Real-time AI Chat**: Get instant responses from Claude AI
- **Context Awareness**: The AI remembers conversation history
- **Business Focus**: Specialized in custom AI & SaaS solutions
- **Professional Responses**: Tailored for business automation queries

### API Configuration Status

The chat component shows a status indicator:
- 🟢 **Green**: API properly configured and connected
- 🟡 **Yellow**: API key missing or invalid

### Troubleshooting

- **"API Key Required"**: Make sure you've set the `VITE_CLAUDE_API_KEY` environment variable
- **"Claude API error"**: Check your API key validity and account status
- **Rate limiting**: Claude API has usage limits, check your account dashboard

### Security Notes

- Never commit your `.env` file to version control
- The API key is only used client-side for direct API calls
- Consider implementing server-side proxy for production use

### Cost Information

- Claude API charges per token used
- Check [Anthropic's pricing page](https://www.anthropic.com/pricing) for current rates
- Monitor usage in your Anthropic console
