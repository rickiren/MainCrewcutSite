import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export { db, app };

// Contact data interface
export interface ContactData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  form_source: string; // 'contact_form', 'footer_newsletter', 'ai_chat'
  company?: string;
  business_type?: string;
  team_size?: string;
  budget?: string;
  timeline?: string;
  decision_maker?: boolean;
  message?: string; // For contact form messages
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Remove undefined values from an object (Firestore doesn't accept undefined)
 */
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

/**
 * Save contact information to Firestore
 */
export const saveContactToFirestore = async (contact: Omit<ContactData, 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    
    // Remove undefined values before saving (Firestore doesn't accept undefined)
    const cleanedContact = removeUndefined(contact);
    
    const contactData: ContactData = {
      ...cleanedContact,
      created_at: now,
      updated_at: now
    } as ContactData;

    const docRef = await addDoc(collection(db, 'contacts'), contactData);
    console.log('✅ Contact saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving contact to Firestore:', error);
    throw error;
  }
};

