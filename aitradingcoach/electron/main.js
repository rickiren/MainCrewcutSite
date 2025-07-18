const { app, BrowserWindow, ipcMain } = require('electron');
const { desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const { supabase } = require('./supabase');
require('dotenv').config();
const https = require('https');
const http = require('http');

// Import batch analysis functions
const { 
  triggerBatchAnalysisForSession, 
  shouldTriggerBatchAnalysis 
} = require('../utils/analyzeScreenshotsBatch.js');

// Screenshot coaching system
let isProcessingCoaching = false;
let coachingSystemInitialized = false;
let lastAnalysisResults = new Map(); // Store last analysis for each ticker
const COACHING_INTERVAL = 10000; // Check for new screenshots every 10 seconds

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let mainWindow;
let pollingInterval;
let screenshotInterval;
let lastProcessedFile = null;
let isCapturing = false;
let isInitialized = false;
let conversationHistory = []; // Store full conversation history
let detectedTicker = null; // Current detected ticker from screenshot
let currentUserId = null; // Current authenticated user ID
const SCREENSHOTS_FOLDER = '/Users/rickybodner/Desktop/Ai coach screenshots';
const TICKER_SESSIONS_FOLDER = path.join(__dirname, '../ticker-sessions');
const POLLING_INTERVAL = 5000; // 5 seconds
const SCREENSHOT_INTERVAL = 5000; // 5 seconds
const MAX_SCREENSHOTS_PER_TICKER = 20; // Store up to 20 screenshots per ticker

// Ticker session management
let tickerSessions = new Map(); // Map of ticker -> session data
let currentTicker = null;
let lastTickerDetectionTime = null;

// Add a global variable to track the current active ticker session ID
let activeTickerSessionId = null;

// AI Loop management
let aiLoopInterval = null;
let lastAIMessage = null;
let lastContextHash = null;
let lastMarketData = null;
let lastScreenshotCount = 0;
let consecutiveNoChangeCount = 0;
let lastUserMessageTime = null; // Track when user last sent a message
const MAX_CONSECUTIVE_NO_CHANGE = 3; // Stop sending after 3 consecutive no-change responses
const USER_MESSAGE_COOLDOWN = 30000; // 30 seconds cooldown after user message

// Batch Analysis management
let batchAnalysisInterval = null;
let lastBatchAnalysisTime = null;

// Initialize conversation with system message
function initializeConversation() {
  conversationHistory = [
    {
      role: "system",
      content: `You are a world-class real-time trading coach — the perfect fusion of GPT-4's intelligence, the market mastery of elite traders like Mark Minervini, and the psychological strength of Tony Robbins.

You are coaching a high-performance trader who needs clear, fast, decisive input while actively trading. They do not want fluff, theory, or hesitation.

🔥 You always speak with conviction. Every message should be actionable, strong, and clear. You NEVER hedge. There are only 4 possible stances:
- YES (enter now)
- NO (avoid this)
- HOLD (wait)
- EXIT (get out now)

You NEVER say "be cautious," "it might," "could be," or "seems like." Replace all soft or uncertain language with strong, directional commands.

---

You have access to:
- The currently active ticker and its latest context (summaries, screenshots, entries, etc.)
- The user's chat history and questions
- Previous trades and behavior patterns
- Technical setup logic, volume analysis, trading psychology, and high-probability edge recognition

---

Your purpose:
- Help the trader take the best action with each opportunity
- Make unprofitable traders profitable
- Eliminate emotional, inconsistent, and impulsive decisions
- Turn their natural edge into consistent, scalable results
- Maximize profit, reduce risk, and grow their account every day
- Coach them to act like a smart, disciplined algorithm — holding winners, cutting losers, avoiding costly mistakes
- Teach them to win by mastering both their strategy and their psychology
- Adapt to the market's human and algorithmic behavior — but always beat it

---

Your communication style:
- Short. Decisive. No filler.
- Use strong language: "Wait for volume," "Exit now," "No entry," "This is the moment."
- Match the trader's intensity. Speak like a sniper, not a therapist.

You are here to help them win. One clear decision at a time.`
    }
  ];
}

// Ensure screenshots directory exists
function ensureScreenshotsDirectory() {
  if (!fs.existsSync(TICKER_SESSIONS_FOLDER)) {
    fs.mkdirSync(TICKER_SESSIONS_FOLDER, { recursive: true });
    console.log('Created ticker sessions directory:', TICKER_SESSIONS_FOLDER);
  }
}

// Function to get Vite dev server port
function getVitePort() {
  // Check environment variable first
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort);
    if (!isNaN(port)) {
      console.log(`Using port from environment: ${port}`);
      return port;
    }
  }
  
  // Then check the port file written by wait-for-vite.js
  const portFile = path.join(__dirname, '../.vite-port');
  if (fs.existsSync(portFile)) {
    try {
      const port = fs.readFileSync(portFile, 'utf8').trim();
      const parsedPort = parseInt(port);
      if (!isNaN(parsedPort)) {
        console.log(`Using port from file: ${parsedPort}`);
        return parsedPort;
      }
    } catch (error) {
      console.warn('Could not read Vite port file:', error.message);
    }
  }
  
  // Final fallback to 5173
  console.log('Using default fallback port: 5173');
  return 5173;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Allow loading from localhost in dev
    },
    titleBarStyle: 'hiddenInset',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#22c55e',
      height: 32
    },
    backgroundColor: '#000000',
    show: false // Don't show until ready
  });

  // Show window when ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Always open DevTools for debugging
      mainWindow.webContents.openDevTools();
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const vitePort = getVitePort();
    const devUrl = `http://localhost:${vitePort}`;
    console.log(`Loading development server at ${devUrl}`);
    mainWindow.loadURL(devUrl).catch(err => {
      console.error('Failed to load dev server:', err);
      // Fallback to built files if dev server fails
      const indexPath = path.join(__dirname, '../dist/index.html');
      console.log('Falling back to built files at:', indexPath);
      mainWindow.loadFile(indexPath).catch(loadErr => {
        console.error('Failed to load fallback index.html:', loadErr);
        mainWindow.loadURL('data:text/html,<h1>Failed to load renderer</h1><p>Please check your build output.</p>');
      });
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading built files from:', indexPath);
    mainWindow.loadFile(indexPath).catch(loadErr => {
      console.error('Failed to load index.html:', loadErr);
      mainWindow.loadURL('data:text/html,<h1>Failed to load renderer</h1><p>Please check your build output.</p>');
    });
  }

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorDescription);
    mainWindow.loadURL('data:text/html,<h1>Failed to load renderer</h1><p>' + errorDescription + '</p>');
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Handle console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message);
  });
}

// Add the missing detectTickerFromScreenshot function
async function detectTickerFromScreenshot(imagePath) {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Use AI to detect ticker
    const tickerDetectionPrompt = `Analyze this trading screenshot and identify the stock ticker symbol being displayed.

Look for:
- Ticker symbols in the chart title or header (e.g., AAPL, TSLA, NVDA)
- Company names that can be mapped to tickers
- Any text that indicates what stock is being shown

Respond with ONLY the ticker symbol in uppercase (e.g., "AAPL") or "UNKNOWN" if you cannot determine it.
Do not include any other text, explanations, or formatting.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: tickerDetectionPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    });
    
    const detectedTicker = response.choices[0].message.content.trim().toUpperCase();
    
    // Check if ticker was successfully detected
    if (!detectedTicker || detectedTicker === 'UNKNOWN' || detectedTicker.length > 10 || detectedTicker.includes(' ')) {
      console.log('🔍 No valid ticker detected in screenshot');
      return null; // Return null instead of undefined
    }
    
    console.log('🎯 Detected ticker:', detectedTicker);
    return detectedTicker;
    
  } catch (error) {
    console.error('Error detecting ticker from screenshot:', error);
    return null;
  }
}

// Add the missing createOrUpdateTickerSession function
async function createOrUpdateTickerSession(ticker, screenshotFile) {
  try {
    if (!currentUserId) {
      console.error('No current user - cannot create ticker session');
      return;
    }

    // End any other active sessions first
    await supabase
      .from('ticker_sessions')
      .update({ 
        is_active: false, 
        session_end: new Date().toISOString() 
      })
      .eq('user_id', currentUserId)
      .eq('is_active', true);

    // Create new session in Supabase
    const { data: newSession, error: createError } = await supabase
      .from('ticker_sessions')
      .insert({
        user_id: currentUserId,
        ticker: ticker,
        session_start: new Date().toISOString(),
        is_active: true,
        screenshot_count: 1,
        duration_minutes: 0,
        session_data: {
          detected_at: new Date().toISOString(),
          screenshot_count: 1
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating ticker session in Supabase:', createError);
      return;
    }

    // Set the global activeTickerSessionId
    activeTickerSessionId = newSession.id;
    console.log('New session created. Supabase ID:', newSession.id, 'activeTickerSessionId:', activeTickerSessionId);

    // Create local session folder
    const sessionFolder = path.join(TICKER_SESSIONS_FOLDER, ticker);
    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
    }

    const localSession = {
      id: ticker,
      supabaseId: newSession.id,
      ticker: ticker,
      startTime: new Date(),
      lastActivity: new Date(),
      sessionFolder: sessionFolder,
      screenshots: [{
        filename: screenshotFile.name,
        path: screenshotFile.path,
        timestamp: new Date()
      }]
    };

    tickerSessions.set(ticker, localSession);
    currentTicker = ticker;

    console.log(`🎯 Created new ticker session for ${ticker} with Supabase ID: ${newSession.id}`);
    
    // Start AI loop for the new ticker session
    if (currentUserId) {
      startAILoop(currentUserId);
      startBatchAnalysisLoop(currentUserId);
    }
    
    // Update current ticker
    currentTicker = ticker;
  } catch (error) {
    console.error('Error creating/updating ticker session:', error);
  }
}

// Add the missing getTickerTimeline function
function getTickerTimeline(ticker) {
  if (!tickerSessions.has(ticker)) {
    return null;
  }
  
  const session = tickerSessions.get(ticker);
  const sessionDuration = Math.round((new Date() - session.startTime) / 1000 / 60); // minutes
  
  const timeline = session.screenshots.map((screenshot, index) => ({
    index: index + 1,
    timestamp: screenshot.timestamp.toISOString(),
    filename: screenshot.filename,
    path: screenshot.path
  }));
  
  return {
    ticker: ticker,
    sessionDuration: sessionDuration,
    screenshotCount: session.screenshots.length,
    timeline: timeline
  };
}

function getLatestScreenshot() {
  try {
    if (!fs.existsSync(SCREENSHOTS_FOLDER)) {
      console.log(`Screenshots folder doesn't exist: ${SCREENSHOTS_FOLDER}`);
      return null;
    }

    const files = fs.readdirSync(SCREENSHOTS_FOLDER)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(SCREENSHOTS_FOLDER, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first
    
    return files.length > 0 ? files[0] : null;
  } catch (error) {
    console.error('Error reading screenshots folder:', error);
    return null;
  }
}

