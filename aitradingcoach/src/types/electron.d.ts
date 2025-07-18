export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string;
  display_id: string;
  appIcon: string | null;
}

export interface ScreenshotFile {
  name: string;
  path: string;
  size: number;
  mtime: string;
}

export interface ElectronAPI {
  onScreenshotAnalysis: (callback: (data: {
    message: string;
    timestamp: string;
    filename?: string;
    isError?: boolean;
    messageType?: string;
    ticker?: string;
    sessionInfo?: {
      screenshotCount: number;
      batchAnalysisCount: number;
      duration: number;
      startTime: string;
    };
  }) => void) => void;
  
  onScreenshotCaptured: (callback: (data: {
    filename: string;
    filepath: string;
    timestamp: string;
  }) => void) => void;
  
  onScreenshotError: (callback: (data: {
    error: string;
    timestamp: string;
  }) => void) => void;
  
  getFolderStatus: () => Promise<{exists: boolean, path: string}>;
  getLatestScreenshotInfo: () => Promise<{name: string, mtime: string} | null>;
  
  sendUserMessage: (message: string) => Promise<{
    success: boolean;
    message?: string;
    contextScreenshots?: number;
    error?: string;
    currentTicker?: string | null;
    sessionDuration?: number;
    sessionContext?: {
      ticker: string;
      sessionDuration: number;
      screenshotCount: number;
      recentGrades: string[];
      dominantPatterns: string[];
    } | null;
  }>;
  
  getDesktopSources: () => Promise<DesktopSource[]>;
  startScreenshotCapture: (sourceId: string) => Promise<{success: boolean, capturing: boolean}>;
  stopScreenshotCapture: () => Promise<{success: boolean, capturing: boolean}>;
  getCaptureStatus: () => Promise<{capturing: boolean}>;
  getScreenshotsFolder: () => Promise<{path: string, exists: boolean}>;
  getScreenshotFiles: () => Promise<ScreenshotFile[]>;
  
  removeAllListeners: (channel: string) => void;
  
  // User management
  setCurrentUser?: (userId: string) => Promise<{success: boolean}>;
  
  // Conversation history management
  getConversationHistory: () => Promise<{
    messageCount: number;
    lastMessages: Array<{
      role: string;
      contentType: string;
      preview: string;
    }>;
  }>;
  clearConversationHistory: () => Promise<{success: boolean, messageCount: number}>;
  
  // Ticker session management
  getTickerSessions: () => Promise<{
    currentTicker: string | null;
    sessions: Array<{
      ticker: string;
      screenshotCount: number;
      batchAnalysisCount: number;
      startTime: string;
      lastActivity: string;
      duration: number;
    }>;
  }>;
  getTickerTimeline: (ticker: string) => Promise<{
    ticker: string;
    sessionDuration: number;
    screenshotCount: number;
    timeline: Array<{
      index: number;
      timestamp: string;
      filename: string;
      path: string;
    }>;
  } | null>;
  clearTickerSession: (ticker: string) => Promise<{success: boolean, error?: string}>;
  clearAllTickerSessions: () => Promise<{success: boolean}>;
  
  // Ticker detection
  detectTicker: (screenshotId: string) => Promise<{
    success: boolean;
    ticker?: string;
    screenshotId?: string;
    sessionId?: string;
    error?: string;
  }>;
  // End active ticker session
  endActiveTickerSession: () => Promise<{ success: boolean; error?: string }>;
  
  // AI Loop management
  startAILoop: (userId: string) => Promise<{ success: boolean; error?: string }>;
  stopAILoop: () => Promise<{ success: boolean; error?: string }>;
  getAILoopStatus: () => Promise<{
    isRunning: boolean;
    lastMessage: string | null;
  }>;
  
  // Listen for auto AI messages
  onAutoAIMessage: (callback: (data: {
    message: string;
    ticker: string;
    timestamp: string;
  }) => void) => void;
  
  // Batch Analysis management
  startBatchAnalysisLoop: (userId: string) => Promise<{ success: boolean; error?: string }>;
  stopBatchAnalysisLoop: () => Promise<{ success: boolean; error?: string }>;
  getBatchAnalysisStatus: () => Promise<{
    isRunning: boolean;
    lastAnalysisTime: string | null;
  }>;
  
  // Listen for batch analysis completion
  onBatchAnalysisComplete: (callback: (data: {
    ticker: string;
    summary: string;
    screenshotCount: number;
    timestamp: string;
    analysisId: string;
  }) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}