# Anthropic API Setup Guide

This guide will help you set up the Anthropic API integration for generating LinkedIn comments and DMs.

## Prerequisites

1. **Anthropic Account**: Sign up at [console.anthropic.com](https://console.anthropic.com)
2. **API Key**: Generate an API key from your Anthropic console
3. **Node.js**: Ensure you have Node.js 18+ installed

## Setup Steps

### 1. Install Dependencies

The required packages are already installed:
- `@anthropic-ai/sdk` - Anthropic API client
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your actual API key
nano .env
```

Your `.env` file should contain:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in to your account
3. Navigate to "API Keys" in the sidebar
4. Click "Create Key"
5. Give your key a name (e.g., "LinkedIn Agent")
6. Copy the generated key (starts with `sk-ant-`)
7. Paste it in your `.env` file

### 4. Test the Integration

Run the engagement draft generation:

```bash
npm run engage
```

Or run directly:

```bash
npx tsx src/runner/engage.once.ts
```

## Available Models

You can customize which Claude model to use:

- **Claude 3.5 Sonnet** (default): `claude-3-5-sonnet-20241022`
  - Best balance of speed and quality
  - Recommended for most use cases
  
- **Claude 3.5 Haiku**: `claude-3-5-haiku-20241022`
  - Fastest and most cost-effective
  - Good for simple tasks
  
- **Claude 3 Opus**: `claude-3-opus-20240229`
  - Highest quality and most capable
  - Best for complex reasoning tasks
  
- **Claude 3 Sonnet**: `claude-3-sonnet-20240229`
  - High quality with good speed
  - Alternative to 3.5 Sonnet

## Troubleshooting

### Common Issues

1. **"ANTHROPIC_API_KEY environment variable is required"**
   - Ensure your `.env` file exists and contains the API key
   - Check that the key starts with `sk-ant-`
   - Verify the file is in the project root directory

2. **API Rate Limits**
   - Anthropic has rate limits based on your plan
   - The code includes 1-second delays between requests
   - Consider upgrading your plan for higher limits

3. **Model Not Found**
   - Ensure the model name is correct
   - Check that the model is available in your region
   - Use the default model if unsure

### Getting Help

- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Status**: [status.anthropic.com](https://status.anthropic.com)
- **Console**: [console.anthropic.com](https://console.anthropic.com)

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API key secure and don't share it
- Consider using environment variables in production

## Cost Information

- **Claude 3.5 Sonnet**: $3.00 per 1M input tokens, $15.00 per 1M output tokens
- **Claude 3.5 Haiku**: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- **Claude 3 Opus**: $15.00 per 1M input tokens, $75.00 per 1M output tokens

For LinkedIn engagement drafts, you'll typically use very few tokens per request, making this very cost-effective.
