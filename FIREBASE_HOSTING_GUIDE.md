# 🔥 Firebase Hosting Setup Guide

## Quick Start

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Your Project

```bash
# Create a new project in Firebase Console first: https://console.firebase.google.com
# Then initialize it locally:
firebase init hosting
```

When prompted:
- Select **Use an existing project** (or create new)
- Public directory: `dist` (already configured)
- Configure as SPA: **Yes**
- Set up automatic builds: **No** (we'll build manually)
- Don't overwrite `firebase.json`

### 4. Update Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 5. Build and Deploy

```bash
# Build your site
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

Your site will be live at: `https://your-project-id.web.app`

---

## 🌐 Adding a Custom Domain

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Hosting** in the left sidebar
4. Click **Add custom domain**

### Step 2: Enter Your Domain

Enter your custom domain (e.g., `example.com` or `www.example.com`)

**Best Practice:**
- Add both `example.com` AND `www.example.com`
- Set one as primary (usually `www.example.com`)
- Firebase will redirect the other to the primary

### Step 3: Verify Domain Ownership

Firebase will ask you to add a TXT record to your domain's DNS:

**Example:**
```
Type: TXT
Name: @  (or your domain)
Value: [Firebase will provide this]
TTL: 3600
```

**Where to add DNS records:**
- **GoDaddy**: Domain Settings → DNS Management
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Add record

### Step 4: Connect Domain

After verification, Firebase will provide DNS records to add:

**For apex domain (example.com):**
```
Type: A
Name: @
Value: [Firebase IP addresses - usually multiple A records]
```

**For www subdomain (www.example.com):**
```
Type: CNAME
Name: www
Value: your-project-id.web.app
```

### Step 5: Wait for Propagation

- DNS changes can take 5 minutes to 48 hours
- Check status in Firebase Console
- Firebase automatically provisions SSL certificates

---

## 🔐 SSL/HTTPS

Firebase automatically:
- Provisions SSL certificates (via Let's Encrypt)
- Enforces HTTPS
- Handles certificate renewal

No additional setup needed!

---

## 📝 Quick Deploy Script

Add to your `package.json`:

```json
"scripts": {
  "deploy:firebase": "npm run build && firebase deploy --only hosting",
  "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
}
```

Then deploy with:
```bash
npm run deploy:firebase
```

---

## 🆚 Firebase vs Vercel Comparison

| Feature | Firebase | Vercel |
|---------|----------|--------|
| **Setup** | Requires CLI install | Git push auto-deploys |
| **Custom Domain** | Manual DNS setup | Easy domain connect |
| **SSL** | Auto (Let's Encrypt) | Auto (Let's Encrypt) |
| **Build** | Manual build required | Auto builds on push |
| **CDN** | Global (Google) | Global (Vercel Edge) |
| **API Routes** | Cloud Functions | Serverless Functions |
| **Pricing** | Generous free tier | Generous free tier |

---

## 🚀 Advanced: Preview Channels

Deploy to a preview URL for testing:

```bash
firebase hosting:channel:deploy preview-name
```

This creates a temporary URL: `https://your-project-id--preview-name.web.app`

---

## 🔧 Troubleshooting

### Domain not connecting?

1. **Check DNS records**: Use [DNS Checker](https://dnschecker.org)
2. **Wait longer**: DNS can take up to 48 hours
3. **Clear cache**: Try incognito/private browsing
4. **Check Firebase Console**: View status under Hosting → Domains

### 404 errors on refresh?

The `firebase.json` already has the SPA rewrite rule configured.

### Deploy failing?

```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

---

## 📚 Additional Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
- [Firebase Console](https://console.firebase.google.com)
