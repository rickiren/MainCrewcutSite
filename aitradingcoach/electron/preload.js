const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Listen for AI screenshot analysis results
  onScreenshotAnalysis: (callback) => {
    ipcRenderer.on('ai-screenshot-analysis', (event, data) => {
      callback(data);
    });
  },
  
  // Listen for screenshot capture events
  onScreenshotCaptured: (callback) => {
    ipcRenderer.on('screenshot-captured', (event, data) => {
      callback(data);
    });
  },
  
  onScreenshotError: (callback) => {
    ipcRenderer.on('screenshot-error', (event, data) => {
      callback(data);
    });
  },
  
  // Get folder status
  getFolderStatus: () => ipcRenderer.invoke('get-folder-status'),
  
  // Get latest screenshot info
  getLatestScreenshotInfo: () => ipcRenderer.invoke('get-latest-screenshot-info'),
  
  // Send user message to AI
  sendUserMessage: (message) => ipcRenderer.invoke('send-user-message', message),
  
  // Screenshot capture methods
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  startScreenshotCapture: (sourceId) => ipcRenderer.invoke('start-screenshot-capture', sourceId),
  stopScreenshotCapture: () => ipcRenderer.invoke('stop-screenshot-capture'),
  getCaptureStatus: () => ipcRenderer.invoke('get-capture-status'),
  getScreenshotsFolder: () => ipcRenderer.invoke('get-screenshots-folder'),
  getScreenshotFiles: () => ipcRenderer.invoke('get-screenshot-files'),
  
  // Remove listener
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // User management
  setCurrentUser: (userId) => ipcRenderer.invoke('set-current-user', userId),
  
  // Conversation history management
  getConversationHistory: () => ipcRenderer.invoke('get-conversation-history'),
  clearConversationHistory: () => ipcRenderer.invoke('clear-conversation-history'),
  
  // Ticker session management
  getTickerSessions: () => ipcRenderer.invoke('get-ticker-sessions'),
  getTickerTimeline: (ticker) => ipcRenderer.invoke('get-ticker-timeline', ticker),
  clearTickerSession: (ticker) => ipcRenderer.invoke('clear-ticker-session', ticker),
  clearAllTickerSessions: () => ipcRenderer.invoke('clear-all-ticker-sessions'),
  
  // Ticker detection
  detectTicker: (screenshotId) => ipcRenderer.invoke('detect-ticker', screenshotId),
  // End active ticker session
  endActiveTickerSession: () => ipcRenderer.invoke('end-active-ticker-session'),
  
  // AI Loop management
  startAILoop: (userId) => ipcRenderer.invoke('start-ai-loop', userId),
  stopAILoop: () => ipcRenderer.invoke('stop-ai-loop'),
  getAILoopStatus: () => ipcRenderer.invoke('get-ai-loop-status'),
  
  // Listen for auto AI messages
  onAutoAIMessage: (callback) => {
    ipcRenderer.on('auto-ai-message', (event, data) => {
      callback(data);
    });
  },
  
  // Batch Analysis management
  startBatchAnalysisLoop: (userId) => ipcRenderer.invoke('start-batch-analysis-loop', userId),
  stopBatchAnalysisLoop: () => ipcRenderer.invoke('stop-batch-analysis-loop'),
  getBatchAnalysisStatus: () => ipcRenderer.invoke('get-batch-analysis-status'),
  
  // Listen for batch analysis completion
  onBatchAnalysisComplete: (callback) => {
    ipcRenderer.on('batch-analysis-complete', (event, data) => {
      callback(data);
    });
  }
});