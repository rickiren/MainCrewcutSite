import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Play, 
  Square, 
  Monitor, 
  AppWindow as Window, 
  RefreshCw, 
  Folder, 
  Image, 
  X,
  ChevronDown,
  ChevronUp,
  Circle
} from 'lucide-react';
import type { DesktopSource, ScreenshotFile } from '../types/electron';

interface ScreenshotCaptureProps {
  onCaptureStatusChange?: (isCapturing: boolean) => void;
  onClose?: () => void;
}

export default function ScreenshotCapture({ onCaptureStatusChange, onClose }: ScreenshotCaptureProps) {
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshotsFolder, setScreenshotsFolder] = useState<{path: string, exists: boolean} | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<ScreenshotFile[]>([]);
  const [lastCaptured, setLastCaptured] = useState<string>('');
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);

  // Load desktop sources
  const loadSources = async () => {
    if (!window.electronAPI) return;
    
    setIsLoading(true);
    try {
      const desktopSources = await window.electronAPI.getDesktopSources();
      setSources(desktopSources);
    } catch (error) {
      console.error('Error loading desktop sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load screenshots folder info
  const loadScreenshotsInfo = async () => {
    if (!window.electronAPI) return;
    
    try {
      const folder = await window.electronAPI.getScreenshotsFolder();
      setScreenshotsFolder(folder);
      
      const files = await window.electronAPI.getScreenshotFiles();
      setScreenshotFiles(files);
    } catch (error) {
      console.error('Error loading screenshots info:', error);
    }
  };

  // Check capture status
  const checkCaptureStatus = async () => {
    if (!window.electronAPI) return;
    
    try {
      const status = await window.electronAPI.getCaptureStatus();
      setIsCapturing(status.capturing);
      onCaptureStatusChange?.(status.capturing);
    } catch (error) {
      console.error('Error checking capture status:', error);
    }
  };

  useEffect(() => {
    if (!window.electronAPI) return;

    loadSources();
    loadScreenshotsInfo();
    checkCaptureStatus();

    // Listen for screenshot events
    window.electronAPI.onScreenshotCaptured((data) => {
      setLastCaptured(data.filename);
      loadScreenshotsInfo(); // Refresh file list
    });

    window.electronAPI.onScreenshotError((data) => {
      console.error('Screenshot error:', data.error);
    });

    return () => {
      window.electronAPI.removeAllListeners('screenshot-captured');
      window.electronAPI.removeAllListeners('screenshot-error');
    };
  }, []);

  const handleStartCapture = async () => {
    if (!selectedSource || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.startScreenshotCapture(selectedSource);
      if (result.success) {
        setIsCapturing(result.capturing);
        onCaptureStatusChange?.(result.capturing);
      }
    } catch (error) {
      console.error('Error starting capture:', error);
    }
  };

  const handleStopCapture = async () => {
    if (!window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.stopScreenshotCapture();
      if (result.success) {
        setIsCapturing(result.capturing);
        onCaptureStatusChange?.(result.capturing);
      }
    } catch (error) {
      console.error('Error stopping capture:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSelectedSourceName = () => {
    const source = sources.find(s => s.id === selectedSource);
    return source ? source.name : 'Select a source';
  };

  if (!window.electronAPI) {
    return (
      <div className="bg-gray-900 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-yellow-400 font-semibold">Screenshot Capture</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-yellow-300 text-sm">
          Screenshot capture is only available in the desktop app
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-green-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-green-700 drag-region">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-green-400" />
            <h3 className="text-green-400 font-semibold">Screenshot Capture</h3>
            <div className="flex items-center space-x-2">
              <Circle className={`w-2 h-2 ${isCapturing ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} fill="currentColor" />
              <span className="text-xs text-gray-400">
                {isCapturing ? 'Recording' : 'Stopped'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSources}
              disabled={isLoading}
              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 p-1 no-drag"
              title="Refresh sources"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors p-1 no-drag"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Source Selection Card */}
        <div className="bg-black border border-green-800 rounded-lg p-4">
          <button
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-green-400 font-medium">Select Window/Screen</h4>
            {isSourcesExpanded ? (
              <ChevronUp className="w-4 h-4 text-green-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-green-400" />
            )}
          </button>

          {isSourcesExpanded && (
            <>
              {/* Selected Source Display */}
              <div className="mb-3 p-3 bg-gray-900 border border-green-800 rounded-lg">
                <div className="text-sm text-green-400 mb-1">Selected:</div>
                <div className="text-green-300 font-mono text-sm truncate">
                  {getSelectedSourceName()}
                </div>
              </div>

              {/* Source Grid */}
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 no-drag ${
                      selectedSource === source.id
                        ? 'border-green-400 bg-green-900/30 shadow-lg'
                        : 'border-green-800 hover:border-green-600 hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={source.thumbnail}
                          alt={source.name}
                          className="w-12 h-8 object-cover rounded border border-green-800"
                        />
                        {source.appIcon && (
                          <img
                            src={source.appIcon}
                            alt="App icon"
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {source.id.startsWith('screen') ? (
                            <Monitor className="w-3 h-3 text-green-400 flex-shrink-0" />
                          ) : (
                            <Window className="w-3 h-3 text-green-400 flex-shrink-0" />
                          )}
                          <span className="text-green-300 text-sm font-medium truncate">
                            {source.name}
                          </span>
                        </div>
                        <p className="text-green-600 text-xs truncate">
                          {source.id.startsWith('screen') ? 'Screen' : 'Window'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Capture Controls Card */}
        <div className="bg-black border border-green-800 rounded-lg p-4">
          <h4 className="text-green-400 font-medium mb-3">Capture Controls</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!isCapturing ? (
                <button
                  onClick={handleStartCapture}
                  disabled={!selectedSource}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Capture</span>
                </button>
              ) : (
                <button
                  onClick={handleStopCapture}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Capture</span>
                </button>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-green-400 mb-1">Status</div>
              <div className="flex items-center space-x-2">
                <Circle 
                  className={`w-2 h-2 ${isCapturing ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} 
                  fill="currentColor" 
                />
                <span className="text-xs text-green-300">
                  {isCapturing ? 'Capturing every 5s' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Folder Info Card */}
        {screenshotsFolder && (
          <div className="bg-black border border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Folder className="w-4 h-4 text-green-400" />
              <h4 className="text-green-400 font-medium">Local Storage</h4>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-green-600 font-mono break-all bg-gray-900 p-2 rounded border border-green-800">
                {screenshotsFolder.path}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-300">
                  {screenshotFiles.length} files stored
                </span>
                {lastCaptured && (
                  <span className="text-blue-400 text-xs">
                    Latest: {lastCaptured}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Screenshots Card */}
        {screenshotFiles.length > 0 && (
          <div className="bg-black border border-green-800 rounded-lg p-4">
            <button
              onClick={() => setIsFilesExpanded(!isFilesExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center space-x-2">
                <Image className="w-4 h-4 text-green-400" />
                <h4 className="text-green-400 font-medium">Recent Screenshots</h4>
                <span className="text-xs text-green-600 bg-green-900/30 px-2 py-1 rounded">
                  {screenshotFiles.length}
                </span>
              </div>
              {isFilesExpanded ? (
                <ChevronUp className="w-4 h-4 text-green-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-green-400" />
              )}
            </button>
            
            {isFilesExpanded && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {screenshotFiles.slice(0, 10).map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-3 bg-gray-900 border border-green-800 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-green-300 text-sm font-mono truncate">
                        {file.name}
                      </div>
                      <div className="text-green-600 text-xs">
                        {formatTimestamp(file.mtime)}
                      </div>
                    </div>
                    <div className="text-green-500 text-xs ml-3">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}