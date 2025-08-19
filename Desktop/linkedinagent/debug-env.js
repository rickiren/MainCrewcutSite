import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Debugging Environment Variables');
console.log('==================================');
console.log('');

// Load environment variables
dotenv.config();

console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('');

console.log('Environment variables:');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('ANTHROPIC_MODEL:', process.env.ANTHROPIC_MODEL || 'NOT SET');
console.log('LINKEDIN_EMAIL:', process.env.LINKEDIN_EMAIL || 'NOT SET');
console.log('');

console.log('Checking .env file:');
try {
  const fs = await import('fs');
  const envPath = join(process.cwd(), '.env');
  console.log('.env file path:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('.env file exists: YES');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('.env file size:', envContent.length, 'characters');
    console.log('First line:', envContent.split('\n')[0]);
  } else {
    console.log('.env file exists: NO');
  }
} catch (error) {
  console.log('Error checking .env file:', error.message);
}
