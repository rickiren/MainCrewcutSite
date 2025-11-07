# Firebase Firestore Database Setup

This guide will help you set up Firebase Firestore to store contact information (emails, names, phone numbers) collected from your website.

## 📋 Prerequisites

- A Firebase project (you already have `crewcut-main`)
- Firebase CLI installed (if not already): `npm install -g firebase-tools`
- Access to Firebase Console

## 🚀 Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crewcut-main**
3. In the left sidebar, click **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for now - we'll set up security rules later)
6. Select a location for your database (choose closest to your users)
7. Click **Enable**

## 🔐 Step 2: Set Up Security Rules

After creating the database, you need to set up security rules to protect your data:

1. In Firestore Database, click on the **Rules** tab
2. Replace the default rules with the appropriate set below:

### Production Mode Rules (Recommended)

If you created your database in **Production mode**, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      // Allow anyone to create contacts (needed for forms)
      // Validate that email is provided
      allow create: if request.resource.data.email != null 
                   && request.resource.data.form_source != null;
      
      // Only allow authenticated admins to read/update/delete
      // For now, you can read your own data via Firebase Console
      // Later, set up admin authentication for programmatic access
      allow read, update, delete: if false; // Restrict to console only for now
    }
  }
}
```

**What this does:**
- ✅ Allows anyone to **create** contacts (so forms work)
- ✅ Validates that email and form_source are provided
- ✅ Prevents reading/updating/deleting from frontend (use Firebase Console to view data)

### If You Need Console Access Only

If you only want to manage contacts through Firebase Console and prevent any frontend access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      allow create: if request.resource.data.email != null 
                   && request.resource.data.form_source != null;
      allow read, update, delete: if false;
    }
  }
}
```

## 🔑 Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If you don't have a web app, click **Add app** → **Web** (</>) icon
4. Register your app with a nickname (e.g., "Website")
5. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "crewcut-main.firebaseapp.com",
  projectId: "crewcut-main",
  storageBucket: "crewcut-main.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## 📝 Step 4: Update Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Copy the values from Firebase Console to your `.env` file:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=crewcut-main.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crewcut-main
VITE_FIREBASE_STORAGE_BUCKET=crewcut-main.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

3. **Important**: Never commit your `.env` file to git! It's already in `.gitignore`

## 🗄️ Step 5: Database Structure

The contacts will be stored in a collection called `contacts` with the following structure:

```typescript
{
  email: string;                    // Required
  first_name?: string;              // Optional
  last_name?: string;               // Optional
  phone_number?: string;            // Optional
  form_source: string;              // 'contact_form', 'footer_newsletter', 'ai_chat'
  company?: string;                 // Optional (from AI chat)
  business_type?: string;           // Optional (from AI chat)
  team_size?: string;               // Optional (from AI chat)
  budget?: string;                  // Optional (from AI chat)
  timeline?: string;                // Optional (from AI chat)
  decision_maker?: boolean;         // Optional (from AI chat)
  message?: string;                 // Optional (from contact form)
  created_at: Timestamp;           // Auto-generated
  updated_at: Timestamp;            // Auto-generated
}
```

## ✅ Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the contact form:
   - Fill out the contact form on your website
   - Submit it
   - Check Firebase Console → Firestore Database → `contacts` collection
   - You should see a new document with the contact information

3. Test the footer newsletter:
   - Subscribe to the newsletter via the footer
   - Check the `contacts` collection again

4. Test the AI chat:
   - Use the AI chat and provide your email
   - Check the `contacts` collection

## 📊 Viewing Contacts in Firebase Console

1. Go to Firebase Console → Firestore Database
2. Click on the `contacts` collection
3. You'll see all collected contacts with their information
4. You can export data, filter, and search through contacts

## 🔒 Production Security Rules

The production security rules are already set up in **Step 2** above. These rules:
- ✅ Allow creating contacts from your website (forms work)
- ✅ Validate required fields (email, form_source)
- ✅ Prevent unauthorized reads/updates/deletes (protect your data)
- ✅ Allow you to view/manage data through Firebase Console

**Note:** If you want to add admin authentication later for programmatic access, you can modify the `allow read, update, delete` rules to check for authenticated admin users. For now, using Firebase Console is the simplest and most secure approach.

## 🆓 Free Tier Limits

Firebase Firestore free tier (Spark plan) includes:
- **50,000 reads/day**
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB storage**

This is more than enough for most websites collecting contact information!

## 🐛 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure your domain is authorized in Firebase Console → Authentication → Settings → Authorized domains

### "Firebase: Error (permission-denied)"
- Check your Firestore security rules
- Make sure the rules allow creating documents in the `contacts` collection

### Data not appearing in Firestore
- Check browser console for errors
- Verify your `.env` file has the correct Firebase configuration
- Make sure you're looking at the correct Firebase project
- Check that Firestore is enabled (not Realtime Database)

### "Firebase App named '[DEFAULT]' already exists"
- This is normal if Firebase is already initialized elsewhere
- The code handles this automatically

## 📚 Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

## ✅ What's Working Now

After setup, the following will automatically save to Firestore:

1. **Contact Form** (`form_source: 'contact_form'`)
   - Email (required)
   - Name (first_name, last_name)
   - Phone number (optional)
   - Message

2. **Footer Newsletter** (`form_source: 'footer_newsletter'`)
   - Email (required)

3. **AI Chat** (`form_source: 'ai_chat'`)
   - Email (required)
   - Name (if provided)
   - Phone number (if provided)
   - Company, business type, team size, budget, timeline, decision maker (if collected)

All contacts are stored with timestamps (`created_at`, `updated_at`) for tracking.

