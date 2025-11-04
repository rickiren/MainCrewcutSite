# GitHub Actions Setup Guide

This workflow automatically deploys your frontend to Firebase Hosting whenever you push to the `main` branch.

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crewcut-main**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** in the popup
7. Save the JSON file (you'll need this in the next step)

### 2. Add Secret to GitHub

1. Go to your GitHub repository: `https://github.com/rickiren/MainCrewcutSite`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_SERVICE_ACCOUNT`
5. Value: Paste the **entire contents** of the JSON file you downloaded
6. Click **Add secret**

### 3. Test the Workflow

1. Make a small change to your code
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test: Trigger deployment"
   git push origin main
   ```
3. Go to your GitHub repo → **Actions** tab
4. You should see the workflow running
5. Once complete, your site will be updated!

## How It Works

- **Triggers**: Automatically runs on every push to `main`
- **Builds**: Installs dependencies and builds your React app
- **Deploys**: Deploys to Firebase Hosting
- **Functions**: Firebase Functions are NOT deployed automatically (they require secrets that are better managed manually)

## Manual Deployment

You can also manually trigger the workflow:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to Firebase** workflow
3. Click **Run workflow** → **Run workflow**

## Notes

- The workflow uses `npm ci` for faster, reliable builds
- It sets the Firebase Function URL during build for production
- Only the frontend is deployed automatically
- Functions must be deployed manually: `firebase deploy --only functions`

