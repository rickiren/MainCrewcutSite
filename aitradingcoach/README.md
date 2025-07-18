# AI Trading Coach Desktop App

A desktop application that monitors your trading screenshots and provides AI-powered coaching advice in real-time.

## Features

- **Screenshot Monitoring**: Automatically watches a local folder for new trading screenshots
- **AI Vision Analysis**: Uses OpenAI's GPT-4 Vision API to analyze screenshots and provide coaching advice
- **Real-time Chat Interface**: Displays AI coaching messages in a terminal-style chat window
- **Desktop Integration**: Native desktop app with file system access

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up OpenAI API Key**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your-actual-api-key-here
     ```

3. **Create Screenshots Folder**
   - Create the folder: `/Users/rickybodner/Desktop/Ai coach screenshots`
   - Or modify the path in `electron/main.js` to match your preferred location

## Development

Run in development mode:
```bash
npm run dev:electron
```

This will start both the Vite dev server and Electron app.

## Building

Build for production:
```bash
npm run build:electron
```

## Usage

1. Launch the app
2. The app will monitor the screenshots folder automatically
3. Drop any trading screenshot into the monitored folder
4. The AI will analyze the screenshot and provide coaching advice in the chat window
5. You can also type manual messages in the chat input

## Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- BMP

## Requirements

- Node.js 16+
- OpenAI API key with GPT-4 Vision access
- macOS, Windows, or Linux