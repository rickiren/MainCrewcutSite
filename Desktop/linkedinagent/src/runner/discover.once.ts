import { runDiscovery } from '../linkedin/discover';
import { listPosts, loadStore } from '../core/store';

async function main() {
  try {
    console.log('🚀 Starting LinkedIn discovery runner...\n');
    
    // Run discovery
    await runDiscovery();
    
    // Get final stats
    const posts = await listPosts();
    const store = await loadStore();
    const queuedJobs = store.queue.filter(job => job.status === 'queued');
    
    console.log('\n📈 Final Statistics:');
    console.log(`📊 Total posts in store: ${posts.length}`);
    console.log(`📝 Total COMMENT jobs in queue: ${queuedJobs.length}`);
    
    if (queuedJobs.length > 0) {
      console.log('\n⏰ Next jobs to run:');
      queuedJobs.slice(0, 3).forEach(job => {
        const runAfter = new Date(job.runAfter).toLocaleTimeString();
        console.log(`  - ${job.id}: ${runAfter} (${job.payload.postId})`);
      });
    }
    
    console.log('\n✅ Discovery runner completed successfully!');
    
  } catch (error) {
    console.error('❌ Discovery runner failed:', error);
    process.exit(1);
  }
}

// Run the discovery runner
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
