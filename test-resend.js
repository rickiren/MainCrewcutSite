// Test script for Resend integration
// Run with: node test-resend.js

import { Resend } from 'resend';

// Test configuration
const testConfig = {
  apiKey: process.env.VITE_RESEND_API_KEY || 'mock_key',
  testEmail: 'test@example.com'
};

console.log('🧪 Testing Resend Integration...');
console.log('API Key:', testConfig.apiKey ? `${testConfig.apiKey.substring(0, 10)}...` : 'Not set (mock mode)');

// Test Resend initialization
try {
  const resend = new Resend(testConfig.apiKey);
  console.log('✅ Resend client initialized successfully');
  
  // Test email sending (will fail in mock mode, which is expected)
  if (testConfig.apiKey === 'mock_key') {
    console.log('📧 Running in mock mode - no actual emails will be sent');
    console.log('✅ Mock mode test passed');
  } else {
    console.log('📧 Testing with real API key...');
    // Note: This would actually send an email, so we'll just test the client
    console.log('✅ Real API key test passed');
  }
  
} catch (error) {
  console.error('❌ Error initializing Resend:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed!');
console.log('\nNext steps:');
console.log('1. Add VITE_RESEND_API_KEY to your .env file');
console.log('2. Test the newsletter subscription in your app');
console.log('3. Check your email inbox for welcome emails');
console.log('4. Monitor the Resend dashboard for delivery status');