async function processLatestScreenshot() {
  try {
    // CRITICAL: Don't process screenshots during initial startup to prevent old messages
    if (!isInitialized) {
      console.log('Screenshot processing blocked - not yet initialized');
      return;
    }
    
    const latestFile = getLatestScreenshot();
    
    if (!latestFile) {
      return; // No files found
    }

    // Check if this is a new file we haven't processed
    if (lastProcessedFile && lastProcessedFile.path === latestFile.path && 
        lastProcessedFile.mtime.getTime() === latestFile.mtime.getTime()) {
      console.log('Screenshot already processed, skipping:', latestFile.name);
      return; // Same file, already processed
    }

    console.log('Processing NEW screenshot:', latestFile.name, 'at', new Date().toISOString());
    lastProcessedFile = latestFile;

    // Detect ticker from screenshot
    const newDetectedTicker = await detectTickerFromScreenshot(latestFile.path);
    
    // Check if this is a new ticker
    const isNewTicker = newDetectedTicker && newDetectedTicker !== currentTicker;
    
    if (newDetectedTicker && typeof newDetectedTicker === 'string') {
      // Update the detected ticker
      detectedTicker = newDetectedTicker;
      
      // Create or update ticker session
      await createOrUpdateTickerSession(newDetectedTicker, latestFile);
      
      // Note: Webhook removed - only triggered manually when starting new ticker session
      
      // If this is a new ticker, send ticker detection message
      if (isNewTicker) {
        // Send ticker detection message to UI
        if (mainWindow && !mainWindow.isDestroyed()) {
          const sessionInfo = currentTicker && tickerSessions.has(currentTicker) ? {
            previousTicker: currentTicker,
            previousDuration: Math.round((new Date() - tickerSessions.get(currentTicker).startTime) / 1000 / 60),
            previousScreenshots: tickerSessions.get(currentTicker).screenshots.length
          } : null;
          
          let message = `🎯 **New ticker detected: ${newDetectedTicker}**`;
          
          if (sessionInfo) {
            message += `\n\n📊 Previous session summary:\n• ${sessionInfo.previousTicker}: ${sessionInfo.previousDuration} minutes, ${sessionInfo.previousScreenshots} screenshots`;
          }
          
          message += `\n\n🔍 Starting fresh analysis for ${newDetectedTicker}...`;
          
          mainWindow.webContents.send('ai-screenshot-analysis', {
            message: message,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            }),
            messageType: 'ticker_detection',
            ticker: newDetectedTicker,
            isNewTicker: true
          });
        }
      }
      
      // Only proceed with AI analysis if we have a valid ticker
      // Read the image file
      const imageBuffer = fs.readFileSync(latestFile.path);
      const base64Image = imageBuffer.toString('base64');
      
      // Add screenshot analysis message to conversation history
      const screenshotMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are an elite AI trading coach powered by GPT-4o, designed to help a trader become consistently profitable. You specialize in real-time chart interpretation, risk/reward evaluation, and decision-making under pressure.\n\nYour coaching style blends:\n- Tactical conviction like a top prop firm scalper\n- Insightful pattern recognition from seasoned momentum traders\n- Emotional regulation support like a performance psychologist\n- Clarity and focus like a trading floor mentor\n\nYou speak in a human, conversational tone. Use direct language. Be encouraging but honest. When analyzing a screenshot, evaluate the setup like a real coach watching the screen beside them. Give fast, confident answers when conviction is high, and say \"wait\" or \"avoid\" when it's not clear. Always explain why.\n\nWhen you detect a new ticker, grade the setup A+, A, B, C, or F, and explain exactly why — using only what you see in the charts.\n\nNever say generic advice like 'use a stop-loss' unless it's critical. Instead, focus on price action, float, volume profile, tape, risk/reward, emotions, and timing.\n\nSpeak with confidence. If the setup is garbage, say so. If it's elite, say exactly why.\n\nYou also respond to typed messages from the trader like ChatGPT. They can ask questions, and you should answer using the most recent screenshots as context.\n\nWhen analyzing screenshots, use any past screenshots provided in the same session as memory. Look for price movement trends over time.\n\nAvoid generic advice. Focus on this specific moment. Give bold, actionable feedback if the setup is strong — otherwise help the trader stay patient.\n\nThis assistant is not a teacher. It is a real-time coach designed to help the trader make more money, stay emotionally sharp, and avoid stupid decisions.\n\nUse bullet points, bold emphasis, and trader lingo when helpful.\n\nAbove all: be smart, decisive, and grounded in reality."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      };
      
      // Add to conversation history
      conversationHistory.push(screenshotMessage);
      
      // Send to OpenAI chat/completions API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversationHistory,
        max_tokens: 300,
        temperature: 0.7
      });

      const aiMessage = response.choices[0].message.content;
      
      // Add AI response to conversation history
      conversationHistory.push({
        role: "assistant",
        content: aiMessage
      });
      
      // Trim conversation history if it gets too long (keep last 20 messages + system)
      if (conversationHistory.length > 21) {
        conversationHistory = [
          conversationHistory[0], // Keep system message
          ...conversationHistory.slice(-20) // Keep last 20 messages
        ];
      }
      
      // Send the AI response to the renderer process
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ai-screenshot-analysis', {
          message: aiMessage,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          filename: latestFile.name,
          messageType: 'screenshot_analysis',
          ticker: currentTicker,
          sessionInfo: currentTicker && tickerSessions.has(currentTicker) ? {
            screenshotCount: tickerSessions.get(currentTicker).screenshots.length,
            batchAnalysisCount: 0, // Will be updated by periodic check
            duration: Math.round((new Date() - tickerSessions.get(currentTicker).startTime) / 1000 / 60),
            startTime: tickerSessions.get(currentTicker).startTime.toISOString()
          } : null
        });
      }
    } else {
      console.log('No ticker detected in screenshot, skipping AI analysis');
    }

  } catch (error) {
    console.error('Error processing screenshot:', error);
    
    // Only send error message if it's a real error, not just no ticker detected
    if (error.message && !error.message.includes('No valid ticker detected')) {
      // Send error message to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ai-screenshot-analysis', {
          message: 'Error analyzing screenshot. Please check your OpenAI API key and connection.',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isError: true,
          messageType: 'error'
        });
      }
    }
  }
}

function startPolling() {
  console.log(`Starting screenshot polling every ${POLLING_INTERVAL}ms`);
  
  // CRITICAL: Mark as initialized after a delay to prevent processing old screenshots on startup
  setTimeout(() => {
    isInitialized = true;
    console.log('Screenshot processing initialized at', new Date().toISOString(), '- will now analyze NEW screenshots only');
  }, 12000); // Wait 12 seconds before processing to avoid old screenshots
  
  // Poll every 5 seconds after initialization
  pollingInterval = setInterval(() => {
    processLatestScreenshot();
  }, POLLING_INTERVAL);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    isInitialized = false;
    console.log('Screenshot polling stopped');
  }
}

