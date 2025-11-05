# AI Video Chat Assistant Guide

The Video Generator now includes an AI-powered chat assistant that helps you create and customize videos through natural conversation.

## Features

### 🎯 What It Can Do

1. **Create Videos from Descriptions**
   - "Create a video about coffee"
   - "Make a promotional video for a gym"
   - "Generate a motivational quote video"

2. **Modify Script Content**
   - "Add a scene that says 'Join us today'"
   - "Change the first scene to say 'Welcome back'"
   - "Make each scene 5 seconds long"
   - "Remove the last scene"

3. **Change Visual Styles**
   - "Use ocean blue colors"
   - "Make it look more professional with dark colors"
   - "Change to a gradient background"
   - "Use the Forest Green preset"

4. **Adjust Timing**
   - "Make all scenes 4 seconds"
   - "Speed up the animations"
   - "The first scene should be 6 seconds"

5. **Font Customization**
   - "Use a more modern font"
   - "Change to Playfair Display"
   - "Make the text bold"

6. **Background Styles**
   - "Switch to 3D cards background"
   - "Use a solid color background"
   - "Make the background gradient"

## How to Use

### Getting Started

1. Navigate to the Video Generator page
2. Look for the floating chat icon (sparkles) in the bottom-right corner
3. Click to open the chat interface

### Example Conversations

#### Creating a New Video

**You:** "Create a video about sustainable fashion"

**AI:** "I've created a video about sustainable fashion with 3 engaging scenes! Each scene will display for 3 seconds. Would you like me to adjust the timing or change the colors?"

*The AI automatically creates script lines and updates the preview*

#### Customizing Colors

**You:** "Make it look more eco-friendly with green colors"

**AI:** "Perfect! I've updated to a beautiful Forest Green theme. The colors now reflect sustainability with natural green and teal tones."

*Video colors update in real-time*

#### Refining the Script

**You:** "Add a call-to-action scene at the end"

**AI:** "Added! Your video now ends with 'Shop Sustainably Today' for 3 seconds. This makes a strong closing call-to-action."

*New scene appears in the script editor*

#### Adjusting Timing

**You:** "Make each scene 4 seconds instead"

**AI:** "Done! All scenes are now 4 seconds each, giving viewers more time to read the text."

*Duration updates across all scenes*

### Tips for Best Results

1. **Be Specific**
   - ✅ "Create a 3-scene video about morning routines"
   - ❌ "Make a video"

2. **One Change at a Time**
   - Start with script creation
   - Then adjust colors
   - Finally tune timing and effects

3. **Use Natural Language**
   - "I want ocean colors" works just as well as "Change primaryColor to #2E3192"

4. **Ask Questions**
   - "What color presets are available?"
   - "Can you make the animations faster?"
   - "How long is my video right now?"

5. **Iterate**
   - Make changes
   - Review the preview
   - Ask for adjustments
   - Repeat until perfect!

## Available Color Presets

Ask the AI to use any of these:
- **Purple Dream** - Purple and pink gradient
- **Ocean Blue** - Deep blue to bright aqua
- **Sunset Orange** - Orange and yellow warmth
- **Forest Green** - Natural green and teal
- **Pink Candy** - Vibrant pink and yellow

## Technical Details

### How It Works

1. **Context Awareness**: The AI knows your current video state (script, colors, settings)
2. **Structured Updates**: AI responses are parsed into JSON updates
3. **Real-time Preview**: Changes apply immediately to the preview
4. **Conversation Memory**: The chat remembers your conversation for context

### API Configuration

The AI chat uses your existing Claude API setup. Make sure you have:

```bash
# In your .env file
VITE_CLAUDE_API_KEY=your_anthropic_api_key_here
```

See `AI_CHAT_SETUP.md` for detailed API configuration.

### Response Format

The AI uses a structured format internally:

```
[MESSAGE]
User-friendly response text
[/MESSAGE]

[JSON]
{
  "scriptLines": [...],  // Updated script
  "style": { ... }       // Updated styles
}
[/JSON]
```

This ensures reliable parsing and consistent updates.

## Troubleshooting

### Chat Not Responding

1. Check that `VITE_CLAUDE_API_KEY` is set in your `.env`
2. Verify the API key is valid at https://console.anthropic.com
3. Check browser console for error messages

### Changes Not Applying

1. Make sure your request is clear and specific
2. Check that the AI understood your request in its response
3. Try rephrasing your request

### Unexpected Results

1. Review the chat conversation for context
2. Use "undo" by asking "change it back"
3. Manually edit using the Script/Style tabs

## Privacy & Security

- All conversations happen client-side and through your API
- No chat data is stored on our servers
- API key is required for functionality
- Standard Anthropic API usage rates apply

## Advanced Usage

### Batch Updates

"Create a 5-scene video about fitness with ocean blue colors and 4 seconds per scene"

The AI will parse this and apply all changes at once.

### Style Mixing

"Use Purple Dream colors but with a solid background"

Combine presets with custom modifications.

### Complex Scripts

"Create a story about a startup journey: scene 1 'The Idea', scene 2 'Building the Team', scene 3 'Launch Day', scene 4 'Success'"

The AI understands multi-scene narratives.

## Feedback

The AI assistant is constantly learning. If you encounter issues or have suggestions:
- Check the console for error logs
- Review the AI_CHAT_SETUP.md for configuration help
- File an issue on GitHub with your use case

---

**Pro Tip**: Think of the AI as your creative partner. Describe what you want to achieve, and let it handle the technical details!
