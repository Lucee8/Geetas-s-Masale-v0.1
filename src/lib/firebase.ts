import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { PRODUCTS, CATEGORIES } from '../data/storeData';

const getFirebaseConfig = () => {
  // Check if Express backend injected the configuration globally
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
    return (window as any).__FIREBASE_CONFIG__;
  }
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
};

const firebaseConfig = getFirebaseConfig();

// Check if Firebase configuration has been provided via environment variables
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

if (typeof window !== 'undefined') {
  console.log("🔍 Firebase Config Diagnostic:", {
    isConfigured: isFirebaseConfigured,
    apiKeyLoaded: !!firebaseConfig.apiKey,
    projectIdLoaded: !!firebaseConfig.projectId,
    projectIdValue: firebaseConfig.projectId || 'Not set',
    windowConfigPresent: !!(window as any).__FIREBASE_CONFIG__
  });
}

export const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

let app;
export let auth: any = null;
export let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

// Auto-seeding helper to populate their empty Firestore database
export async function seedDatabaseIfEmpty() {
  if (!isFirebaseConfigured || !db) return;

  try {
    // 1. Check & Seed Categories
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      console.log("Seeding categories to Firestore...");
      for (const cat of CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // 2. Check & Seed Products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      console.log("Seeding products to Firestore...");
      // Firestore batches can write up to 500 documents
      const batch = writeBatch(db);
      PRODUCTS.forEach((prod) => {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod);
      });
      await batch.commit();
      console.log("Successfully seeded all products!");
    }

    // 3. Check & Seed default settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'store_settings'));
    if (!settingsSnap.exists()) {
      console.log("Seeding default store settings to Firestore...");
      await setDoc(doc(db, 'settings', 'store_settings'), {
        storeName: "Geeta's Masale",
        contactEmail: "bhaveshkoyande8@gmail.com",
        contactPhone: "+91 9876543210",
        address: "Malvan, Konkan, Maharashtra, India",
        gstRate: 5,
        deliveryCharge: 50,
        freeDeliveryMin: 500,
        isMaintenanceMode: false
      });
    }

    // 4. Check & Seed coupons
    const couponsSnap = await getDocs(collection(db, 'coupons'));
    if (couponsSnap.empty) {
      console.log("Seeding default coupons to Firestore...");
      const defaultCoupons = [
        { id: 'c1', code: 'GEETA10', discountType: 'percentage', discountValue: 10, minOrderAmount: 299, active: true },
        { id: 'c2', code: 'FREE50', discountType: 'fixed', discountValue: 50, minOrderAmount: 499, active: true },
        { id: 'c3', code: 'KOKAN20', discountType: 'percentage', discountValue: 20, minOrderAmount: 999, active: true }
      ];
      for (const coupon of defaultCoupons) {
        await setDoc(doc(db, 'coupons', coupon.id), coupon);
      }
    }
  } catch (err: any) {
    console.error("Error while auto-seeding Firestore database:", err);
    if (err?.message?.includes('permission') || err?.code === 'permission-denied') {
      console.warn(
        "💡 DIAGNOSTIC: This is a Firebase Firestore permission issue. " +
        "Please open your Firebase Console -> Firestore Database -> Rules, paste the following rules, and click 'Publish':\n\n" +
        "rules_version = '2';\n" +
        "service cloud.firestore {\n" +
        "  match /databases/{database}/documents {\n" +
        "    match /{document=**} {\n" +
        "      allow read, write: if true;\n" +
        "    }\n" +
        "  }\n" +
        "}"
      );
    }
  }
}