// Screenshot coaching system
async function processLatestScreenshotForCoaching() {
  return; // Temporarily disable automated coaching messages
  
  if (isProcessingCoaching || !currentUserId || !coachingSystemInitialized) {
    return;
  }
  
  isProcessingCoaching = true;
  
  try {
    console.log('🔍 Checking for pending screenshots to coach...');
    
    // 1. Query the screenshots table for ONLY pending screenshots
    const { data: latestScreenshot, error: queryError } = await supabase
      .from('screenshots')
      .select('id, filename, file_path, storage_path, user_id, created_at, coaching_status')
      .eq('user_id', currentUserId)
      .eq('coaching_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (queryError) {
      if (queryError.code !== 'PGRST116') { // Not found is OK
        console.error('Error querying latest screenshot:', queryError);
      }
        console.log('✅ No pending screenshots found for coaching');
    }
    
    if (!latestScreenshot) {
      console.log('✅ No pending screenshots found for coaching');
      return;
    }
    
    console.log('📸 Found NEW screenshot for coaching:', latestScreenshot.filename, 'Status:', latestScreenshot.coaching_status);
    
    // 2. Mark as processing to prevent duplicate processing
    await supabase
      .from('screenshots')
      .update({ 
        coaching_status: 'processing',
        analysis_result: 'AI is analyzing this screenshot...'
      })
      .eq('id', latestScreenshot.id);
    
    console.log('🔄 Marked screenshot as processing:', latestScreenshot.id);
    
    // 3. Get the screenshot from Supabase Storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('screenshots')
      .download(latestScreenshot.storage_path);
    
    if (downloadError) {
      console.error('Error downloading screenshot:', downloadError);
      await supabase
        .from('screenshots')
        .update({ 
          coaching_status: 'failed',
          analysis_result: 'Failed to download screenshot from storage'
        })
        .eq('id', latestScreenshot.id);
      return;
    }
    
    // Convert to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // 4. Send to AI for coaching
    const coachingPrompt = `You're a world-class trading coach analyzing a trader's real-time screen. Here's their latest screenshot:

Screenshot Details:
• Filename: ${latestScreenshot.filename}
• File Path: ${latestScreenshot.file_path}
• Timestamp: ${new Date(latestScreenshot.created_at).toLocaleString()}
• User: ${latestScreenshot.user_id}

Give coaching based on what you see. Act like a pro mentor. Offer feedback, praise, warnings, or questions. Keep it short and actionable.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: conversationHistory[0].content // Use the existing system prompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: coachingPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });
    
    const coachingFeedback = response.choices[0].message.content;
    console.log('🤖 AI coaching feedback generated');
    
    // 5. Save response and mark as completed
    
    // Update screenshots table with feedback and mark as completed
    await supabase
      .from('screenshots')
      .update({ 
        coaching_status: 'completed',
        analysis_result: coachingFeedback,
        ai_grade: 'B' // Default grade - could be extracted from AI response
      })
      .eq('id', latestScreenshot.id);
    
    console.log('✅ Screenshot coaching completed and saved:', latestScreenshot.id);
    
    // Insert into ai_analysis table for detailed tracking
    const { error: analysisError } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: currentUserId,
        screenshot_id: latestScreenshot.id,
        ticker: currentTicker || 'UNKNOWN',
        grade: 'B', // Default grade - could be extracted from AI response
        risk_level: 'medium', // Default - could be extracted from AI response
        reward_potential: 'medium', // Default - could be extracted from AI response
        confidence_score: 0.8, // Default - could be extracted from AI response
        key_observations: [coachingFeedback.substring(0, 100)], // First 100 chars as key observation
        analysis_data: {
          coaching_feedback: coachingFeedback,
          screenshot_filename: latestScreenshot.filename,
          processing_timestamp: new Date().toISOString()
        }
      });
    
    if (analysisError) {
      console.error('Error saving AI analysis:', analysisError);
    }
    
    // 6. Send coaching feedback to UI
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ai-screenshot-analysis', {
        message: `📸 **Screenshot Coaching**\n\n${coachingFeedback}`,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        filename: latestScreenshot.filename,
        messageType: 'screenshot_coaching',
        ticker: currentTicker,
        screenshotId: latestScreenshot.id
      });
    }
    
    console.log('🎯 Screenshot coaching completed and sent to UI:', latestScreenshot.filename);
    
  } catch (error) {
    console.error('Error in screenshot coaching process:', error);
    
    // Mark as failed if we have a screenshot ID
    if (latestScreenshot?.id) {
      await supabase
        .from('screenshots')
        .update({ 
          coaching_status: 'failed',
          analysis_result: `Error during AI analysis: ${error.message}`
        })
        .eq('id', latestScreenshot.id);
    }
    
    // Send error to UI
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ai-screenshot-analysis', {
        message: '❌ Error processing screenshot for coaching. Please check your connection.',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        isError: true,
        messageType: 'error'
      });
    }
  } finally {
    isProcessingCoaching = false;
  }
}

// Start coaching system
function startCoachingSystem() {
  console.log('🎯 Initializing screenshot coaching system...');
  
  // Wait 10 seconds before starting to avoid processing old screenshots on startup
  setTimeout(() => {
    coachingSystemInitialized = true;
    console.log('✅ Coaching system initialized - will now process NEW screenshots only');
    
    // Check for pending screenshots immediately after initialization
    processLatestScreenshotForCoaching();
  }, 10000);
  
  // Then process every 10 seconds after initialization
  setInterval(() => {
    processLatestScreenshotForCoaching();
  }, COACHING_INTERVAL);
}

app.whenReady().then(() => {
  console.log('Electron app ready, creating window...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
  
  // Ensure screenshots directory exists
  ensureScreenshotsDirectory();
  
  // CRITICAL: Reset ALL state on startup to prevent old messages
  lastProcessedFile = null;
  isInitialized = false;
  conversationHistory = []; // Clear any existing conversation history
  
  // Initialize fresh conversation history
  initializeConversation();
  
  console.log('Conversation history initialized fresh with', conversationHistory.length, 'messages');
  
  createWindow();
  
  // Start polling after a short delay to ensure window is ready
  setTimeout(() => {
    startPolling();
    startCoachingSystem(); // Start the coaching system
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopPolling();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  stopPolling();
  stopScreenshotCapture();
  
  // End active sessions before clearing state
  await endActiveSessions();
  
  // CRITICAL: Reset ALL state on quit
  lastProcessedFile = null;
  isInitialized = false;
  coachingSystemInitialized = false;
  detectedTicker = null;
  conversationHistory = [];
  tickerSessions.clear();
  currentTicker = null;
  activeTickerSessionId = null; // Clear the global active session ID
  console.log('All state cleared on app quit');
});

// Screenshot capture functions
function startScreenshotCapture(sourceId) {
  if (isCapturing) {
    console.log('Screenshot capture already running');
    return;
  }
  
  isCapturing = true;
  console.log('Starting screenshot capture with source:', sourceId);
  
  // Take screenshot immediately
  captureScreenshot(sourceId);
  
  // Then capture every 5 seconds
  screenshotInterval = setInterval(() => {
    captureScreenshot(sourceId);
  }, SCREENSHOT_INTERVAL);
}

function stopScreenshotCapture() {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
  }
  isCapturing = false;
  console.log('Screenshot capture stopped');
}

async function captureScreenshot(sourceId) {
  try {
    if (!currentUserId) {
      console.error('No current user - cannot upload screenshot');
      return;
    }
    
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    const source = sources.find(s => s.id === sourceId);
    if (!source) {
      console.error('Source not found:', sourceId);
      return;
    }
    
    // Get high-resolution capture
    const highResSources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 3840, height: 2160 }
    });
    
    const highResSource = highResSources.find(s => s.id === sourceId);
    const thumbnail = highResSource ? highResSource.thumbnail : source.thumbnail;
    
    // Generate timestamp-based filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `screenshot_${timestamp}.png`;
    
    // Get PNG buffer
    const buffer = thumbnail.toPNG();
    
    // Get current ticker session ID
    let tickerSessionId = activeTickerSessionId;
    console.log('Saving screenshot with tickerSessionId:', tickerSessionId);
    
    // Build the storage path as /ticker/session_id/filename
    const ticker = currentTicker; // e.g., 'AAPL'
    const sessionId = activeTickerSessionId; // e.g., '123e4567-e89b-12d3-a456-426614174000'
    const storagePath = `${ticker}/${sessionId}/${filename}`;

    let uploadBuffer = buffer;
    if (typeof buffer === 'string') {
      // Remove data URL prefix if present
      const base64 = buffer.replace(/^data:image\/\w+;base64,/, '');
      uploadBuffer = Buffer.from(base64, 'base64');
    }

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(storagePath, uploadBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading screenshot to Supabase:', uploadError);
      return;
    }
    console.log('Screenshot uploaded successfully:', uploadData.path);

    // 2. Generate the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('screenshots')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Insert record into screenshots table with public_url
    const { data: dbData, error: dbError } = await supabase
      .from('screenshots')
      .insert({
        user_id: currentUserId,
        ticker_session_id: tickerSessionId,
        filename: filename,
        file_path: uploadData.path,
        storage_path: storagePath,
        ticker: currentTicker,
        public_url: publicUrl // <--- store the public URL
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving screenshot to database:', dbError);
      // Don't retry for database errors, but still consider upload successful
    } else {
      console.log('Screenshot record saved to database:', dbData.id);
      
      // Note: Screenshot webhook removed - only triggered manually when starting new ticker session
    }
    
    // Update local ticker session data
    if (currentTicker && tickerSessions.has(currentTicker)) {
      const session = tickerSessions.get(currentTicker);
      session.screenshots.push({
        filename: filename,
        path: storagePath,
        timestamp: new Date(),
        supabaseId: dbData?.id
      });
      session.lastActivity = new Date();
      
      // Update Supabase session screenshot count
      await supabase
        .from('ticker_sessions')
        .update({ 
          screenshot_count: session.screenshots.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.supabaseId);
      
      console.log(`📸 Updated local session for ${currentTicker}: ${session.screenshots.length} screenshots`);
    }
    
    // Notify renderer of successful capture
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('screenshot-captured', {
        filename,
        filepath: storagePath,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        supabaseId: dbData?.id
      });
    }
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    
    // Notify renderer of error
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('screenshot-error', {
        error: error.message,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      });
    }
  }
}

// Handle messages from renderer process
ipcMain.handle('send-user-message', async (event, userMessage) => {
  try {
    console.log('--- [AI COACH] send-user-message handler triggered ---');
    console.log('User message:', userMessage);

    if (!currentUserId) {
      console.log('No current user ID set.');
      return { success: false, error: 'No user authenticated' };
    }

    // 1. Fetch the currently active ticker session
    const { data: activeSession, error: sessionError } = await supabase
      .from('ticker_sessions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .order('session_start', { ascending: false })
      .limit(1)
      .single();

    let dynamicContext = '';
    let activeTicker = activeSession ? activeSession.ticker : null;
    let contextInfo = '';
    let sessionContext = {};
    let recentScreenshots = [];

    if (activeTicker) {
      // Fetch market data for the active ticker
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .eq('ticker', activeTicker)
        .limit(1)
        .single();

      // Fetch ticker metadata
      const { data: tickerMeta } = await supabase
        .from('ticker_metadata')
        .select('*')
        .eq('ticker', activeTicker)
        .limit(1)
        .single();

      // Fetch chat messages for this ticker
      const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('content, message_type, created_at')
        .eq('ticker', activeTicker)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch low float tickers
      const { data: lowFloatTickers } = await supabase
        .from('low_float_tickers')
        .select('*')
        .eq('ticker', activeTicker)
        .limit(1);

      dynamicContext += `\n---\n📈 LIVE TICKER DATA\n`;
      dynamicContext += `Active Ticker: ${activeTicker}\n`;
      
      if (marketData) {
        dynamicContext += `\n💰 MARKET DATA:\n`;
        dynamicContext += `• Price: $${marketData.price || 'N/A'}\n`;
        dynamicContext += `• Volume: ${marketData.volume ? marketData.volume.toLocaleString() : 'N/A'}\n`;
        dynamicContext += `• Change: ${marketData.change_percent || 'N/A'}%\n`;
        dynamicContext += `• Day High: $${marketData.day_high || 'N/A'}\n`;
        dynamicContext += `• Day Low: $${marketData.day_low || 'N/A'}\n`;
        dynamicContext += `• Market Cap: ${marketData.market_cap ? (marketData.market_cap / 1000000).toFixed(2) + 'M' : 'N/A'}\n`;
      }
      
      if (tickerMeta) {
        dynamicContext += `\n📋 TICKER METADATA:\n`;
        dynamicContext += `• Company: ${tickerMeta.company_name || 'N/A'}\n`;
        dynamicContext += `• Sector: ${tickerMeta.sector || 'N/A'}\n`;
        dynamicContext += `• Industry: ${tickerMeta.industry || 'N/A'}\n`;
        dynamicContext += `• Float: ${tickerMeta.float ? tickerMeta.float.toLocaleString() : 'N/A'}\n`;
        dynamicContext += `• Shares Outstanding: ${tickerMeta.shares_outstanding ? tickerMeta.shares_outstanding.toLocaleString() : 'N/A'}\n`;
      }
      
      if (lowFloatTickers && lowFloatTickers.length > 0) {
        const lf = lowFloatTickers[0];
        dynamicContext += `\n🚀 LOW FLOAT ALERT:\n`;
        dynamicContext += `• Float: ${lf.float ? lf.float.toLocaleString() : 'N/A'}\n`;
        dynamicContext += `• Relative Volume: ${lf.rel_vol || 'N/A'}x\n`;
        dynamicContext += `• Price: $${lf.price || 'N/A'}\n`;
        dynamicContext += `• Change: ${lf.change_percent || 'N/A'}%\n`;
      }
      
      if (chatMessages && chatMessages.length > 0) {
        dynamicContext += `\n💬 RECENT CHAT HISTORY:\n`;
        chatMessages.slice(0, 5).forEach(msg => {
          const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour12: false });
          dynamicContext += `• [${time}] ${msg.message_type.toUpperCase()}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
        });
      }
      
      dynamicContext += `\n---\n`;

      // 2. Fetch all screenshot summaries for this ticker, ordered by timestamp descending
      let { data: screenshots, error: screenshotsError } = await supabase
        .from('screenshots')
        .select('id, filename, created_at, ticker, public_url, analysis_result, ai_grade, detected_patterns, price_data, volume_data')
        .eq('user_id', currentUserId)
        .eq('ticker', activeTicker)
        .not('analysis_result', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20); // Get last 20 screenshots for context

      if (screenshotsError) {
        console.error('Error fetching screenshots:', screenshotsError);
      } else if (screenshots && screenshots.length > 0) {
        // Fallback filter in case .not('analysis_result', 'is', null) is not supported
        screenshots = screenshots.filter(s => s.analysis_result !== null && s.analysis_result !== undefined && s.analysis_result !== '');
        console.log(`📸 Found ${screenshots.length} screenshots for ${activeTicker} with analysis_result`);
        // Convert screenshots to base64 for AI context
        recentScreenshots = await Promise.all(
          screenshots.slice(0, 8).map(async (screenshot) => {
            try {
              if (screenshot.public_url) {
                // For now, we'll use the public URL - in a full implementation, you might want to download and convert to base64
                return {
                  name: screenshot.filename,
                  base64: null, // We'll handle this differently
                  timestamp: new Date(screenshot.created_at),
                  source: 'supabase',
                  ticker: screenshot.ticker,
                  analysis: screenshot.analysis_result,
                  grade: screenshot.ai_grade,
                  patterns: screenshot.detected_patterns,
                  publicUrl: screenshot.public_url
                };
              }
            } catch (error) {
              console.error('Error processing screenshot:', error);
            }
            return null;
          })
        );
        recentScreenshots = recentScreenshots.filter(s => s !== null);
      }

      // 3. Fetch recent batch analysis summaries for this ticker
      const { data: batchAnalysis, error: batchError } = await supabase
        .from('batch_analysis')
        .select('summary, created_at, screenshot_count')
        .eq('user_id', currentUserId)
        .eq('ticker', activeTicker)
        .order('created_at', { ascending: false })
        .limit(3);

      if (batchError) {
        console.error('Error fetching batch analysis:', batchError);
      }

      // 4. Fetch latest AI coaching messages for this ticker
      const { data: coachingMessages, error: coachingError } = await supabase
        .from('chat_messages')
        .select('content, message_type, created_at, context_data')
        .eq('user_id', currentUserId)
        .eq('ticker', activeTicker)
        .in('message_type', ['screenshot_analysis', 'ai', 'system'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (coachingError) {
        console.error('Error fetching coaching messages:', coachingError);
      }

      // 5. Fetch recent trader messages for this ticker
      const { data: recentTraderMessages, error: traderMessagesError } = await supabase
        .from('chat_messages')
        .select('content, message_type, created_at')
        .eq('user_id', currentUserId)
        .eq('ticker', activeTicker)
        .eq('message_type', 'user')
        .order('created_at', { ascending: false })
        .limit(5);

      if (traderMessagesError) {
        console.error('Error fetching trader messages:', traderMessagesError);
      }

      // Build comprehensive session context
      const sessionDuration = Math.round((new Date() - new Date(activeSession.session_start)) / 1000 / 60);
      const screenshotCount = screenshots ? screenshots.length : 0;
      
      // Get the latest screenshot for analysis
      const latestScreenshot = screenshots && screenshots.length > 0 ? screenshots[0] : null;

      // Build coaching context with new format
      contextInfo = `
🎯 ACTIVE TICKER: ${activeSession.ticker}
⏱️ Session Duration: ${sessionDuration} minutes  
📸 Screenshots Analyzed: ${screenshotCount}

${dynamicContext}

${batchAnalysis && batchAnalysis.length > 0 ? `📊 RECENT BATCH ANALYSIS:
${batchAnalysis.map((analysis, index) => {
  const time = new Date(analysis.created_at).toLocaleTimeString('en-US', { hour12: false });
  return `${index + 1}. [${time}] ${analysis.screenshot_count} screenshots: ${analysis.summary}`;
}).join('\n\n')}

` : ''}${latestScreenshot && latestScreenshot.analysis_result ? `📊 LATEST ANALYSIS:
${latestScreenshot.analysis_result}

` : ''}${recentTraderMessages && recentTraderMessages.length > 0 ? `📜 RECENT TRADER MESSAGES:
${recentTraderMessages.map(msg => `• ${msg.content}`).join('\n')}

` : ''}--

TRADER QUESTION:  
${userMessage}

Respond as a trusted, highly-skilled coach. Help them win this trade or stay out of trouble. Always speak with clarity.`;

      sessionContext = {
        ticker: activeSession.ticker,
        sessionDuration: sessionDuration,
        screenshotCount: screenshotCount,
        recentGrades: screenshots ? screenshots.slice(0, 5).map(s => s.ai_grade).filter(g => g) : [],
        dominantPatterns: screenshots ? screenshots.flatMap(s => s.detected_patterns || []).filter(p => p) : []
      };

    } else {
      // No active session - provide general guidance
      contextInfo = `
🤖 AI TRADING COACH - NO ACTIVE SESSION

You don't have an active ticker session running. To get the most specific coaching:

1. Start a ticker session by detecting a ticker from a screenshot
2. Or ask me general trading questions

TRADER QUESTION: ${userMessage}

Respond as a trusted, highly-skilled coach. Help them win this trade or stay out of trouble. Always speak with clarity.`;
      
      sessionContext = {
        ticker: null,
        sessionDuration: 0,
        screenshotCount: 0,
        recentGrades: [],
        dominantPatterns: []
      };
    }

    // Log the constructed context string
    console.log('[AI COACH] Constructed contextInfo:', contextInfo);

    // Log sessionContext object
    console.log('[AI COACH] sessionContext:', sessionContext);

    // Build complete message history for OpenAI
    const systemPrompt = conversationHistory.length > 0 && conversationHistory[0].role === 'system'
      ? conversationHistory[0].content
      : `You are a world-class real-time trading coach — the perfect fusion of GPT-4's intelligence, the market mastery of elite traders like Mark Minervini, and the psychological strength of Tony Robbins.

You are coaching a high-performance trader who needs clear, fast, decisive input while actively trading. They do not want fluff, theory, or hesitation.

🔥 You always speak with conviction. Every message should be actionable, strong, and clear. You NEVER hedge. There are only 4 possible stances:
- YES (enter now)
- NO (avoid this)
- HOLD (wait)
- EXIT (get out now)

You NEVER say "be cautious," "it might," "could be," or "seems like." Replace all soft or uncertain language with strong, directional commands.

---

You have access to:
- The currently active ticker and its latest context (summaries, screenshots, entries, etc.)
- The user's chat history and questions
- Previous trades and behavior patterns
- Technical setup logic, volume analysis, trading psychology, and high-probability edge recognition

---

Your purpose:
- Help the trader take the best action with each opportunity
- Make unprofitable traders profitable
- Eliminate emotional, inconsistent, and impulsive decisions
- Turn their natural edge into consistent, scalable results
- Maximize profit, reduce risk, and grow their account every day
- Coach them to act like a smart, disciplined algorithm — holding winners, cutting losers, avoiding costly mistakes
- Teach them to win by mastering both their strategy and their psychology
- Adapt to the market's human and algorithmic behavior — but always beat it

---

Your communication style:
- Short. Decisive. No filler.
- Use strong language: "Wait for volume," "Exit now," "No entry," "This is the moment."
- Match the trader's intensity. Speak like a sniper, not a therapist.

You are here to help them win. One clear decision at a time.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${contextInfo}\n\n${userMessage}` }
    ];

    // Log the final payload to OpenAI
    console.log('[AI COACH] Payload sent to OpenAI:', JSON.stringify(messages, null, 2));

    // Send to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.3
    });

    // Log the OpenAI response
    console.log('[AI COACH] OpenAI response:', response);

    const aiMessage = response.choices[0].message.content;
    
    // Set timestamp for user message to prevent auto AI loop from running
    lastUserMessageTime = Date.now();
    
    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiMessage
    });
    
    // Trim conversation history if it gets too long (keep last 20 messages + system)
    if (conversationHistory.length > 21) {
      conversationHistory = [
        conversationHistory[0], // Keep system message
        ...conversationHistory.slice(-20) // Keep last 20 messages
      ];
    }
    
    // Save AI response to database with context
    if (activeSession) {
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUserId,
          message_type: 'user_response', // Use different message type for user responses
          content: aiMessage,
          ticker: activeSession.ticker,
          ticker_session_id: activeSession.id,
          context_data: {
            sessionContext: sessionContext,
            screenshotCount: recentScreenshots.length,
            userQuestion: userMessage
          }
        });
      if (saveError) {
        console.error('[Supabase] Error saving AI chat message:', saveError);
      } else {
        console.log('[Supabase] AI user response saved to database successfully');
      }
    }

    return {
      success: true,
      message: aiMessage,
      contextScreenshots: recentScreenshots.length,
      currentTicker: activeSession ? activeSession.ticker : null,
      sessionDuration: activeSession ? Math.round((new Date() - new Date(activeSession.session_start)) / 1000 / 60) : 0,
      sessionContext: sessionContext
    };

  } catch (error) {
    console.error('Error processing user message:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Function to get recent screenshots for context
async function getRecentScreenshotsForContext(limit = 3) {
  // Use ticker session data if available, otherwise fall back to general screenshots
  if (currentTicker && tickerSessions.has(currentTicker)) {
    const session = tickerSessions.get(currentTicker);
    const recentScreenshots = session.screenshots.slice(-limit); // Get last N screenshots
    
    const screenshots = [];
    for (const screenshot of recentScreenshots) {
      try {
        if (fs.existsSync(screenshot.path)) {
          const imageBuffer = fs.readFileSync(screenshot.path);
          const base64Image = imageBuffer.toString('base64');
          screenshots.push({
            name: screenshot.filename,
            base64: base64Image,
            timestamp: new Date(screenshot.timestamp),
            source: 'ticker-session',
            ticker: currentTicker
          });
        }
      } catch (error) {
        console.error('Error reading ticker session screenshot:', error);
      }
    }
    
    console.log(`Retrieved ${screenshots.length} screenshots for ticker ${currentTicker} from session`);
    return screenshots;
  }
  
  // Fallback to local screenshots if no ticker session
  const screenshots = [];
  try {
    if (fs.existsSync(SCREENSHOTS_FOLDER)) {
      const localFiles = fs.readdirSync(SCREENSHOTS_FOLDER)
        .filter(file => file.endsWith('.png'))
        .map(file => {
          const filePath = path.join(SCREENSHOTS_FOLDER, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime,
            source: 'local'
          };
        })
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, limit);
      
      for (const file of localFiles) {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          const base64Image = imageBuffer.toString('base64');
          screenshots.push({
            name: file.name,
            base64: base64Image,
            timestamp: file.mtime,
            source: 'local'
          });
        } catch (error) {
          console.error('Error reading local screenshot:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error getting recent screenshots:', error);
  }
  
  return screenshots.slice(0, limit);
}

ipcMain.handle('get-folder-status', () => {
  return {
    exists: fs.existsSync(SCREENSHOTS_FOLDER),
    path: SCREENSHOTS_FOLDER
  };
});

ipcMain.handle('get-latest-screenshot-info', () => {
  const latest = getLatestScreenshot();
  return latest ? {
    name: latest.name,
    mtime: latest.mtime.toISOString()
  } : null;
});

// Screenshot capture IPC handlers
ipcMain.handle('get-desktop-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 300, height: 200 }
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
      display_id: source.display_id,
      appIcon: source.appIcon ? source.appIcon.toDataURL() : null
    }));
  } catch (error) {
    console.error('Error getting desktop sources:', error);
    return [];
  }
});

