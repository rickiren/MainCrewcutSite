import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import net from 'net';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform process spawning
function spawnProcess(command, args, options = {}) {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    return spawn('cmd', ['/c', command, ...args], options);
  } else {
    return spawn(command, args, options);
  }
}

// Function to extract port from Vite output
function extractPortFromViteOutput(data) {
  const output = data.toString();
  
  // Look for patterns like "Local:   http://localhost:5173/"
  const localMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
  if (localMatch) {
    return parseInt(localMatch[1]);
  }
  
  // Look for patterns like "➜  Local:   http://localhost:5173/"
  const arrowMatch = output.match(/➜\s+Local:\s+http:\/\/localhost:(\d+)/);
  if (arrowMatch) {
    return parseInt(arrowMatch[1]);
  }
  
  // Look for patterns like "http://localhost:5173"
  const simpleMatch = output.match(/http:\/\/localhost:(\d+)/);
  if (simpleMatch) {
    return parseInt(simpleMatch[1]);
  }
  
  // Look for "ready in" followed by port info
  const readyMatch = output.match(/ready.*http:\/\/localhost:(\d+)/i);
  if (readyMatch) {
    return parseInt(readyMatch[1]);
  }
  
  return null;
}

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to wait for Vite server and detect port
async function waitForVite() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Starting Vite development server and detecting port...');
    
    // Default port from environment or fallback
    const defaultPort = process.env.PORT || 5173;
    console.log(`📡 Default port: ${defaultPort}`);
    
    // Start Vite process to capture its output
    const viteProcess = spawnProcess('npm', ['run', 'dev'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    let portDetected = false;
    let detectedPort = null;
    let serverReady = false;
    
    // Function to handle port detection and file writing
    function handlePortDetection(port) {
      if (portDetected) return;
      
      detectedPort = port;
      portDetected = true;
      console.log(`✅ Detected Vite server on port ${port}`);
      
      // Write port to a temporary file for Electron to read
      const portFile = path.join(__dirname, '../.vite-port');
      try {
        fs.writeFileSync(portFile, port.toString(), 'utf8');
        console.log(`📝 Port ${port} written to ${portFile}`);
      } catch (error) {
        console.warn('⚠️  Could not write port file:', error.message);
      }
    }
    
    // Function to check if server is ready
    function checkServerReady() {
      if (serverReady || !detectedPort) return;
      
      // Simple HTTP check to see if server responds
      const req = http.get(`http://localhost:${detectedPort}`, (res) => {
        if (res.statusCode === 200) {
          serverReady = true;
          console.log(`🚀 Vite server ready on port ${detectedPort}`);
          resolve(detectedPort);
        }
      });
      
      req.on('error', () => {
        // Server not ready yet, will try again
      });
      
      req.setTimeout(1000);
    }
    
    // Listen to stdout for port information
    viteProcess.stdout.on('data', (data) => {
      process.stdout.write(data); // Forward output to console
      
      const output = data.toString();
      
      // Check for port in output
      if (!portDetected) {
        const port = extractPortFromViteOutput(data);
        if (port) {
          handlePortDetection(port);
        }
      }
      
      // Check if server is ready
      if (portDetected && !serverReady) {
        if (output.includes('ready') || output.includes('Local:') || output.includes('Network:')) {
          setTimeout(checkServerReady, 1000);
        }
      }
    });
    
    // Listen to stderr
    viteProcess.stderr.on('data', (data) => {
      process.stderr.write(data); // Forward error output
      
      if (!portDetected) {
        const port = extractPortFromViteOutput(data);
        if (port) {
          handlePortDetection(port);
        }
      }
    });
    
    // Handle process exit
    viteProcess.on('close', (code) => {
      if (!serverReady) {
        reject(new Error(`Vite process exited with code ${code} before server was ready`));
      }
    });
    
    // Handle process errors
    viteProcess.on('error', (error) => {
      reject(new Error(`Failed to start Vite process: ${error.message}`));
    });
    
    // Fallback: if no port detected after 10 seconds, try default port
    setTimeout(() => {
      if (!portDetected) {
        console.log(`⏰ No port detected, trying default port ${defaultPort}`);
        handlePortDetection(defaultPort);
        setTimeout(checkServerReady, 2000);
      }
    }, 10000);
    
    // Ultimate timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        viteProcess.kill();
        reject(new Error('Timeout: Vite server did not become ready within 30 seconds'));
      }
    }, 30000);
  });
}

// Main execution
async function main() {
  try {
    // Set NODE_ENV for development
    process.env.NODE_ENV = 'development';
    
    const port = await waitForVite();
    console.log(`✨ Vite development server is ready on port ${port}`);
    console.log('🎯 Starting Electron application...');
    
    // Exit successfully so the next command (electron .) can run
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to start Vite server:', error.message);
    
    // Try to write default port as fallback
    const defaultPort = process.env.PORT || 5173;
    const portFile = path.join(__dirname, '../.vite-port');
    try {
      fs.writeFileSync(portFile, defaultPort.toString(), 'utf8');
      console.log(`🔄 Falling back to default port ${defaultPort}`);
      process.exit(0);
    } catch (writeError) {
      console.error('❌ Could not write fallback port:', writeError.message);
      process.exit(1);
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the main function
main();