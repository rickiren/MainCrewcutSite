import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import { join } from 'path';
import { loadStore } from '../core/store';
import type { PostItem } from '../core/types';

// Interface for engagement drafts
export interface EngagementDraft {
  post_url: string;
  author_name: string;
  post_excerpt: string;
  draft_comment: string;
  draft_dm: string;
  timestamp: string;
}

// Generate a draft comment using Anthropic Claude
async function generateCommentDraft(post: PostItem): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Initialize Anthropic client with current environment
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Generate a LinkedIn comment for this post. The comment should be:
- Relevant and insightful to the post content
- Short (1-2 sentences, max 150 characters)
- Natural and conversational in tone
- Professional but engaging
- Add value to the discussion

Post content: ${post.text.substring(0, 500)}...

Comment:`;

    const completion = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 100,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `You are a LinkedIn engagement expert. Generate thoughtful, professional comments that add value to posts.

${prompt}`
        }
      ],
    });

    return completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : "Great insights! Thanks for sharing.";
  } catch (error) {
    console.error('Error generating comment draft:', error);
    return "Great insights! Thanks for sharing.";
  }
}

// Generate a draft DM using Anthropic Claude
async function generateDMDraft(post: PostItem): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Initialize Anthropic client with current environment
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Generate a LinkedIn direct message for this person based on their post. The DM should:
- Start with a personalized introduction
- Reference the specific post topic naturally
- Be professional and respectful
- Show genuine interest in their content
- Keep it concise (2-3 sentences max)
- End with a clear purpose or question

Post content: ${post.text.substring(0, 500)}...
Author: ${post.authorName || 'LinkedIn User'}
${post.authorTitle ? `Title: ${post.authorTitle}` : ''}
${post.authorCompany ? `Company: ${post.authorCompany}` : ''}

Direct Message:`;

    const completion = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 150,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `You are a LinkedIn networking expert. Generate personalized, professional direct messages that reference specific posts and show genuine interest.

${prompt}`
        }
      ],
    });

    return completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : "Hi! I really enjoyed your recent post about this topic. Would love to connect and learn more about your insights.";
  } catch (error) {
    console.error('Error generating DM draft:', error);
    return "Hi! I really enjoyed your recent post about this topic. Would love to connect and learn more about your insights.";
  }
}

// Main function to generate engagement drafts for discovered posts
export async function generateEngagementDrafts(): Promise<void> {
  try {
    console.log('💬 Starting engagement draft generation...');
    
    // Check if Anthropic API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    // Load posts from store
    const store = await loadStore();
    const posts = store.posts;
    
    if (posts.length === 0) {
      console.log('📭 No posts found in store. Run discovery first.');
      return;
    }
    
    console.log(`📝 Generating drafts for ${posts.length} posts...`);
    
    const drafts: EngagementDraft[] = [];
    
    // Generate drafts for each post
    for (const post of posts) {
      console.log(`\n🔄 Processing post: ${post.url.substring(0, 50)}...`);
      
      // Generate comment draft
      const commentDraft = await generateCommentDraft(post);
      console.log(`✅ Comment draft generated`);
      
      // Generate DM draft
      const dmDraft = await generateDMDraft(post);
      console.log(`✅ DM draft generated`);
      
      // Create draft object
      const draft: EngagementDraft = {
        post_url: post.url,
        author_name: post.authorName || 'Unknown',
        post_excerpt: post.text.substring(0, 200) + (post.text.length > 200 ? '...' : ''),
        draft_comment: commentDraft,
        draft_dm: dmDraft,
        timestamp: new Date().toISOString()
      };
      
      drafts.push(draft);
      
      // Small delay between API calls to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Save drafts to file
    const draftsPath = join(dataDir, 'drafts.json');
    await fs.writeFile(draftsPath, JSON.stringify(drafts, null, 2), 'utf-8');
    
    console.log(`\n🎉 Engagement drafts generated successfully!`);
    console.log(`📊 Total drafts: ${drafts.length}`);
    console.log(`💾 Saved to: ${draftsPath}`);
    
  } catch (error) {
    console.error('❌ Error generating engagement drafts:', error);
    throw error;
  }
}

// Function to read existing drafts
export async function readDrafts(): Promise<EngagementDraft[]> {
  try {
    const draftsPath = join(process.cwd(), 'data', 'drafts.json');
    const data = await fs.readFile(draftsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing drafts found');
    return [];
  }
}

// Function to get drafts for a specific post
export async function getDraftsForPost(postUrl: string): Promise<EngagementDraft | null> {
  const drafts = await readDrafts();
  return drafts.find(draft => draft.post_url === postUrl) || null;
}
