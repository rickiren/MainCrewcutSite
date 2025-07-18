import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Camera, AlertCircle, CheckCircle, Clock, Settings, MessageSquare, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import AuthWrapper from './components/AuthWrapper';
import { DatabaseService, supabase } from './lib/supabase';
import ScreenshotCapture from './components/ScreenshotCapture';
import TradeStateButton from './components/TradeStateButton';

type Message = {
  id: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  username?: string;
  isError?: boolean;
  filename?: string;
  messageType?: string;
};

function formatNumber(n: number | null | undefined) {
  if (n == null) return '-';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function ScannersTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await DatabaseService.getLowFloatTickers(100);
      setRows(data);
    } catch (error) {
      console.error('Error fetching low float tickers:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('low_float_tickers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'low_float_tickers' },
        () => {
          fetchData(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Top Gainers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border border-gray-800 text-white font-mono">
          <thead>
            <tr className="bg-[#0a1627] border-b border-gray-700">
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-right border-r border-gray-700 font-semibold">Change %</th>
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-left border-r border-gray-700 font-semibold">Ticker</th>
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-right border-r border-gray-700 font-semibold">Price</th>
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-right border-r border-gray-700 font-semibold">Volume</th>
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-right border-r border-gray-700 font-semibold">Float</th>
              <th className="px-2 py-1 text-xs tracking-wide uppercase text-white text-right font-semibold">Filtered At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-gray-400 text-center py-8">Loading...</td></tr>
            ) : rows.map((row, idx) => {
              const isPositive = row.change_percent >= 0;
              const changeBg = 'bg-[#00FF00]';
              const changeText = 'text-black';
              const arrow = isPositive ? '▲' : '▼';
              const tickerHot = row.rel_vol > 3;
              return (
                <tr key={row.ticker} className={`${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}> 
                  {/* Change % */}
                  <td className={`px-2 py-1 font-bold text-right align-middle border-r border-gray-700 ${changeBg} ${changeText}`}> 
                    {row.change_percent !== undefined && row.change_percent !== null ? (
                      <span>{isPositive ? '+' : ''}{row.change_percent.toFixed(2)}% <span className="text-xs align-middle">{arrow}</span></span>
                    ) : '-'}
                  </td>
                  {/* Ticker */}
                  <td className={`px-2 py-1 font-bold text-left border-r border-gray-700`}> 
                    <span className={`cursor-pointer hover:underline`}>{row.ticker}</span>
                  </td>
                  {/* Price */}
                  <td className="px-2 py-1 text-right border-r border-gray-700">{row.price !== undefined && row.price !== null ? row.price.toFixed(2) : '-'}</td>
                  {/* Volume */}
                  <td className="px-2 py-1 text-right border-r border-gray-700 bg-gray-800">{formatNumber(row.volume)}</td>
                  {/* Float */}
                  <td className="px-2 py-1 text-right border-r border-gray-700 font-bold bg-cyan-400 text-black">{formatNumber(row.float)}</td>
                  {/* Filtered At */}
                  <td className="px-2 py-1 text-xs text-right">{row.filtered_at ? new Date(row.filtered_at).toLocaleString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TradingCoachApp({ user }: { user: SupabaseUser }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [userCount, setUserCount] = useState(1);
  const [folderStatus, setFolderStatus] = useState<{exists: boolean, path: string} | null>(null);
  const [lastScreenshot, setLastScreenshot] = useState<{name: string, mtime: string} | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showCaptureSettings, setShowCaptureSettings] = useState(false);
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isDetectingTicker, setIsDetectingTicker] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);
  const [tickerSessionId, setTickerSessionId] = useState<string | null>(null);
  const [tickerSessionInfo, setTickerSessionInfo] = useState<{
    screenshotCount: number;
    batchAnalysisCount: number;
    duration: number;
    startTime: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [selectedTab, setSelectedTab] = useState<'chat' | 'scanners'>('chat');

  // Load chat history from Supabase on component mount
  useEffect(() => {
    // Set current user in Electron main process
    if (window.electronAPI && user?.id) {
      window.electronAPI.setCurrentUser?.(user.id);
    }
    
    const loadChatHistory = async () => {
      try {
        const history = await DatabaseService.getChatHistory(user.id, 20);
        const formattedMessages: Message[] = history.map(msg => ({
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: msg.message_type === 'user',
          username: msg.message_type === 'user' ? 'trader' : 
                   msg.message_type === 'system' ? 'system' : 
                   msg.message_type === 'user_response' ? 'AI_Coach' : 'AI_Coach',
          isError: msg.message_type === 'error',
          filename: msg.context_data?.filename,
          messageType: msg.message_type
        }));
        
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        } else {
          // Add initial system message if no history
          const initialMessage: Message = {
            id: '1',
            text: '🤖 AI Trading Coach connected - GPT-4o with persistent memory active',
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            }),
            isUser: false,
            username: 'system',
            messageType: 'system'
          };
          setMessages([initialMessage]);
          
          // Save initial message to database
          await DatabaseService.saveChatMessage({
            user_id: user.id,
            message_type: 'system',
            content: initialMessage.text
          });
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fallback to default message
        const initialMessage: Message = {
          id: '1',
          text: '🤖 AI Trading Coach ready (memory temporarily unavailable)',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: false,
          username: 'system',
          messageType: 'system'
        };
        setMessages([initialMessage]);
      }
    };

    loadChatHistory();
  }, [user.id]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we're in Electron environment
    if (window.electronAPI) {
      // CRITICAL: Clear any existing listeners to prevent duplicate handlers
      window.electronAPI.removeAllListeners('ai-screenshot-analysis');
      window.electronAPI.removeAllListeners('screenshot-captured');
      window.electronAPI.removeAllListeners('screenshot-error');
      window.electronAPI.removeAllListeners('batch-analysis-complete');
      window.electronAPI.removeAllListeners('auto-ai-message');
      
      // Check folder status
      window.electronAPI.getFolderStatus().then(status => {
        setFolderStatus(status);
      });

      // Listen for AI screenshot analysis
      window.electronAPI.onScreenshotAnalysis((data) => {
        // CRITICAL: Only process new screenshot analysis if app is fully initialized
        if (!isInitializedRef.current) {
          console.log('Ignoring screenshot analysis during initialization:', data.message.substring(0, 50) + '...');
          return;
        }
        
        // Update ticker info if provided
        if (data.ticker) {
          setCurrentTicker(data.ticker);
          if (data.sessionInfo) {
            setTickerSessionInfo({
              ...data.sessionInfo,
              batchAnalysisCount: 0 // Default value, will be updated by periodic check
            });
          }
        }
        
        const newMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          timestamp: data.timestamp,
          isUser: false,
          username: 'AI_Coach',
          isError: data.isError,
          filename: data.filename,
          messageType: data.messageType || 'screenshot_analysis'
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Save message to database
        DatabaseService.saveChatMessage({
          user_id: user.id,
          message_type: data.messageType || 'screenshot_analysis',
          content: data.message,
          ticker: data.ticker,
          context_data: {
            filename: data.filename,
            isError: data.isError,
            sessionInfo: data.sessionInfo
          }
        }).catch(error => console.error('Error saving AI message:', error));
        
        setIsPolling(true);
      });

      // Listen for batch analysis completion (for logging only - not creating chat messages)
      window.electronAPI.onBatchAnalysisComplete((data) => {
        console.log('📊 Batch analysis completed and stored in database:', data.ticker, data.screenshotCount, 'screenshots');
        // Batch analysis summaries are stored in database for AI context - not displayed as chat messages
      });

      // Listen for auto AI messages from the AI loop
      window.electronAPI.onAutoAIMessage((data) => {
        // CRITICAL: Only process auto AI messages if app is fully initialized
        if (!isInitializedRef.current) {
          console.log('Ignoring auto AI message during initialization:', data.message.substring(0, 50) + '...');
          return;
        }
        
        console.log('🤖 Auto AI message received:', data.message.substring(0, 100) + '...');
        
        const autoMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          timestamp: new Date(data.timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: false,
          username: 'AI_Coach',
          messageType: 'ai'
        };
        
        setMessages(prev => [...prev, autoMessage]);
        
        // Save auto AI message to database
        DatabaseService.saveChatMessage({
          user_id: user.id,
          message_type: 'ai',
          content: data.message,
          ticker: data.ticker,
          context_data: {
            source: 'auto',
            timestamp: data.timestamp
          }
        }).catch(error => console.error('Error saving auto AI message:', error));
      });

      // Check for latest screenshot info periodically
      const checkScreenshot = () => {
        window.electronAPI.getLatestScreenshotInfo().then(info => {
          setLastScreenshot(info);
        });
        
        // Also check current ticker session
        window.electronAPI.getTickerSessions().then(sessions => {
          setCurrentTicker(sessions.currentTicker);
          if (sessions.currentTicker && sessions.sessions.length > 0) {
            const currentSession = sessions.sessions.find(s => s.ticker === sessions.currentTicker);
            if (currentSession) {
              setTickerSessionInfo({
                screenshotCount: currentSession.screenshotCount,
                batchAnalysisCount: currentSession.batchAnalysisCount,
                duration: currentSession.duration,
                startTime: currentSession.startTime
              });
            }
          } else {
            setTickerSessionInfo(null);
          }
        });
      };

      checkScreenshot();
      const screenshotInterval = setInterval(checkScreenshot, 2000);

      // CRITICAL: Mark as initialized after a delay to prevent processing old data
      setTimeout(() => {
        isInitializedRef.current = true;
        console.log('App UI initialized - ready to process new AI messages');
      }, 8000); // Increased delay to ensure no old messages get through

      return () => {
        window.electronAPI.removeAllListeners('ai-screenshot-analysis');
        window.electronAPI.removeAllListeners('screenshot-captured');
        window.electronAPI.removeAllListeners('screenshot-error');
        window.electronAPI.removeAllListeners('batch-analysis-complete');
        window.electronAPI.removeAllListeners('auto-ai-message');
        clearInterval(screenshotInterval);
        isInitializedRef.current = false;
      };
    }

    // CRITICAL: Clear any potential cached data or state
    setIsPolling(false);
    setLastScreenshot(null);
    setIsAiThinking(false);
    
    console.log('UI state reset - fresh start');
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = inputValue.trim();
      
      // Add user message to chat immediately
      const newMessage: Message = {
        id: Date.now().toString(),
        text: userMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        isUser: true,
        username: 'trader'
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      
      // Save user message to database
      DatabaseService.saveChatMessage({
        user_id: user.id,
        message_type: 'user',
        content: userMessage,
        ticker: currentTicker
      }).catch(error => console.error('Error saving user message:', error));
      
      // Send to AI if in Electron environment
      if (window.electronAPI) {
        setIsAiThinking(true);
        
        try {
          const response = await window.electronAPI.sendUserMessage(userMessage);
          
          if (response.success && response.message) {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: response.message,
              timestamp: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }),
              isUser: false,
              username: 'AI_Coach',
              messageType: 'user_response'
            };
            
            // Add context info if screenshots were used
            if (response.contextScreenshots && response.contextScreenshots > 0) {
              let contextInfo = ` 📸 (${response.contextScreenshots} screenshot${response.contextScreenshots > 1 ? 's' : ''})`;
              if (response.currentTicker) {
                contextInfo += ` 📊 ${response.currentTicker}`;
                if (response.sessionDuration > 0) {
                  contextInfo += ` (${response.sessionDuration}m session)`;
                }
              }
              aiResponse.text += contextInfo;
            }
            
            setMessages(prev => [...prev, aiResponse]);
            
            // Note: AI response is already saved to database by the main process
            // No need to save again here to prevent duplicates
          } else {
            // Add error message
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: `Error: ${response.error || 'Failed to get AI response'}`,
              timestamp: new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              }),
              isUser: false,
              username: 'system',
              isError: true,
              messageType: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
            
            // Save error message to database
            DatabaseService.saveChatMessage({
              user_id: user.id,
              message_type: 'error',
              content: `Error: ${response.error || 'Failed to get AI response'}`,
              ticker: currentTicker
            }).catch(error => console.error('Error saving error message:', error));
          }
        } catch (error) {
          console.error('Error sending message to AI:', error);
        } finally {
          setIsAiThinking(false);
        }
      }
    }
  };

  const handleTickerDetection = async () => {
    if (!window.electronAPI || isDetectingTicker) {
      console.log('🚫 Ticker detection blocked - already in progress or no electron API');
      return;
    }
    
    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastDetectionTime < 3000) { // 3 second debounce
      console.log('🚫 Ticker detection blocked - too soon since last detection');
      return;
    }
    
    console.log('🔍 Starting ticker detection at:', new Date().toISOString());
    setLastDetectionTime(now);
    setIsDetectingTicker(true);
    
    try {
      // Get the most recent screenshot
      const recentScreenshots = await window.electronAPI.getScreenshotFiles();
      
      if (recentScreenshots.length === 0) {
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: '❌ No screenshots found. Please capture a screenshot first.',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: false,
          username: 'system',
          isError: true,
          messageType: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      const latestScreenshot = recentScreenshots[0];
      
      // Send ticker detection request to Electron
      const response = await window.electronAPI.detectTicker(latestScreenshot.supabaseId || latestScreenshot.name);
      
      if (response.success && response.ticker) {
        // Update current ticker state
        setCurrentTicker(response.ticker);
        
        // Set the ticker session ID if available
        if (response.sessionId) {
          setTickerSessionId(response.sessionId);
        }
        
        // Add success message only if ticker was found
        const successMessage: Message = {
          id: Date.now().toString(),
          text: `✅ New ticker detected: ${response.ticker}. I'll start watching this now.`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: false,
          username: 'system',
          messageType: 'ticker_detection'
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Save message to database
        DatabaseService.saveChatMessage({
          user_id: user.id,
          message_type: 'ticker_detection',
          content: successMessage.text,
          ticker: response.ticker,
          context_data: {
            screenshot_id: response.screenshotId,
            session_id: response.sessionId
          }
        }).catch(error => console.error('Error saving ticker detection message:', error));
        
      } else if (response.error) {
        // Only add error message if there was an actual error (not just no ticker found)
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: `❌ ${response.error}`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          isUser: false,
          username: 'system',
          isError: true,
          messageType: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Save error message to database
        DatabaseService.saveChatMessage({
          user_id: user.id,
          message_type: 'error',
          content: errorMessage.text
        }).catch(error => console.error('Error saving error message:', error));
      }
      
    } catch (error) {
      console.error('Error in ticker detection:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '❌ Error detecting ticker. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        isUser: false,
        username: 'system',
        isError: true,
        messageType: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('🔍 Ticker detection completed at:', new Date().toISOString());
      setIsDetectingTicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-950 border-r border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 drag-region">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">AI Trading Coach</h1>
                <p className="text-gray-400 text-xs">GPT-4o Vision Analysis</p>
              </div>
            </div>
            <button
              onClick={() => setShowCaptureSettings(!showCaptureSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors no-drag"
              title="Screenshot Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2">
            {/* Trade Status Indicator */}
            <div className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-700/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-medium text-sm">Trade Status</span>
              </div>
              <div className="text-orange-400 text-xs">
                Ready to trade
              </div>
            </div>
            
            {currentTicker && (
              <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-mono font-bold text-sm">{currentTicker}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {tickerSessionInfo && (
                    <div className="text-blue-400 text-xs">
                      {tickerSessionInfo.duration}m • {tickerSessionInfo.screenshotCount} shots • {tickerSessionInfo.batchAnalysisCount} batches
                    </div>
                  )}
                  {/* End Session Button */}
                  <button
                    onClick={async () => {
                      if (!window.electronAPI) return;
                      const result = await window.electronAPI.endActiveTickerSession();
                      if (result.success) {
                        setCurrentTicker(null);
                        setTickerSessionId(null);
                        setTickerSessionInfo(null);
                        setMessages(prev => [...prev, {
                          id: Date.now().toString(),
                          text: '🔚 Ticker session ended.',
                          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                          isUser: false,
                          username: 'system',
                          messageType: 'system'
                        }]);
                      } else {
                        setMessages(prev => [...prev, {
                          id: Date.now().toString(),
                          text: `❌ Failed to end session: ${result.error}`,
                          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                          isUser: false,
                          username: 'system',
                          isError: true,
                          messageType: 'error'
                        }]);
                      }
                    }}
                    className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    title="End this ticker session"
                  >
                    End Session
                  </button>
                </div>
              </div>
            )}

            {window.electronAPI && (
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Screenshot Monitor</span>
                </div>
                <div className="flex items-center space-x-2">
                  {folderStatus?.exists ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  {isPolling && (
                    <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                  )}
                  {isCaptureActive && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col gap-2 p-4">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selectedTab === 'chat' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            onClick={() => setSelectedTab('chat')}
          >
            <MessageSquare className="w-5 h-5" /> Chat
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selectedTab === 'scanners' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            onClick={() => setSelectedTab('scanners')}
          >
            <BarChart2 className="w-5 h-5" /> Scanners
          </button>
        </div>

        {/* Screenshot Capture Settings */}
        {showCaptureSettings && window.electronAPI && (
          <div className="border-b border-gray-700 max-h-96 overflow-y-auto">
            <ScreenshotCapture 
              onCaptureStatusChange={setIsCaptureActive}
              onClose={() => setShowCaptureSettings(false)}
            />
          </div>
        )}

        {/* Sidebar Content */}
        <div className="flex-1 p-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-medium text-sm mb-2">Session Info</h3>
              <div className="space-y-1 text-xs text-gray-400">
                <div>Connected: {userCount} user</div>
                {folderStatus && (
                  <div className={folderStatus.exists ? 'text-green-400' : 'text-yellow-400'}>
                    {folderStatus.exists ? '✓ Monitoring active' : '⚠ Setup required'}
                  </div>
                )}
                {lastScreenshot && (
                  <div className="text-blue-400">
                    Latest: {lastScreenshot.name.substring(0, 20)}...
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-medium text-sm mb-2">Features</h3>
              <div className="space-y-1 text-xs text-gray-400">
                <div>• Real-time screenshot analysis</div>
                <div>• Persistent conversation memory</div>
                <div>• Ticker session tracking</div>
                <div>• Trading pattern recognition</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {selectedTab === 'chat' ? (
          <>
            {/* Top drag region */}
            <div className="h-8 drag-region bg-gray-900"></div>

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <h2 className="text-white font-semibold">Trading Chat</h2>
                    <p className="text-gray-400 text-sm">
                      {isAiThinking ? 'AI is thinking...' : 'Ask questions or get screenshot analysis'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Trade State Button */}
                  <TradeStateButton
                    currentTicker={currentTicker}
                    tickerSessionId={tickerSessionId}
                    userId={user.id}
                    onTradeStateChange={(isInTrade) => {
                      // Optional: Add any additional logic when trade state changes
                      console.log('Trade state changed:', isInTrade);
                    }}
                  />
                  {isAiThinking && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  {message.username === 'system' ? (
                    <div className="w-full flex justify-center">
                      <div className="max-w-2xl px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 text-gray-300 text-sm">
                          <Bot className="w-4 h-4" />
                          <span>{message.text}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">{message.timestamp}</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-2xl ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.isUser 
                          ? 'bg-blue-600 text-white ml-auto' 
                          : message.isError 
                            ? 'bg-red-900/30 border border-red-700 text-red-300'
                            : 'bg-gray-800 text-gray-100'
                      }`}>
                        <div className="whitespace-pre-wrap break-words">
                          {message.text}
                        </div>
                        {message.filename && (
                          <div className="mt-2 flex items-center space-x-1 text-xs opacity-70">
                            <Camera className="w-3 h-3" />
                            <span>{message.filename}</span>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
                        message.isUser ? 'justify-end' : 'justify-start'
                      }`}>
                        {!message.isUser && (
                          <div className="flex items-center space-x-1">
                            <Bot className="w-3 h-3" />
                            <span>{message.username === 'AI_Coach' ? 'AI Coach' : message.username}</span>
                            <span>•</span>
                          </div>
                        )}
                        <span>{message.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-700 bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={isAiThinking ? "AI is responding..." : isDetectingTicker ? "Detecting ticker..." : "Ask your AI trading coach anything..."}
                      disabled={isAiThinking || isDetectingTicker}
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                      }}
                    />
                  </div>
                  
                  {/* Ticker Detection Button */}
                  <button
                    onClick={handleTickerDetection}
                    disabled={isAiThinking || isDetectingTicker || !window.electronAPI}
                    className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-colors flex items-center justify-center"
                    title="Detect ticker from latest screenshot"
                  >
                    <TrendingUp className={`w-4 h-4 ${isDetectingTicker ? 'animate-pulse' : ''}`} />
                  </button>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isAiThinking || isDetectingTicker || !inputValue.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Press Enter to send, Shift+Enter for new line • 📈 Detect ticker from screenshot
                </div>
              </div>
            </div>
          </>
        ) : (
          <ScannersTable />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      {(user) => <TradingCoachApp user={user} />}
    </AuthWrapper>
  );
}

export default App;