# Video Generator Render Setup Guide

## Current State

The video generator currently has:
- ✅ **Frontend Preview**: Working Remotion player with `VideoComposition` component
- ✅ **Script Editor**: Users can edit script lines and customize styles
- ✅ **Format Selection**: Instagram Reel, Square, YouTube formats
- ✅ **Dependencies**: `@remotion/renderer`, `@remotion/lambda`, and `@remotion/player` are installed
- ❌ **Render Functionality**: Currently only simulates rendering (lines 42-72 in `VideoGenerator.tsx`)

The `handleRender` function at line 42 currently just simulates progress and doesn't actually render videos.

## What Needs to Be Done

You have **two options** for implementing video rendering:

---

## Option 1: AWS Lambda with @remotion/lambda (Recommended for Production)

**Best for**: Scalable, serverless video rendering with high concurrency

### Setup Steps:

1. **Install AWS CLI and configure credentials**
   ```bash
   aws configure
   ```

2. **Deploy Remotion Lambda function**
   ```bash
   npx remotion lambda functions deploy
   ```

3. **Create a site on Remotion Lambda**
   ```bash
   npx remotion lambda sites create src/remotion/Root.tsx --site-name="video-generator"
   ```

4. **Set up environment variables**
   - `REMOTION_AWS_REGION`: Your AWS region (e.g., `us-east-1`)
   - `REMOTION_AWS_ACCESS_KEY_ID`: Your AWS access key
   - `REMOTION_AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `REMOTION_SITE_ID`: The site ID from step 3

5. **Update `handleRender` function** to call Lambda API

### Implementation Code:

```typescript
import { renderMediaOnLambda } from '@remotion/lambda';

const handleRender = async () => {
  setIsRendering(true);
  setRenderProgress(0);

  try {
    const region = import.meta.env.VITE_REMOTION_AWS_REGION || 'us-east-1';
    const siteId = import.meta.env.VITE_REMOTION_SITE_ID;
    
    if (!siteId) {
      throw new Error('REMOTION_SITE_ID not configured');
    }

    // Start render on Lambda
    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      serveUrl: `https://${siteId}.remotionlambda.com`,
      composition: 'VideoComposition',
      inputProps: {
        scriptLines,
        style: videoStyle,
      },
      codec: 'h264',
      imageFormat: 'jpeg',
      maxRetries: 1,
      framesPerLambda: 20,
      privacy: 'public',
      downloadBehavior: {
        type: 'download',
        fileName: `video-${Date.now()}.mp4`,
      },
      onProgress: ({ progress }) => {
        setRenderProgress(Math.round(progress * 100));
      },
    });

    // Poll for completion
    const result = await pollLambdaRender({
      renderId,
      bucketName,
      region,
    });

    // Download the video
    const response = await fetch(result.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-${Date.now()}.mp4`;
    a.click();
    
    alert('Video rendered and downloaded successfully!');
  } catch (error) {
    console.error('Rendering error:', error);
    alert('Rendering failed. Please check the console for details.');
  } finally {
    setIsRendering(false);
    setRenderProgress(0);
  }
};
```

**Pros:**
- ✅ Scalable (handles many concurrent renders)
- ✅ Serverless (no server management)
- ✅ Pay-per-use pricing
- ✅ Built-in progress tracking

**Cons:**
- ❌ Requires AWS account setup
- ❌ More complex initial setup
- ❌ AWS costs can add up

---

## Option 2: Node.js Backend with @remotion/renderer (Recommended for Development)

**Best for**: Development, testing, or simpler deployments

### Setup Steps:

1. **Create a backend API endpoint** (similar to your existing `/api/claude` pattern)

2. **Set up a Node.js rendering service** that uses `@remotion/renderer`

3. **Update `handleRender` function** to call your backend API

### Implementation Code:

#### Backend API (`api/render-video.mjs`):

```javascript
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scriptLines, style, format } = req.body;

    // Calculate duration
    const totalSeconds = scriptLines.reduce((sum, line) => sum + line.duration, 0);
    const durationInFrames = Math.ceil(totalSeconds * format.fps);

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: './src/remotion/Root.tsx',
      webpackOverride: (config) => config,
    });

    // Create temp directory for output
    const outputDir = join(tmpdir(), `remotion-${Date.now()}`);
    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, 'video.mp4');

    // Render the video
    await renderMedia({
      composition: {
        id: 'VideoComposition',
        width: format.width,
        height: format.height,
        fps: format.fps,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        scriptLines,
        style,
      },
      onProgress: (progress) => {
        // Send progress updates via WebSocket or Server-Sent Events
        // For simplicity, we'll just log it
        console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
      },
    });

    // Read the file and send it
    const videoBuffer = await readFile(outputPath);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="video-${Date.now()}.mp4"`);
    res.send(videoBuffer);

    // Cleanup
    await unlink(outputPath);
    await rmdir(outputDir);
  } catch (error) {
    console.error('Rendering error:', error);
    res.status(500).json({ 
      error: 'Rendering failed', 
      message: error.message 
    });
  }
}
```

#### Frontend Update (`src/pages/VideoGenerator.tsx`):

```typescript
const handleRender = async () => {
  setIsRendering(true);
  setRenderProgress(0);

  try {
    const response = await fetch('/api/render-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptLines,
        style: videoStyle,
        format: format,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Rendering failed');
    }

    // Get progress updates (if using Server-Sent Events or polling)
    // For now, we'll simulate progress while downloading
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    if (reader) {
      let receivedLength = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (contentLength > 0) {
          setRenderProgress(Math.round((receivedLength / contentLength) * 100));
        }
      }
    }

    // Create blob and download
    const blob = new Blob(chunks, { type: 'video/mp4' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Video rendered and downloaded successfully!');
  } catch (error) {
    console.error('Rendering error:', error);
    alert('Rendering failed. Please check the console for details.');
  } finally {
    setIsRendering(false);
    setRenderProgress(0);
  }
};
```

**Pros:**
- ✅ Simpler setup (no AWS required)
- ✅ Full control over the rendering process
- ✅ Good for development/testing
- ✅ Can run on your existing infrastructure

**Cons:**
- ❌ Requires server resources (CPU/memory)
- ❌ May need to handle concurrent renders manually
- ❌ Server management overhead

---

## Recommended Approach

**For Development**: Use **Option 2** (Node.js backend) - simpler to set up and test

**For Production**: Use **Option 1** (AWS Lambda) - more scalable and cost-effective

---

## Next Steps

1. **Choose your approach** (Lambda or Node.js backend)
2. **Set up the backend** (Lambda deployment or API endpoint)
3. **Update `handleRender` function** in `src/pages/VideoGenerator.tsx:42`
4. **Test with a simple video** first
5. **Add error handling** and user feedback
6. **Configure environment variables** for production

---

## Additional Considerations

- **Progress Tracking**: For real-time progress, consider WebSockets or Server-Sent Events
- **File Storage**: Decide where to store rendered videos (S3, local filesystem, etc.)
- **Queue System**: For production, consider a job queue (Bull, RabbitMQ) for handling multiple renders
- **Video Formats**: Support for different codecs (h264, h265, VP9)
- **Quality Settings**: Allow users to choose video quality/bitrate

---

## Current Code Location

The `handleRender` function that needs to be updated is located at:
- **File**: `src/pages/VideoGenerator.tsx`
- **Line**: 42-72
- **Current behavior**: Simulates rendering with progress updates

