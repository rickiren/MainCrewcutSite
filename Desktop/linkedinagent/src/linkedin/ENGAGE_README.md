# LinkedIn Engage Module

This module generates LinkedIn engagement drafts (comments and DMs) for discovered posts using Anthropic's Claude models.

## Features

- **Comment Drafts**: Generate relevant, insightful comments for LinkedIn posts
- **DM Drafts**: Create personalized direct messages referencing specific posts
- **AI-Powered**: Uses Anthropic Claude 3.5 Sonnet for natural, professional content
- **Safe**: Only generates drafts - no actual LinkedIn actions are taken
- **Structured Storage**: Saves drafts to `data/drafts.json` with consistent format

## Prerequisites

1. **Anthropic API Key**: Set the `ANTHROPIC_API_KEY` environment variable
2. **Discovered Posts**: Run the discovery module first to have posts to work with
3. **Node.js Dependencies**: Ensure `@anthropic-ai/sdk` package is installed

## Usage

### Command Line

```bash
# Generate engagement drafts for all discovered posts
npm run engage

# Or run directly with tsx
tsx src/runner/engage.once.ts
```

### Programmatic

```typescript
import { generateEngagementDrafts, readDrafts, getDraftsForPost } from './linkedin/engage';

// Generate drafts for all posts
await generateEngagementDrafts();

// Read all drafts
const drafts = await readDrafts();

// Get drafts for a specific post
const postDrafts = await getDraftsForPost('https://linkedin.com/posts/...');
```

## Output Structure

Drafts are saved to `data/drafts.json` with this structure:

```json
[
  {
    "post_url": "https://linkedin.com/posts/...",
    "author_name": "John Doe",
    "post_excerpt": "First 200 characters of the post...",
    "draft_comment": "Generated comment draft...",
    "draft_dm": "Generated DM draft...",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
]
```

## How It Works

1. **Load Posts**: Reads discovered posts from the store
2. **Generate Comments**: Creates relevant, professional comment drafts
3. **Generate DMs**: Creates personalized direct message drafts
4. **Save Drafts**: Stores all drafts in structured JSON format
5. **Rate Limiting**: Includes 1-second delays between API calls

## Safety Features

- ✅ **No LinkedIn Actions**: Only generates text drafts
- ✅ **API Key Validation**: Checks for required environment variables
- ✅ **Error Handling**: Graceful fallbacks if Anthropic API fails
- ✅ **Rate Limiting**: Respectful delays between API calls

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (defaults to claude-3-5-sonnet-20241022)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Error Handling

The module includes comprehensive error handling:
- Missing API keys
- Anthropic API failures
- File system errors
- Invalid post data

All errors are logged and the process continues where possible.

## Customization

You can modify the prompts in `generateCommentDraft()` and `generateDMDraft()` functions to adjust:
- Tone and style
- Length constraints
- Specific requirements
- Target audience

## Dependencies

- `@anthropic-ai/sdk`: Anthropic API client
- `fs`: File system operations
- `path`: Path utilities
- Core store and types from the project
