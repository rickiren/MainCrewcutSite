# 🚀 Production Deployment Guide - AI Chat

This guide will help you deploy the AI chat feature to your live production site on Firebase.

## Prerequisites

1. ✅ Firebase CLI installed (you have version 14.23.0)
2. ✅ Firebase project: `crewcut-main`
3. ✅ Anthropic API key ready

## Step-by-Step Deployment

### Step 1: Set Up Firebase Function Secret

Set your Anthropic API key as a Firebase secret:

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key (starts with `sk-ant-`).

**Verify it's set:**
```bash
firebase functions:secrets:access ANTHROPIC_API_KEY
```

### Step 2: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 3: Deploy the Firebase Function

```bash
firebase deploy --only functions
```

This will deploy the `claude` function to Firebase Cloud Functions.

**Note:** Firebase Functions require a **Blaze Plan** (pay-as-you-go). The free tier doesn't support Cloud Functions. However, the free tier includes generous usage limits, so costs are typically minimal.

### Step 4: Get Your Function URL

After deployment, Firebase will show you the function URL. It should look like:
```
https://us-central1-crewcut-main.cloudfunctions.net/claude
```

**Or check in Firebase Console:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **crewcut-main**
3. Go to **Functions** → Find `claude` function
4. Copy the URL

### Step 5: Update Frontend Environment Variable

The frontend code is already configured to use `VITE_FIREBASE_FUNCTION_URL`. Make sure your production build has this set:

**Option A: Build with environment variable**
```bash
# Create a .env.production file with:
VITE_FIREBASE_FUNCTION_URL=https://us-central1-crewcut-main.cloudfunctions.net/claude

# Then build
npm run build
```

**Option B: Set in build command**
```bash
VITE_FIREBASE_FUNCTION_URL=https://us-central1-crewcut-main.cloudfunctions.net/claude npm run build
```

### Step 6: Deploy Frontend

```bash
firebase deploy --only hosting
```

Or deploy everything at once:
```bash
firebase deploy
```

## Verify It Works

1. Visit your live site: `https://crewcut-main.web.app`
2. Try the AI chat
3. Check browser console for any errors
4. Check Firebase Function logs: `firebase functions:log`

## Troubleshooting

### CORS Errors

The Firebase function already includes CORS handling. If you still see CORS errors:

1. Verify the function is deployed: `firebase functions:list`
2. Check function logs: `firebase functions:log`
3. Test the function directly:
   ```bash
   curl -X POST https://us-central1-crewcut-main.cloudfunctions.net/claude \
     -H "Content-Type: application/json" \
     -d '{"userMessage":"test","conversationHistory":[],"systemPrompt":""}'
   ```

### Function Not Found / 404

- Make sure the function is deployed: `firebase functions:list`
- Check the URL matches exactly (including region)
- Verify `VITE_FIREBASE_FUNCTION_URL` is set correctly in your build

### API Key Not Working

1. Verify secret is set: `firebase functions:secrets:access ANTHROPIC_API_KEY`
2. Check function logs: `firebase functions:log`
3. Make sure the secret name matches: `ANTHROPIC_API_KEY` (not `VITE_CLAUDE_API_KEY`)

### Function Timeout

If requests are timing out:
1. Check Firebase Console → Functions → Logs
2. Increase timeout in `functions/index.js` if needed (default is 60s)
3. Check Anthropic API status

## Quick Deploy Script

Save this as `deploy-production.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying to production..."

# Set API key secret (if not already set)
# firebase functions:secrets:set ANTHROPIC_API_KEY

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions && npm install && cd ..

# Deploy function
echo "☁️  Deploying Firebase Function..."
firebase deploy --only functions

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Deploy frontend
echo "🌐 Deploying frontend..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌍 Visit: https://crewcut-main.web.app"
```

Make it executable: `chmod +x deploy-production.sh`

## Cost Estimate

Firebase Functions pricing (as of 2024):
- **First 2 million invocations/month**: FREE
- **After that**: $0.40 per million invocations
- **Compute time**: $0.0000025 per GB-second

For a typical landing page with AI chat:
- **Estimated cost**: $0-5/month (usually free tier covers it)

## Next Steps

1. ✅ Deploy function
2. ✅ Deploy frontend
3. ✅ Test on live site
4. ✅ Monitor usage in Firebase Console
5. ✅ Set up alerts (optional) for function errors