ipcMain.handle('start-screenshot-capture', (event, sourceId) => {
  startScreenshotCapture(sourceId);
  return { success: true, capturing: isCapturing };
});

ipcMain.handle('stop-screenshot-capture', () => {
  stopScreenshotCapture();
  return { success: true, capturing: isCapturing };
});

ipcMain.handle('get-capture-status', () => {
  return { capturing: isCapturing };
});

ipcMain.handle('get-screenshots-folder', () => {
  return {
    path: 'Supabase Storage: screenshots bucket',
    exists: true
  };
});

ipcMain.handle('get-screenshot-files', () => {
  // Return recent screenshots from Supabase instead of local files
  return new Promise(async (resolve) => {
    try {
      if (!currentUserId) {
        resolve([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching screenshots:', error);
        resolve([]);
        return;
      }
      
      const files = data.map(screenshot => ({
        name: screenshot.filename,
        path: screenshot.storage_path,
        size: 0, // Size not available from database
        mtime: screenshot.created_at,
        supabaseId: screenshot.id,
        ticker: screenshot.ticker
      }));
      
      resolve(files);
    } catch (error) {
      console.error('Error getting screenshot files:', error);
      resolve([]);
    }
  });
});

// Add IPC handler to set current user (called from renderer when user logs in)
ipcMain.handle('set-current-user', async (event, userId) => {
  currentUserId = userId;
  console.log('Current user set:', userId);
  
  // Load active ticker sessions for this user
  await loadActiveTickerSessions();
  
  return { success: true };
});

// Add IPC handler to get conversation history (for debugging or UI display)
ipcMain.handle('get-conversation-history', () => {
  return {
    messageCount: conversationHistory.length,
    lastMessages: conversationHistory.slice(-5).map(msg => ({
      role: msg.role,
      contentType: typeof msg.content === 'string' ? 'text' : 'multimodal',
      preview: typeof msg.content === 'string' ? 
        msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') :
        'Multimodal message with images'
    }))
  };
});

// Add IPC handler to clear conversation history
ipcMain.handle('clear-conversation-history', () => {
  initializeConversation();
  return { success: true, messageCount: conversationHistory.length };
});

// Add IPC handlers for ticker session management
ipcMain.handle('get-ticker-sessions', async () => {
  const sessions = [];
  
  for (const [ticker, session] of tickerSessions.entries()) {
    // Get batch analysis count for this session
    let batchAnalysisCount = 0;
    if (session.supabaseId) {
      try {
        const { count, error } = await supabase
          .from('batch_analysis')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.supabaseId);
        
        if (!error && count !== null) {
          batchAnalysisCount = count;
        }
      } catch (error) {
        console.error('Error getting batch analysis count:', error);
      }
    }
    
    sessions.push({
      ticker: ticker,
      screenshotCount: session.screenshots.length,
      batchAnalysisCount: batchAnalysisCount,
      startTime: session.startTime.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      duration: Math.round((new Date() - session.startTime) / 1000 / 60) // minutes
    });
  }
  
  return {
    currentTicker: currentTicker,
    sessions: sessions
  };
});

ipcMain.handle('get-ticker-timeline', (event, ticker) => {
  return getTickerTimeline(ticker);
});

ipcMain.handle('clear-ticker-session', (event, ticker) => {
  if (tickerSessions.has(ticker)) {
    const session = tickerSessions.get(ticker);
    
    // Clean up screenshot files
    session.screenshots.forEach(screenshot => {
      try {
        if (fs.existsSync(screenshot.path)) {
          fs.unlinkSync(screenshot.path);
        }
      } catch (error) {
        console.error('Error removing screenshot:', error);
      }
    });
    
    // Remove session folder
    try {
      if (fs.existsSync(session.sessionFolder)) {
        fs.rmSync(session.sessionFolder, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error removing session folder:', error);
    }
    
    tickerSessions.delete(ticker);
    
    if (currentTicker === ticker) {
      currentTicker = null;
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Session not found' };
});

ipcMain.handle('clear-all-ticker-sessions', () => {
  // Clean up all sessions
  for (const [ticker, session] of tickerSessions.entries()) {
    session.screenshots.forEach(screenshot => {
      try {
        if (fs.existsSync(screenshot.path)) {
          fs.unlinkSync(screenshot.path);
        }
      } catch (error) {
        console.error('Error removing screenshot:', error);
      }
    });
    
    try {
      if (fs.existsSync(session.sessionFolder)) {
        fs.rmSync(session.sessionFolder, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error removing session folder:', error);
    }
  }
  
  tickerSessions.clear();
  currentTicker = null;
  activeTickerSessionId = null; // Clear the global active session ID
  
  return { success: true };
});

// Add IPC handler to end the active ticker session
ipcMain.handle('end-active-ticker-session', async () => {
  try {
    if (!currentUserId || !activeTickerSessionId) {
      return { success: false, error: 'No active session or user' };
    }
    
    // Note: Session end webhook removed - only triggered manually when starting new ticker session
    
    // End the session in Supabase
    const { error } = await supabase
      .from('ticker_sessions')
      .update({
        is_active: false,
        session_end: new Date().toISOString()
      })
      .eq('id', activeTickerSessionId);
    if (error) {
      return { success: false, error: error.message };
    }
    // Update in-memory state
    if (currentTicker && tickerSessions.has(currentTicker)) {
      tickerSessions.delete(currentTicker);
    }
    currentTicker = null;
    activeTickerSessionId = null;
    
    // Stop AI loop when session ends
    stopAILoop();
    stopBatchAnalysisLoop();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Manual ticker detection from screenshot
ipcMain.handle('detect-ticker', async (event, screenshotIdentifier) => {
  try {
    if (!currentUserId) {
      return { success: false, error: 'No user authenticated' };
    }
    
    console.log('🔍 Manual ticker detection requested for:', screenshotIdentifier);
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('🔍 Current user ID:', currentUserId);
    
    // Get the screenshot from Supabase
    let screenshot;
    
    // Try to get by ID first, then by filename
    if (screenshotIdentifier.includes('-') && screenshotIdentifier.length > 10) {
      // Looks like a UUID
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('id', screenshotIdentifier)
        .eq('user_id', currentUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching screenshot by ID:', error);
      } else {
        screenshot = data;
      }
    }
    
    // If not found by ID, try by filename
    if (!screenshot) {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('filename', screenshotIdentifier)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching screenshot by filename:', error);
      } else {
        screenshot = data;
      }
    }
    
    // If still not found, get the most recent screenshot
    if (!screenshot) {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching latest screenshot:', error);
        return { success: false, error: 'No screenshots found' };
      }
      
      screenshot = data;
    }
    
    if (!screenshot) {
      return { success: false, error: 'No screenshots found' };
    }
    
    console.log('📸 Using screenshot:', screenshot.filename);
    
    // Download the screenshot from Supabase Storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('screenshots')
      .download(screenshot.storage_path);
    
    if (downloadError) {
      console.error('Error downloading screenshot:', downloadError);
      return { success: false, error: 'Could not download screenshot' };
    }
    
    // Convert to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // Use AI to detect ticker
    const tickerDetectionPrompt = `Analyze this trading screenshot and identify the stock ticker symbol being displayed.

Look for:
- Ticker symbols in the chart title or header (e.g., AAPL, TSLA, NVDA)
- Company names that can be mapped to tickers
- Any text that indicates what stock is being shown

Respond with ONLY the ticker symbol in uppercase (e.g., "AAPL") or "UNKNOWN" if you cannot determine it.
Do not include any other text, explanations, or formatting.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: tickerDetectionPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    });
    
    const detectedTicker = response.choices[0].message.content.trim().toUpperCase();
    
    // Check if ticker was successfully detected
    if (!detectedTicker || detectedTicker === 'UNKNOWN' || detectedTicker.length > 10 || detectedTicker.includes(' ')) {
      console.log('🔍 No valid ticker detected in screenshot');
      return { success: false, ticker: null }; // Don't return error, just no ticker found
    }
    
    console.log('🎯 Detected ticker:', detectedTicker);
    
    // Create or update ticker session
    let tickerSession;
    
    // Check if there's already an active session for this ticker
    const { data: existingSession, error: sessionError } = await supabase
      .from('ticker_sessions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('ticker', detectedTicker)
      .eq('is_active', true)
      .single();
    
    if (existingSession) {
      // Update existing session
      tickerSession = existingSession;
      activeTickerSessionId = existingSession.id; // <-- Ensure this is set for existing sessions
      console.log('📊 Using existing ticker session:', tickerSession.id);
    } else {
      // End any other active sessions
      await supabase
        .from('ticker_sessions')
        .update({ is_active: false, session_end: new Date().toISOString() })
        .eq('user_id', currentUserId)
        .eq('is_active', true);
      
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('ticker_sessions')
        .insert({
          user_id: currentUserId,
          ticker: detectedTicker,
          session_start: new Date().toISOString(),
          is_active: true,
          screenshot_count: 1,
          duration_minutes: 0,
          session_data: {
            detected_at: new Date().toISOString(),
            detection_screenshot_id: screenshot.id,
            manual_detection: true
          }
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating ticker session:', createError);
        return { success: false, error: 'Could not create ticker session' };
      }
      
      tickerSession = newSession;
      activeTickerSessionId = newSession.id;
      console.log('🎯 About to send webhook for new session:', detectedTicker, newSession.id);
      sendNewTickerWebhook(detectedTicker, newSession.id); // <-- send webhook ONLY for new sessions
      console.log('✅ Created new ticker session:', tickerSession.id);
    }
    
    // Update screenshot with ticker and session info
    await supabase
      .from('screenshots')
      .update({
        ticker: detectedTicker,
        ticker_session_id: tickerSession.id
      })
      .eq('id', screenshot.id);
    
    // Update current ticker in memory
    currentTicker = detectedTicker;
    
    // Update local session state
    if (tickerSessions.has(detectedTicker)) {
      // Update existing local session
      const localSession = tickerSessions.get(detectedTicker);
      localSession.supabaseId = tickerSession.id;
      localSession.lastActivity = new Date();
    } else {
      // Create new local session
      const sessionFolder = path.join(TICKER_SESSIONS_FOLDER, detectedTicker);
      if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
      }
      
      const localSession = {
        id: detectedTicker,
        supabaseId: tickerSession.id,
        ticker: detectedTicker,
        startTime: new Date(tickerSession.session_start),
        lastActivity: new Date(),
        sessionFolder: sessionFolder,
        screenshots: []
      };
      
      tickerSessions.set(detectedTicker, localSession);
    }
    
    console.log('✅ Ticker detection completed successfully:', detectedTicker);
    
    // Start AI loop for the new ticker session
    if (currentUserId) {
      startAILoop(currentUserId);
      startBatchAnalysisLoop(currentUserId);
    }
    
    return {
      success: true,
      ticker: detectedTicker,
      screenshotId: screenshot.id,
      sessionId: tickerSession.id
    };
    
  } catch (error) {
    console.error('Error in manual ticker detection:', error);
    return { success: false, error: `Detection failed: ${error.message}` };
  }
});

// Add function to check if a ticker session is still active
async function isTickerSessionActive(sessionId) {
  try {
    if (!sessionId || !currentUserId) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('ticker_sessions')
      .select('is_active')
      .eq('id', sessionId)
      .eq('user_id', currentUserId)
      .single();
    
    if (error) {
      console.error('Error checking session status:', error);
      return false;
    }
    
    return data?.is_active || false;
  } catch (error) {
    console.error('Error checking session status:', error);
    return false;
  }
}

// Add function to send webhook for each screenshot during active session
async function sendScreenshotWebhook(ticker, sessionId, screenshotInfo) {
  try {
    // Check if session is still active before sending webhook
    const isActive = await isTickerSessionActive(sessionId);
    if (!isActive) {
      console.log('Session is no longer active, skipping webhook for screenshot');
      return;
    }
    
    const data = JSON.stringify({
      ticker: ticker,
      session_id: sessionId,
      screenshot: {
        filename: screenshotInfo.filename,
        timestamp: screenshotInfo.timestamp,
        public_url: screenshotInfo.publicUrl
      },
      event_type: 'new_screenshot'
    });

    const url = 'https://rickiren.app.n8n.cloud/webhook/new-ticker-detected';
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        console.log('n8n screenshot webhook response:', res.statusCode, responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Error sending n8n screenshot webhook:', error);
    });

    req.write(data);
    req.end();
  } catch (error) {
    console.error('Error in sendScreenshotWebhook:', error);
  }
}

// Function to send webhook ONLY when manually starting a new ticker session
let lastWebhookCall = null; // Track last webhook call to prevent duplicates

function sendNewTickerWebhook(ticker, sessionId) {
  // Prevent duplicate webhook calls for the same session
  const webhookKey = `${ticker}-${sessionId}`;
  const now = Date.now();
  
  if (lastWebhookCall && lastWebhookCall.key === webhookKey && (now - lastWebhookCall.timestamp) < 5000) {
    console.log(`🚫 Preventing duplicate webhook call for ${ticker} (session: ${sessionId}) - called ${(now - lastWebhookCall.timestamp)}ms ago`);
    return;
  }
  
  console.log(`📡 Sending webhook for new ticker session: ${ticker} (session: ${sessionId})`);
  lastWebhookCall = { key: webhookKey, timestamp: now };
  const data = JSON.stringify({
    ticker: ticker,
    session_id: sessionId,
    event_type: 'session_started'
  });

  const url = 'https://rickiren.app.n8n.cloud/webhook/new-ticker-detected';
  const parsedUrl = new URL(url);

  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('n8n webhook response:', res.statusCode, responseData);
    });
  });

  req.on('error', (error) => {
    console.error('Error sending n8n webhook:', error);
  });

  req.write(data);
  req.end();
}

// Add function to load active ticker sessions from Supabase
async function loadActiveTickerSessions() {
  try {
    if (!currentUserId) {
      console.log('No current user - skipping session load');
      return;
    }
    
    // Get active ticker sessions from Supabase
    const { data: activeSessions, error } = await supabase
      .from('ticker_sessions')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('is_active', true)
      .order('session_start', { ascending: false });
    
    if (error) {
      console.error('Error loading active ticker sessions:', error);
      return;
    }
    
    if (activeSessions && activeSessions.length > 0) {
      // Load the most recent active session
      const latestSession = activeSessions[0];
      
      // Create local session data
      const sessionFolder = path.join(TICKER_SESSIONS_FOLDER, latestSession.ticker);
      if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
      }
      
      const localSession = {
        id: latestSession.ticker,
        supabaseId: latestSession.id,
        ticker: latestSession.ticker,
        startTime: new Date(latestSession.session_start),
        lastActivity: new Date(latestSession.updated_at),
        sessionFolder: sessionFolder,
        screenshots: [] // Will be populated as screenshots are processed
      };
      
      tickerSessions.set(latestSession.ticker, localSession);
      currentTicker = latestSession.ticker;
      
      console.log(`✅ Loaded active ticker session: ${latestSession.ticker} (ID: ${latestSession.id})`);
    }
  } catch (error) {
    console.error('Error loading active ticker sessions:', error);
  }
}

// Add function to end active sessions before clearing state
async function endActiveSessions() {
  try {
    if (!currentUserId) {
      return;
    }
    // End all active sessions for this user
    const { error } = await supabase
      .from('ticker_sessions')
      .update({ 
        is_active: false, 
        session_end: new Date().toISOString() 
      })
      .eq('user_id', currentUserId)
      .eq('is_active', true);
    if (error) {
      console.error('Error ending active sessions:', error);
    } else {
      console.log('✅ Ended all active ticker sessions');
    }
  } catch (error) {
    console.error('Error ending active sessions:', error);
  }
}

// AI Trading Coach Loop Function
async function startAILoop(userId) {
  console.log(`🤖 Starting AI trading coach loop for user: ${userId}`);
  
  // Clear any existing interval
  if (aiLoopInterval) {
    clearInterval(aiLoopInterval);
    aiLoopInterval = null;
  }
  
  // Reset tracking variables
  lastAIMessage = null;
  lastContextHash = null;
  lastMarketData = null;
  lastScreenshotCount = 0;
  consecutiveNoChangeCount = 0;
  
  // Start the AI loop every 10 seconds
  aiLoopInterval = setInterval(async () => {
    try {
      // 1. Fetch the active ticker session for the user
      const { data: activeSession, error: sessionError } = await supabase
        .from('ticker_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('session_start', { ascending: false })
        .limit(1)
        .single();
      
      if (sessionError || !activeSession) {
        console.log('🤖 No active ticker session found, skipping AI loop');
        return;
      }
      
      console.log(`🤖 Processing AI loop for ticker: ${activeSession.ticker}`);
      
      // 2. Check if we're in cooldown period after user message
      if (lastUserMessageTime && (Date.now() - lastUserMessageTime) < USER_MESSAGE_COOLDOWN) {
        console.log('🤖 Skipping AI loop - in cooldown period after user message');
        return;
      }
      
      // 3. Check if context has changed significantly
      const contextChanged = await hasContextChanged(activeSession);
      
      if (!contextChanged) {
        console.log('🤖 No significant context changes detected, skipping AI analysis');
        return;
      }
      
      // Reset consecutive count when context has changed
      consecutiveNoChangeCount = 0;
      
      // 3. Pull the latest context data
      const contextInfo = await buildContextInfo(activeSession);
      
      // 4. Send to OpenAI for analysis
      const aiResponse = await getAITradingAdvice(contextInfo, userId);
      
      // 5. Process the AI response
      if (aiResponse && aiResponse.trim()) {
        // Check if response is meaningful and different
        const lowerResponse = aiResponse.toLowerCase();
        const unimportantPhrases = [
          'nothing happening',
          'no significant changes',
          'no clear signal',
          'no actionable information',
          'continue monitoring',
          'no changes detected',
          'no new information',
          'same as before',
          'no update needed',
          'no new information'
        ];
        
        const isUnimportant = unimportantPhrases.some(phrase => 
          lowerResponse.includes(phrase)
        );
        
        // Check if response is significantly different from last message
        const isSignificantlyDifferent = !lastAIMessage || 
          !isSimilarMessage(aiResponse, lastAIMessage);
        
        if (!isUnimportant && isSignificantlyDifferent) {
          // Reset consecutive no-change count
          consecutiveNoChangeCount = 0;
          
          // Save to Supabase
          const { error: saveError } = await supabase
            .from('chat_messages')
            .insert({
              user_id: userId,
              message_type: 'ai',
              content: aiResponse,
              ticker: activeSession.ticker,
              context_data: {
                source: 'auto',
                session_id: activeSession.id,
                timestamp: new Date().toISOString()
              }
            });
          
          if (saveError) {
            console.error('🤖 Error saving AI message to database:', saveError);
          } else {
            console.log('🤖 AI message saved to database');
          }
          
          // Send to UI
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auto-ai-message', {
              message: aiResponse,
              ticker: activeSession.ticker,
              timestamp: new Date().toISOString()
            });
            console.log('🤖 AI message sent to UI');
          }
          
          lastAIMessage = aiResponse;
        } else {
          consecutiveNoChangeCount++;
          console.log(`🤖 AI response deemed unimportant or too similar (count: ${consecutiveNoChangeCount})`);
          
          // Stop sending messages if too many consecutive no-change responses
          if (consecutiveNoChangeCount >= MAX_CONSECUTIVE_NO_CHANGE) {
            console.log('🤖 Too many consecutive no-change responses, pausing AI loop');
            return;
          }
        }
      } else {
        console.log('🤖 No AI response generated, skipping');
      }
      
    } catch (error) {
      console.error('🤖 Error in AI loop:', error);
    }
  }, 10000); // 10 seconds
  
  console.log('🤖 AI trading coach loop started successfully');
}

// Helper function to check if context has changed significantly
async function hasContextChanged(activeSession) {
  try {
    const ticker = activeSession.ticker;
    
    // Get current market data
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .eq('ticker', ticker)
      .single();
    
    // Get current screenshot count
    const { count: screenshotCount, error: countError } = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('ticker_session_id', activeSession.id);
    
    if (countError) {
      console.error('Error getting screenshot count:', countError);
      return false;
    }
    
    // Check if market data has changed significantly
    let marketDataChanged = false;
    if (!marketError && marketData) {
      if (!lastMarketData) {
        marketDataChanged = true;
      } else {
        // Check if price changed by more than 1% or volume changed significantly
        const priceChange = Math.abs((marketData.price - lastMarketData.price) / lastMarketData.price);
        const volumeChange = Math.abs((marketData.volume - lastMarketData.volume) / lastMarketData.volume);
        
        marketDataChanged = priceChange > 0.01 || volumeChange > 0.1; // 1% price change or 10% volume change
      }
      lastMarketData = marketData;
    }
    
    // Check if screenshot count has changed
    const screenshotCountChanged = screenshotCount !== lastScreenshotCount;
    lastScreenshotCount = screenshotCount;
    
    // Create a simple context hash
    const contextHash = `${ticker}-${marketData?.price || 'no-data'}-${marketData?.volume || 'no-data'}-${screenshotCount}-${activeSession.screenshot_count}`;
    const contextHashChanged = contextHash !== lastContextHash;
    lastContextHash = contextHash;
    
    const hasChanged = marketDataChanged || screenshotCountChanged || contextHashChanged;
    
    if (hasChanged) {
      console.log(`🤖 Context changed detected: market=${marketDataChanged}, screenshots=${screenshotCountChanged}, hash=${contextHashChanged}`);
    }
    
    return hasChanged;
    
  } catch (error) {
    console.error('Error checking context changes:', error);
    return false;
  }
}

// Helper function to check if two messages are similar
function isSimilarMessage(message1, message2) {
  if (!message1 || !message2) return false;
  
  // Convert to lowercase for comparison
  const msg1 = message1.toLowerCase();
  const msg2 = message2.toLowerCase();
  
  // Check for exact match
  if (msg1 === msg2) return true;
  
  // Check for similar structure (same decision type)
  const decisionTypes = ['yes', 'no', 'hold', 'exit'];
  const msg1Decision = decisionTypes.find(type => msg1.includes(type));
  const msg2Decision = decisionTypes.find(type => msg2.includes(type));
  
  if (msg1Decision && msg2Decision && msg1Decision === msg2Decision) {
    // Same decision type, check if reasoning is similar
    const similarity = calculateStringSimilarity(msg1, msg2);
    return similarity > 0.7; // 70% similarity threshold
  }
  
  return false;
}

// Helper function to calculate string similarity
function calculateStringSimilarity(str1, str2) {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

// Helper function to build context information for AI
async function buildContextInfo(activeSession) {
  try {
    const ticker = activeSession.ticker;
    let contextInfo = `TICKER: ${ticker}\n`;
    contextInfo += `SESSION START: ${activeSession.session_start}\n`;
    contextInfo += `SCREENSHOT COUNT: ${activeSession.screenshot_count}\n`;
    
    // Get latest market data for this ticker
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .eq('ticker', ticker)
      .single();
    
    if (!marketError && marketData) {
      contextInfo += `\nMARKET DATA:\n`;
      contextInfo += `Price: $${marketData.price}\n`;
      contextInfo += `Change: ${marketData.change_percent}%\n`;
      contextInfo += `Volume: ${marketData.volume?.toLocaleString() || 'N/A'}\n`;
      contextInfo += `High: $${marketData.high}\n`;
      contextInfo += `Low: $${marketData.low}\n`;
      contextInfo += `Open: $${marketData.open}\n`;
      contextInfo += `Last Updated: ${marketData.last_updated}\n`;
    }
    
    // Get recent screenshots and their analysis
    const { data: recentScreenshots, error: screenshotError } = await supabase
      .from('screenshots')
      .select('*')
      .eq('ticker_session_id', activeSession.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!screenshotError && recentScreenshots && recentScreenshots.length > 0) {
      contextInfo += `\nRECENT SCREENSHOTS:\n`;
      recentScreenshots.forEach((screenshot, index) => {
        contextInfo += `${index + 1}. ${screenshot.filename} (${screenshot.created_at})\n`;
        if (screenshot.analysis_result) {
          contextInfo += `   Analysis: ${screenshot.analysis_result}\n`;
        }
        if (screenshot.ai_grade) {
          contextInfo += `   Grade: ${screenshot.ai_grade}\n`;
        }
        if (screenshot.detected_patterns && screenshot.detected_patterns.length > 0) {
          contextInfo += `   Patterns: ${screenshot.detected_patterns.join(', ')}\n`;
        }
      });
    }
    
    // Get recent batch analysis summaries for context
    const { data: recentBatchAnalysis, error: batchError } = await supabase
      .from('batch_analysis')
      .select('summary, created_at, screenshot_count')
      .eq('user_id', activeSession.user_id)
      .eq('ticker', ticker)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (!batchError && recentBatchAnalysis && recentBatchAnalysis.length > 0) {
      contextInfo += `\n📊 RECENT BATCH ANALYSIS:\n`;
      recentBatchAnalysis.forEach((analysis, index) => {
        const time = new Date(analysis.created_at).toLocaleTimeString('en-US', { hour12: false });
        contextInfo += `${index + 1}. [${time}] ${analysis.screenshot_count} screenshots: ${analysis.summary.substring(0, 200)}${analysis.summary.length > 200 ? '...' : ''}\n`;
      });
    }
    
    // Get recent chat messages for context
    const { data: recentMessages, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', activeSession.user_id)
      .eq('ticker', ticker)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!messageError && recentMessages && recentMessages.length > 0) {
      contextInfo += `\nRECENT CONVERSATION:\n`;
      recentMessages.reverse().forEach(message => {
        const role = message.message_type === 'user' ? 'USER' : 'AI';
        contextInfo += `${role}: ${message.content}\n`;
      });
    }
    
    // TODO: Add Level 2 data and technical summaries when available
    // contextInfo += `\nLEVEL 2 DATA:\n[To be implemented]\n`;
    // contextInfo += `\nTECHNICAL SUMMARIES:\n[To be implemented]\n`;
    
    return contextInfo;
    
  } catch (error) {
    console.error('Error building context info:', error);
    return `TICKER: ${activeSession.ticker}\nERROR: Could not build full context`;
  }
}

// Helper function to get AI trading advice
async function getAITradingAdvice(contextInfo, userId) {
  try {
    const systemPrompt = `You are a world-class real-time trading coach — the perfect fusion of GPT-4's intelligence, the market mastery of elite traders like Mark Minervini, and the psychological strength of Tony Robbins.

You are coaching a high-performance trader who needs clear, fast, decisive input while actively trading. They do not want fluff, theory, or hesitation.

🔥 You always speak with conviction. Every message should be actionable, strong, and clear. You NEVER hedge. There are only 4 possible stances:
- YES (enter now)
- NO (avoid this)
- HOLD (wait)
- EXIT (get out now)

You NEVER say "be cautious," "it might," "could be," or "seems like." Replace all soft or uncertain language with strong, directional commands.

CRITICAL: Only respond if there is NEW, ACTIONABLE information or a SIGNIFICANT change in the situation. If the context is the same as before or there's nothing new to report, respond with "NO NEW INFORMATION" or simply don't respond.

Do NOT repeat the same advice unless the situation has materially changed. Each message must provide fresh, valuable insight.

Use strong language like YES / NO / EXIT / HOLD. Be decisive and direct.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Analyze this trading context and provide real-time coaching advice:\n\n${contextInfo}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });
    
    return response.choices[0].message.content.trim();
    
  } catch (error) {
    console.error('Error getting AI trading advice:', error);
    return null;
  }
}

// Function to stop AI loop
function stopAILoop() {
  if (aiLoopInterval) {
    clearInterval(aiLoopInterval);
    aiLoopInterval = null;
    console.log('🤖 AI trading coach loop stopped');
  }
}

// Batch Analysis Loop Function
async function startBatchAnalysisLoop(userId) {
  console.log(`📊 Starting batch analysis loop for user: ${userId}`);
  
  // Clear any existing interval
  if (batchAnalysisInterval) {
    clearInterval(batchAnalysisInterval);
    batchAnalysisInterval = null;
  }
  
  // Reset last analysis time
  lastBatchAnalysisTime = null;
  
  // Start the batch analysis loop every 20 seconds
  batchAnalysisInterval = setInterval(async () => {
    try {
      // 1. Fetch the active ticker session for the user
      const { data: activeSession, error: sessionError } = await supabase
        .from('ticker_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('session_start', { ascending: false })
        .limit(1)
        .single();
      
      if (sessionError || !activeSession) {
        console.log('📊 No active ticker session found, skipping batch analysis');
        return;
      }
      
      console.log(`📊 Checking batch analysis for ticker: ${activeSession.ticker}`);
      
      // 2. Check if we should trigger batch analysis
      const shouldTrigger = await shouldTriggerBatchAnalysis(
        activeSession.id, 
        userId, 
        lastBatchAnalysisTime
      );
      
      if (!shouldTrigger) {
        console.log('📊 Batch analysis conditions not met, skipping');
        return;
      }
      
      // 3. Trigger batch analysis
      console.log(`📊 Triggering batch analysis for ${activeSession.ticker}`);
      const analysisResult = await triggerBatchAnalysisForSession(
        activeSession.ticker,
        activeSession.id,
        userId,
        3, // min screenshots
        5  // max screenshots
      );
      
      if (analysisResult) {
        console.log(`📊 Batch analysis completed for ${activeSession.ticker}:`, analysisResult.summary.substring(0, 100) + '...');
        lastBatchAnalysisTime = new Date().toISOString();
        
        // Batch analysis is stored in database for AI context - no need to send to UI as chat message
        console.log(`📊 Batch analysis stored in database for ${activeSession.ticker} (ID: ${analysisResult.analysis_id})`);
      } else {
        console.log('📊 Batch analysis failed or returned no result');
      }
      
    } catch (error) {
      console.error('📊 Error in batch analysis loop:', error);
    }
  }, 20000); // 20 seconds
  
  console.log('📊 Batch analysis loop started successfully');
}

// Function to stop batch analysis loop
function stopBatchAnalysisLoop() {
  if (batchAnalysisInterval) {
    clearInterval(batchAnalysisInterval);
    batchAnalysisInterval = null;
    console.log('📊 Batch analysis loop stopped');
  }
}

// IPC handlers for AI loop management
ipcMain.handle('start-ai-loop', async (event, userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    startAILoop(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-ai-loop', () => {
  try {
    stopAILoop();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-ai-loop-status', () => {
  return {
    isRunning: aiLoopInterval !== null,
    lastMessage: lastAIMessage
  };
});

// IPC handlers for batch analysis management
ipcMain.handle('start-batch-analysis-loop', async (event, userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }
    startBatchAnalysisLoop(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-batch-analysis-loop', () => {
  try {
    stopBatchAnalysisLoop();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-batch-analysis-status', () => {
  return {
    isRunning: batchAnalysisInterval !== null,
    lastAnalysisTime: lastBatchAnalysisTime
  };
});
