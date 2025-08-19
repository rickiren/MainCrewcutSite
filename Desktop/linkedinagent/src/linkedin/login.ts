import 'dotenv/config';
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const STORAGE_FILE = 'storageState.json';

/**
 * Main login function that authenticates with LinkedIn and saves session
 */
async function loginToLinkedIn(): Promise<void> {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 1 second delay between actions for human-like behavior
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🌐 Navigating to LinkedIn login page...');
    await page.goto('https://www.linkedin.com/login');

    // Wait for the login form to be visible
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });

    // Get credentials from environment variables
    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
      throw new Error('LINKEDIN_EMAIL and LINKEDIN_PASSWORD environment variables are required');
    }

    console.log('🔐 Filling in credentials...');
    
    // Fill in username and password
    await page.fill('#username', email);
    await page.fill('#password', password);

    // Submit the form
    console.log('📤 Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for navigation to feed page
    console.log('⏳ Waiting for login to complete...');
    await page.waitForURL('**/feed', { timeout: 30000 });

    console.log('✅ Successfully logged in!');

    // Save session state (cookies and local storage)
    await context.storageState({ path: STORAGE_FILE });
    console.log('💾 Session saved to storageState.json');

    console.log('✅ LinkedIn session saved');

  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Helper function to get an authenticated page
 * Reuses saved session if available, otherwise prompts for login
 */
export async function getAuthedPage(): Promise<Page> {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Reduced delay for subsequent operations
  });

  let context: BrowserContext;

  // Check if we have a saved session
  if (existsSync(STORAGE_FILE)) {
    console.log('🔄 Reusing saved session...');
    context = await browser.newContext({ 
      storageState: STORAGE_FILE 
    });
  } else {
    console.log('🔑 No saved session found. Please run login first.');
    throw new Error('No saved session found. Run loginToLinkedIn() first.');
  }

  const page = await context.newPage();
  
  // Verify the session is still valid by checking if we're logged in
  try {
    await page.goto('https://www.linkedin.com/feed');
    await page.waitForSelector('[data-test-id="feed-identity-module"]', { timeout: 10000 });
    console.log('✅ Session is valid');
  } catch (error) {
    console.log('❌ Session expired, please login again');
    await browser.close();
    throw new Error('Session expired. Please run loginToLinkedIn() again.');
  }

  return page;
}

/**
 * Check if user is currently authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!existsSync(STORAGE_FILE)) {
    return false;
  }

  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({ 
      storageState: STORAGE_FILE 
    });
    const page = await context.newPage();
    
    await page.goto('https://www.linkedin.com/feed');
    await page.waitForSelector('[data-test-id="feed-identity-module"]', { timeout: 5000 });
    
    return true;
  } catch (error) {
    return false;
  } finally {
    await browser.close();
  }
}

// Export the main login function
export { loginToLinkedIn };

// If this file is run directly, execute the login
if (import.meta.url === `file://${process.argv[1]}`) {
  loginToLinkedIn().catch(console.error);
}
