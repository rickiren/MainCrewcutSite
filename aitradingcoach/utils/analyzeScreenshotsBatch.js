require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY, or OPENAI_API_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Downloads an image from a URL and converts it to base64
 */
async function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode} ${response.statusMessage}`));
          return;
        }
        
        const chunks = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          resolve(base64);
        });
        
        response.on('error', (error) => {
          reject(error);
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Reads a local image file and converts it to base64
 */
async function readLocalImageAsBase64(filePath) {
  try {
    const fs = require('fs');
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error reading local image:', error);
    throw error;
  }
}

/**
 * Analyzes a batch of screenshots using OpenAI Vision API
 */
async function analyzeScreenshotsBatch(screenshots, ticker, sessionId, userId) {
  try {
    console.log(`🔍 Starting batch analysis for ${ticker} with ${screenshots.length} screenshots`);
    
    if (screenshots.length < 3 || screenshots.length > 5) {
      throw new Error(`Invalid number of screenshots: ${screenshots.length}. Expected 3-5.`);
    }

    // Prepare images for OpenAI Vision API
    const imageContents = [];
    const screenshotUrls = [];

    for (const screenshot of screenshots) {
      let base64Image;
      
      if (screenshot.public_url) {
        // Download from Supabase URL
        base64Image = await downloadImageAsBase64(screenshot.public_url);
        screenshotUrls.push(screenshot.public_url);
      } else if (screenshot.local_path) {
        // Read from local file
        base64Image = await readLocalImageAsBase64(screenshot.local_path);
        screenshotUrls.push(`local://${screenshot.filename}`);
      } else {
        console.warn(`Skipping screenshot ${screenshot.filename} - no URL or local path`);
        continue;
      }

      imageContents.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64Image}`
        }
      });
    }

    if (imageContents.length === 0) {
      throw new Error('No valid images found for analysis');
    }

    // Create the system prompt for trading coach analysis
    const systemPrompt = `You are a world-class trading coach analyzing a sequence of screenshots showing price action and volume behavior for ${ticker}.

Your task is to provide a concise, actionable summary of what you observe across these screenshots:

**Focus Areas:**
1. **Price Action**: Trend direction, key levels, breakouts/breakdowns, momentum
2. **Volume Behavior**: Volume spikes, accumulation/distribution patterns, relative volume
3. **Technical Context**: Support/resistance levels, chart patterns, indicators
4. **Trading Opportunities**: Clear setups, risk/reward scenarios, entry/exit points

**Guidelines:**
- Be concise but comprehensive (150-300 words)
- Use trading terminology and be specific about levels
- Identify the most important developments
- Provide actionable insights for a trader
- Focus on recent developments and current market structure

**Format your response as:**
- Brief overview of the sequence
- Key price action observations
- Volume analysis
- Technical setup assessment
- Trading implications

Speak like a professional trading coach - direct, confident, and actionable.`;

    // Send to OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze these ${imageContents.length} screenshots of ${ticker} in chronological order. Provide a comprehensive trading coach summary.`
            },
            ...imageContents
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const summary = response.choices[0].message.content?.trim() || 'No analysis generated';

    // Create the analysis result
    const analysisResult = {
      ticker,
      session_id: sessionId,
      summary,
      screenshot_urls: screenshotUrls,
      created_at: new Date().toISOString()
    };

    // Save to Supabase batch_analysis table
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('batch_analysis')
      .insert({
        user_id: userId,
        session_id: sessionId,
        ticker: ticker,
        summary: summary,
        screenshot_urls: screenshotUrls,
        screenshot_count: screenshots.length,
        analysis_data: {
          model_used: 'gpt-4o',
          temperature: 0.3,
          max_tokens: 800,
          processing_timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving batch analysis to Supabase:', saveError);
      throw saveError;
    }

    analysisResult.analysis_id = savedAnalysis.id;
    console.log(`✅ Batch analysis completed and saved for ${ticker} (ID: ${savedAnalysis.id})`);

    return analysisResult;

  } catch (error) {
    console.error('Error in batch screenshot analysis:', error);
    throw error;
  }
}

/**
 * Gets recent screenshots for a ticker session and triggers batch analysis
 */
async function triggerBatchAnalysisForSession(ticker, sessionId, userId, minScreenshots = 3, maxScreenshots = 5) {
  try {
    // Get recent screenshots for this session
    const { data: screenshots, error } = await supabase
      .from('screenshots')
      .select('id, filename, public_url, created_at')
      .eq('ticker_session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(maxScreenshots);

    if (error) {
      console.error('Error fetching screenshots for batch analysis:', error);
      return null;
    }

    if (!screenshots || screenshots.length < minScreenshots) {
      console.log(`Not enough screenshots for batch analysis: ${screenshots?.length || 0} (need ${minScreenshots})`);
      return null;
    }

    // Convert to ScreenshotInfo format
    const screenshotInfos = screenshots.map(s => ({
      id: s.id,
      filename: s.filename,
      public_url: s.public_url || undefined,
      created_at: s.created_at
    }));

    // Perform batch analysis
    return await analyzeScreenshotsBatch(screenshotInfos, ticker, sessionId, userId);

  } catch (error) {
    console.error('Error triggering batch analysis:', error);
    return null;
  }
}

/**
 * Checks if batch analysis should be triggered based on screenshot count and time
 */
async function shouldTriggerBatchAnalysis(sessionId, userId, lastAnalysisTime) {
  try {
    // Get screenshot count for this session
    const { count, error } = await supabase
      .from('screenshots')
      .select('*', { count: 'exact', head: true })
      .eq('ticker_session_id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking screenshot count:', error);
      return false;
    }

    // Check if we have enough screenshots (3-5)
    if (!count || count < 3) {
      return false;
    }

    // Check if enough time has passed since last analysis (15-30 seconds)
    if (lastAnalysisTime) {
      const timeSinceLastAnalysis = Date.now() - new Date(lastAnalysisTime).getTime();
      if (timeSinceLastAnalysis < 15000) { // 15 seconds
        return false;
      }
    }

    // Check if we already have a recent batch analysis for this session
    const { data: recentAnalysis, error: analysisError } = await supabase
      .from('batch_analysis')
      .select('created_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!analysisError && recentAnalysis && recentAnalysis.length > 0) {
      const timeSinceLastBatchAnalysis = Date.now() - new Date(recentAnalysis[0].created_at).getTime();
      if (timeSinceLastBatchAnalysis < 15000) { // 15 seconds
        console.log('Recent batch analysis exists, skipping');
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error('Error checking if batch analysis should be triggered:', error);
    return false;
  }
}

module.exports = {
  analyzeScreenshotsBatch,
  triggerBatchAnalysisForSession,
  shouldTriggerBatchAnalysis
}; 