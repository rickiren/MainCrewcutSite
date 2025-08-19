import 'dotenv/config';
import { getAuthedPage } from './login';
import { STORAGE_FILE } from './constants';

async function checkLinkedInHealth(): Promise<void> {
  try {
    console.log('🔍 Checking LinkedIn session health...');
    console.log(`📁 Looking for session file at: ${STORAGE_FILE}`);
    
    // Get authenticated page
    const page = await getAuthedPage();
    
    // Navigate to feed with network idle wait
    console.log('🌐 Navigating to LinkedIn feed...');
    await page.goto('https://www.linkedin.com/feed/', { 
      waitUntil: 'networkidle' 
    });
    
    // Wait up to 10 seconds for success indicators
    console.log('🔍 Checking authentication status...');
    
    try {
      // Check for success indicators with timeout
      await Promise.race([
        // Success case: wait for any of the success selectors
        Promise.any([
          page.waitForSelector('nav[aria-label="Primary"]', { timeout: 10000 }),
          page.waitForSelector('a[href*="/in/"]', { timeout: 10000 }),
          page.waitForSelector('button[aria-label*="Start a post"]', { timeout: 10000 })
        ]),
        // Failure case: wait for redirect to login
        page.waitForURL('**/login', { timeout: 10000 })
      ]);
      
      // Check if we were redirected to login (failure case)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        throw new Error('Redirected to login page');
      }
      
      // Success case: we're on feed and found success indicators
      if (currentUrl.includes('/feed')) {
        const title = await page.title();
        console.log('✅ LinkedIn session healthy:', title);
        await page.context().browser()?.close();
        process.exit(0);
      } else {
        throw new Error('Not on feed page');
      }
      
    } catch (error) {
      // Check if we're on login page (failure case)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        throw new Error('Redirected to login page');
      }
      
      // Check if we're on feed but no success indicators found
      if (currentUrl.includes('/feed')) {
        // Try to find any success indicators
        const hasPrimaryNav = await page.$('nav[aria-label="Primary"]');
        const hasProfileLink = await page.$('a[href*="/in/"]');
        const hasPostButton = await page.$('button[aria-label*="Start a post"]');
        
        if (!hasPrimaryNav && !hasProfileLink && !hasPostButton) {
          throw new Error('On feed page but no success indicators found');
        }
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Not authenticated. Re-run the login script.');
    console.error('Error details:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the health check
checkLinkedInHealth().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
