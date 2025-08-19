# LinkedIn Automation

This directory contains Playwright-based automation scripts for LinkedIn.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root with your LinkedIn credentials:
```bash
LINKEDIN_EMAIL=your_email@example.com
LINKEDIN_PASSWORD=your_password_here
```

## Usage

### First-time Login

Run the login script to authenticate and save your session:

```bash
npx tsx src/linkedin/login.ts
```

This will:
- Launch Chromium in headful mode
- Navigate to LinkedIn login
- Fill in your credentials
- Wait for successful login
- Save session cookies and local storage to `storageState.json`

### Using Authenticated Pages

After logging in, you can use the `getAuthedPage()` function in other scripts:

```typescript
import { getAuthedPage } from './src/linkedin/login';

async function main() {
  const page = await getAuthedPage();
  
  // Your automation code here
  await page.goto('https://www.linkedin.com/in/some-profile');
  
  await page.close();
}

main().catch(console.error);
```

### Check Authentication Status

```typescript
import { isAuthenticated } from './src/linkedin/login';

const authenticated = await isAuthenticated();
console.log('Authenticated:', authenticated);
```

## Features

- **Human-like behavior**: Uses `slowMo` for realistic timing
- **Session persistence**: Saves and reuses authentication state
- **Error handling**: Graceful fallbacks for expired sessions
- **TypeScript support**: Full type safety with Playwright
- **Environment variables**: Secure credential management

## Security Notes

- Never commit your `.env` file to version control
- The `storageState.json` file contains sensitive session data
- Consider adding both files to `.gitignore`
- Use environment variables for production deployments

## Troubleshooting

- **Session expired**: Run the login script again
- **Login failed**: Check your credentials and ensure 2FA is disabled or handled
- **Browser issues**: Ensure Playwright browsers are installed (`npx playwright install`)
