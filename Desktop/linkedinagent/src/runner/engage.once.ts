import { generateEngagementDrafts, readDrafts } from '../linkedin/engage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('🚀 Starting LinkedIn engagement draft generation...\n');
    
    // Generate engagement drafts
    await generateEngagementDrafts();
    
    // Read and display the generated drafts
    console.log('\n📖 Reading generated drafts...\n');
    const drafts = await readDrafts();
    
    if (drafts.length > 0) {
      console.log('📋 Generated Drafts:');
      drafts.forEach((draft, index) => {
        console.log(`\n--- Draft ${index + 1} ---`);
        console.log(`Post: ${draft.post_url}`);
        console.log(`Author: ${draft.author_name}`);
        console.log(`Post Excerpt: ${draft.post_excerpt}`);
        console.log(`Comment Draft: ${draft.draft_comment}`);
        console.log(`DM Draft: ${draft.draft_dm}`);
        console.log(`Timestamp: ${draft.timestamp}`);
      });
    } else {
      console.log('❌ No drafts were generated');
    }
    
  } catch (error) {
    console.error('❌ Error in main:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
