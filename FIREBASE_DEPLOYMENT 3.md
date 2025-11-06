# 🚀 Firebase Deployment Guide for crewcut-main

This project is now configured for Firebase Hosting and Cloud Functions.

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Enable Billing** (Required for Cloud Functions):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **crewcut-main**
   - Go to Project Settings → Usage and billing
   - Upgrade to **Blaze Plan** (pay-as-you-go)
   - The free tier covers most usage, but Functions require Blaze plan

## Setup Steps

### 1. Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 2. Set Environment Variables

Set your Anthropic API key as a Firebase secret:

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key (starts with `sk-ant-`).

**Note:** After setting the secret, you'll need to update the function to use it. Firebase Functions v2 uses secrets differently. See the updated function code below.

### 3. Update Function to Use Secrets (if needed)

If you're using Firebase Functions v2, you may need to update `functions/index.js` to properly access secrets. The current code uses `process.env.ANTHROPIC_API_KEY`, which works with the secret set above.

### 4. Build Your Frontend

```bash
npm run build
```

This creates the `dist` folder with your production build.

### 5. Deploy to Firebase

Deploy everything:
```bash
firebase deploy
```

Or deploy separately:
```bash
firebase deploy --only hosting  # Frontend only
firebase deploy --only functions # Functions only
```

## Your Firebase URLs

After deployment, your site will be available at:
- **Frontend**: `https://crewcut-main.web.app` or `https://crewcut-main.firebaseapp.com`
- **API Function**: `https://us-central1-crewcut-main.cloudfunctions.net/claude`

**Note:** The region (`us-central1`) might be different. Check your Firebase Console → Functions after deployment to see the actual URL.

## Environment Variables

### Frontend (.env file)
Create a `.env` file in your project root with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email Service Configuration
VITE_RESEND_API_KEY=your_resend_api_key

# Firebase Functions Configuration
# Update the region if different (check Firebase Console after deployment)
VITE_FIREBASE_FUNCTION_URL=https://us-central1-crewcut-main.cloudfunctions.net/claude
```

### Firebase Functions
Set via Firebase CLI:
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

## Testing Locally

### Test Functions Locally
```bash
firebase emulators:start --only functions
```

### Test Frontend Locally
```bash
npm run dev
```

## Troubleshooting

### Function Not Working
1. Check that billing is enabled (Blaze plan)
2. Verify the secret is set: `firebase functions:secrets:access ANTHROPIC_API_KEY`
3. Check function logs: `firebase functions:log`

### Wrong Region
If your function URL has a different region:
1. Check Firebase Console → Functions
2. Update `VITE_FIREBASE_FUNCTION_URL` in your `.env` file
3. Rebuild: `npm run build`
4. Redeploy: `firebase deploy --only hosting`

### CORS Errors
The function includes CORS handling. If you still see CORS errors:
1. Check that the function is deployed
2. Verify the function URL in your frontend code
3. Check browser console for specific error messages

## Continuous Deployment

To automatically deploy on push to main branch:

1. Install GitHub Actions (if not already)
2. Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: crewcut-main
```

## Project Structure

```
crewcut-main/
├── .firebaserc          # Firebase project configuration
├── firebase.json        # Firebase hosting & functions config
├── functions/           # Firebase Cloud Functions
│   ├── package.json
│   └── index.js         # Claude API function
├── dist/                # Built frontend (created by npm run build)
└── src/                 # React source code
```

## Next Steps

1. ✅ Install Firebase CLI and login
2. ✅ Install function dependencies
3. ✅ Set ANTHROPIC_API_KEY secret
4. ✅ Build frontend (`npm run build`)
5. ✅ Deploy (`firebase deploy`)
6. ✅ Update `.env` with actual function URL (if region differs)
7. ✅ Test your deployed site!

