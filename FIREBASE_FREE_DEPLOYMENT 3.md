# 🆓 Free Firebase Hosting Setup (Spark Plan)

This guide will help you deploy your landing page to Firebase Hosting **completely FREE** using the Spark plan.

## ✅ What's Free with Firebase Hosting (Spark Plan)

- ✅ **Static site hosting** - Unlimited
- ✅ **Custom domain** - Free
- ✅ **SSL certificates** - Automatic & Free
- ✅ **CDN distribution** - Global CDN included
- ✅ **No credit card required**
- ✅ **No billing upgrade needed**

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase (Hosting Only)
```bash
cd /Users/rickybodner/Desktop/ai-integration-main
firebase init hosting
```

When prompted:
- ✅ Select existing project: **crewcut-main**
- ✅ Public directory: **dist**
- ✅ Configure as single-page app: **Yes**
- ✅ Set up automatic builds: **No** (we'll build manually)
- ✅ Overwrite index.html: **No**

### Step 4: Build Your Site
```bash
npm run build
```

### Step 5: Deploy
```bash
firebase deploy --only hosting
```

That's it! Your site is now live at:
- `https://crewcut-main.web.app`
- `https://crewcut-main.firebaseapp.com`

## 🌐 Connect Custom Domain (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crewcut-main**
3. Go to **Hosting** → **Add custom domain**
4. Enter your domain name
5. Follow the DNS setup instructions
6. Firebase automatically provides SSL certificates

## 📝 About the AI Chat Feature

The AI chat component in your landing page requires a backend API. Since you're using the free Spark plan (hosting only), the chat won't work unless you:

**Option A: Use Vercel (Recommended - Also Free)**
- Vercel is completely free for both hosting AND serverless functions
- Your existing `/api/claude.mjs` will work automatically
- No billing upgrade needed
- See `DEPLOYMENT.md` for Vercel setup

**Option B: Disable Chat Temporarily**
- The chat will show an error message if the API isn't available
- Your landing page will still work perfectly
- All other features (contact forms, newsletter, etc.) will work

**Option C: Add Functions Later**
- If you want to enable the chat later, upgrade to Blaze plan
- Deploy the functions: `firebase deploy --only functions`
- The free tier is very generous (2M invocations/month)

## 🎯 What Works on Free Spark Plan

✅ Landing page (all sections)
✅ Contact forms
✅ Newsletter subscription (with Supabase)
✅ All static content
✅ Custom domain
✅ SSL certificates
✅ CDN distribution

❌ AI Chat (requires backend API - needs Blaze plan or Vercel)

## 🔄 Re-deploy After Changes

```bash
npm run build
firebase deploy --only hosting
```

## 📊 Free Tier Limits (Spark Plan)

- **Hosting**: 10 GB storage, 360 MB/day transfer
- **SSL**: Unlimited certificates
- **Custom domains**: Unlimited

These limits are very generous for most landing pages!

## 🆘 Troubleshooting

**"Billing required" error?**
- Make sure you're only deploying hosting: `firebase deploy --only hosting`
- Don't include `--only functions` or deploy everything

**Domain not connecting?**
- Check DNS records are correct
- Wait 24-48 hours for DNS propagation
- Verify SSL certificate is active in Firebase Console

**Site not updating?**
- Clear browser cache
- Check Firebase Console → Hosting → Releases
- Make sure you ran `npm run build` before deploying

