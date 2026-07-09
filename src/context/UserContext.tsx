/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updatePassword, 
  signOut, 
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  addDoc
} from 'firebase/firestore';
import { isFirebaseConfigured, db, auth, isProduction } from '../lib/firebase';
import { Product } from '../types';

export interface SavedAddress {
  id: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  fullName: string;
  streetAddress: string;
  landmark?: string;
  cityStatePincode: string;
  mobile: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  rewardPoints: number;
  cart?: { productId: string; quantity: number }[];
  wishlist?: string[];
  addresses?: SavedAddress[];
  recentlyViewed?: string[];
  couponsUsed?: string[];
  preferences?: {
    marketing?: boolean;
    orderUpdates?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  weight: string;
}

export interface Order {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  items: OrderItem[];
  paymentMethod: 'COD' | 'UPI';
  total: number;
  paidAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  couponCode?: string;
  pointsRedeemed?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  approved?: boolean;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  orders: Order[];
  reviews: Review[];
  isDemoUser: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => void;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changeUserPassword: (newPass: string) => Promise<void>;
  
  // Cart Sync
  syncCartToFirestore: (cartItems: { product: Product; quantity: number }[]) => Promise<void>;
  
  // Wishlist
  toggleWishlist: (productId: string) => Promise<void>;
  
  // Addresses
  saveAddress: (address: Omit<SavedAddress, 'id'> & { id?: string }) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  
  // Orders
  placeOrder: (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<Order>;
  fetchUserOrders: () => Promise<void>;
  
  // Reviews
  submitProductReview: (productId: string, productName: string, rating: number, text: string) => Promise<void>;
  fetchUserReviews: () => Promise<void>;
  
  // Recently Viewed
  addToRecentlyViewed: (productId: string) => Promise<void>;
  
  // Phone Auth
  setupRecaptcha: (containerId: string) => Promise<any>;
  sendOTP: (phoneNumber: string, verifier: any) => Promise<ConfirmationResult | string>;
  verifyOTP: (otpCode: string, confirmationResultOrPhone: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsDemoUser(false);
      
      if (firebaseUser) {
        // Load or create customer profile
        await fetchOrCreateUserProfile(firebaseUser);
      } else {
        setProfile(null);
        setOrders([]);
        setReviews([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchOrCreateUserProfile = async (firebaseUser: User) => {
    if (!db) return;
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial default profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Valued Customer',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          rewardPoints: 50, // Welcome gift points!
          cart: [],
          wishlist: [],
          addresses: [],
          recentlyViewed: [],
          couponsUsed: [],
          preferences: {
            marketing: true,
            orderUpdates: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }

      // Fetch user specific collections
      await Promise.all([
        fetchUserOrdersInternal(firebaseUser.uid),
        fetchUserReviewsInternal(firebaseUser.uid)
      ]);
    } catch (err) {
      console.error('Error fetching/creating user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrdersInternal = async (uid: string) => {
    if (!db) return;
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', uid)
      );
      const querySnap = await getDocs(q);
      const userOrders = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      // Sort client side by date descending
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(userOrders);
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  };

  const fetchUserReviewsInternal = async (uid: string) => {
    if (!db) return;
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', uid)
      );
      const querySnap = await getDocs(q);
      const userReviews = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      setReviews(userReviews);
    } catch (e) {
      console.error("Error fetching user reviews:", e);
    }
  };

  const loginAsDemo = () => {
    setIsDemoUser(true);
    const demoProfile: UserProfile = {
      uid: 'demo_customer_uid',
      name: 'Demo Customer (Konkan Explorer)',
      email: 'explorer@geetasmasale.com',
      phone: '+91 9999999999',
      rewardPoints: 120,
      cart: [],
      wishlist: [],
      addresses: [
        {
          id: 'address_demo_1',
          type: 'HOME',
          fullName: 'Bhavesh Koyande',
          streetAddress: 'Flat 402, Ocean Vista Heights, Devbag Beach Road',
          landmark: 'Near Malvan Jetty',
          cityStatePincode: 'Malvan, Maharashtra - 416606',
          mobile: '+91 9999999999',
          isDefault: true
        }
      ],
      recentlyViewed: ['p1', 'p2'],
      couponsUsed: ['GEETA10'],
      preferences: {
        marketing: true,
        orderUpdates: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProfile(demoProfile);
    setUser({
      uid: 'demo_customer_uid',
      displayName: 'Demo Customer',
      email: 'explorer@geetasmasale.com',
      phoneNumber: '+91 9999999999',
      emailVerified: true,
      isAnonymous: false,
    } as any);
    setLoading(false);
  };

  // Auth Functions
  const loginWithEmail = async (email: string, pass: string) => {
    if (email.toLowerCase() === 'demo@geetasmasale.com' || email.toLowerCase() === 'explorer@geetasmasale.com') {
      loginAsDemo();
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      if (isProduction) {
        throw new Error('Firebase is not configured on this production environment. Please ensure you have added the required VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your Render settings.');
      }
      // Mock login fallback if firebase is not configured
      setIsDemoUser(true);
      const mockUid = `mock_user_${Date.now()}`;
      let savedProfile: UserProfile | null = null;
      try {
        const stored = localStorage.getItem(`mock_profile_${email}`);
        if (stored) {
          savedProfile = JSON.parse(stored);
        }
      } catch (e) {}

      const mockProfile: UserProfile = savedProfile || {
        uid: mockUid,
        name: email.split('@')[0],
        email: email,
        phone: '+91 9999999999',
        rewardPoints: 120,
        cart: [],
        wishlist: [],
        addresses: [
          {
            id: 'address_demo_1',
            type: 'HOME',
            fullName: 'Bhavesh Koyande',
            streetAddress: 'Flat 402, Ocean Vista Heights, Devbag Beach Road',
            landmark: 'Near Malvan Jetty',
            cityStatePincode: 'Malvan, Maharashtra - 416606',
            mobile: '+91 9999999999',
            isDefault: true
          }
        ],
        recentlyViewed: ['p1', 'p2'],
        couponsUsed: ['GEETA10'],
        preferences: {
          marketing: true,
          orderUpdates: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProfile(mockProfile);
      setUser({
        uid: mockProfile.uid,
        displayName: mockProfile.name,
        email: email,
        phoneNumber: mockProfile.phone,
        emailVerified: true,
        isAnonymous: false,
      } as any);
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.message?.includes('credential')) {
        throw new Error('Invalid email or password. Feel free to use the "Quick Demo Login" button to sign in instantly with mock data!');
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn("Firebase not configured. Registering as mock demo user.");
      
      const mockUid = `mock_user_${Date.now()}`;
      const mockProfile: UserProfile = {
        uid: mockUid,
        name: name,
        email: email,
        phone: phone || '',
        rewardPoints: 50, // Welcome loyalty points
        cart: [],
        wishlist: [],
        addresses: [],
        recentlyViewed: [],
        couponsUsed: [],
        preferences: {
          marketing: true,
          orderUpdates: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store in localStorage to simulate persistence in demo mode
      localStorage.setItem(`mock_profile_${email}`, JSON.stringify(mockProfile));
      
      setProfile(mockProfile);
      setUser({
        uid: mockUid,
        displayName: name,
        email: email,
        phoneNumber: phone || '',
        emailVerified: true,
        isAnonymous: false,
      } as any);
      setIsDemoUser(true);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Explicitly create user profile document
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      phone: phone || '',
      rewardPoints: 50, // Welcome loyalty points
      cart: [],
      wishlist: [],
      addresses: [],
      recentlyViewed: [],
      couponsUsed: [],
      preferences: {
        marketing: true,
        orderUpdates: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setProfile(newProfile);
  };

  const forgotPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured. Simulating successful password reset email.");
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    if (isDemoUser) {
      setUser(null);
      setProfile(null);
      setOrders([]);
      setReviews([]);
      setIsDemoUser(false);
      return;
    }
    if (auth) {
      await signOut(auth);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!db) return;
    const targetUid = user?.uid;
    if (!targetUid) {
      // Demo User updates
      if (isDemoUser && profile) {
        const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
        setProfile(updated);
      }
      return;
    }

    try {
      const docRef = doc(db, 'users', targetUid);
      const cleanedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, cleanedUpdates);
      setProfile(prev => prev ? { ...prev, ...cleanedUpdates } : null);
    } catch (err) {
      console.error('Failed to update user profile:', err);
      throw err;
    }
  };

  const changeUserPassword = async (newPass: string) => {
    if (!auth?.currentUser) throw new Error('No active authenticated session.');
    await updatePassword(auth.currentUser, newPass);
  };

  // Cart syncing
  const syncCartToFirestore = async (cartItems: { product: Product; quantity: number }[]) => {
    if (!db || !user) return;
    try {
      const serializableCart = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      await updateDoc(doc(db, 'users', user.uid), {
        cart: serializableCart,
        updatedAt: new Date().toISOString()
      });
      setProfile(prev => prev ? { ...prev, cart: serializableCart } : null);
    } catch (e) {
      console.error("Failed to sync cart to Firestore:", e);
    }
  };

  // Wishlist
  const toggleWishlist = async (productId: string) => {
    if (!profile) return;
    const currentList = profile.wishlist || [];
    const isExist = currentList.includes(productId);
    const updatedList = isExist 
      ? currentList.filter(id => id !== productId)
      : [...currentList, productId];

    await updateUserProfile({ wishlist: updatedList });
  };

  // Addresses
  const saveAddress = async (addressData: Omit<SavedAddress, 'id'> & { id?: string }) => {
    if (!profile) return;
    const currentAddresses = profile.addresses || [];
    let updatedAddresses: SavedAddress[] = [];

    if (addressData.id) {
      // Edit mode
      updatedAddresses = currentAddresses.map(addr => 
        addr.id === addressData.id ? { ...addr, ...addressData } as SavedAddress : addr
      );
    } else {
      // Add mode
      const newAddress: SavedAddress = {
        ...addressData,
        id: `address_${Date.now()}`,
        isDefault: currentAddresses.length === 0 ? true : addressData.isDefault
      };
      updatedAddresses = [...currentAddresses, newAddress];
    }

    // If default is checked, un-default other addresses
    if (addressData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === addressData.id || (!addressData.id && addr.id === updatedAddresses[updatedAddresses.length - 1].id)
          ? addr
          : { ...addr, isDefault: false }
      );
    }

    await updateUserProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = async (id: string) => {
    if (!profile) return;
    const currentAddresses = profile.addresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr.id !== id);
    
    // If we deleted default, set first remaining as default
    if (currentAddresses.find(a => a.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    await updateUserProfile({ addresses: updatedAddresses });
  };

  // Orders
  const placeOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    const activeUid = user?.uid || 'demo_customer';
    const orderId = `order_${Date.now()}`;
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      userId: activeUid,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    if (db && user) {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      
      // Update coupons used & Loyalty points in User profile
      const couponsUsed = profile?.couponsUsed || [];
      if (orderData.couponCode && !couponsUsed.includes(orderData.couponCode)) {
        couponsUsed.push(orderData.couponCode);
      }
      
      const loyaltyEarned = Math.round(orderData.total * 0.1); // 10% cash back in loyalty points!
      const currentPoints = profile?.rewardPoints || 0;
      const pointsDeducted = orderData.pointsRedeemed || 0;
      const finalPoints = Math.max(0, currentPoints - pointsDeducted + loyaltyEarned);

      await updateUserProfile({
        couponsUsed,
        rewardPoints: finalPoints,
        cart: [] // clear server cart
      });

      // Refetch orders list
      await fetchUserOrdersInternal(user.uid);
    } else {
      // Demo Mode
      setOrders(prev => [newOrder, ...prev]);
      if (profile) {
        const loyaltyEarned = Math.round(orderData.total * 0.1);
        const currentPoints = profile.rewardPoints || 0;
        const pointsDeducted = orderData.pointsRedeemed || 0;
        const finalPoints = Math.max(0, currentPoints - pointsDeducted + loyaltyEarned);
        
        setProfile(prev => prev ? {
          ...prev,
          rewardPoints: finalPoints,
          cart: []
        } : null);
      }
    }

    return newOrder;
  };

  const fetchUserOrders = async () => {
    if (user) {
      await fetchUserOrdersInternal(user.uid);
    }
  };

  // Reviews
  const submitProductReview = async (productId: string, productName: string, rating: number, text: string) => {
    const activeUid = user?.uid || 'demo_customer';
    const activeName = profile?.name || 'Valued Customer';
    const reviewId = `review_${Date.now()}`;

    const newReview: Review = {
      id: reviewId,
      userId: activeUid,
      userName: activeName,
      productId,
      productName,
      rating,
      reviewText: text,
      createdAt: new Date().toISOString(),
      approved: true // Approved by default for customer review system
    };

    if (db && user) {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      await fetchUserReviewsInternal(user.uid);
    } else {
      // Demo Mode
      setReviews(prev => [newReview, ...prev]);
    }
  };

  const fetchUserReviews = async () => {
    if (user) {
      await fetchUserReviewsInternal(user.uid);
    }
  };

  // Recently Viewed
  const addToRecentlyViewed = async (productId: string) => {
    if (!profile) return;
    const current = profile.recentlyViewed || [];
    // Move to front, remove duplicates
    const filtered = current.filter(id => id !== productId);
    const updated = [productId, ...filtered].slice(0, 10); // cap at 10 items

    await updateUserProfile({ recentlyViewed: updated });
  };

  // Phone OTP Flow helpers
  const setupRecaptcha = async (containerId: string) => {
    if (!isFirebaseConfigured || !auth) return null;
    try {
      const containerEl = document.getElementById(containerId);
      if (!containerEl) return null;
      
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });
      return recaptchaVerifier;
    } catch (e) {
      console.error('Failed to initialize ReCaptcha verifier:', e);
      return null;
    }
  };

  const sendOTP = async (phoneNumber: string, verifier: any) => {
    if (!isFirebaseConfigured || !auth) {
      if (isProduction) {
        throw new Error('Firebase is not configured on this production environment. Please ensure you have added VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID under Environment Variables in your Render dashboard.');
      }
      // Sandbox mode: mock OTP transmission
      console.log(`[Demo Mobile Auth] OTP requested for ${phoneNumber}. Direct fallback activated.`);
      return 'sandbox_mode';
    }
    
    try {
      // Normalise phone number to contain country code if not present (assuming India +91)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      return confirmationResult;
    } catch (err: any) {
      console.error('Firebase signInWithPhoneNumber failed:', err);
      if (isProduction) {
        let extraMsg = '';
        if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
          extraMsg = ' (Your Render URL is not added to the "Authorized Domains" list in your Firebase Console. Please add geetas-s-masale-v0-1.onrender.com under Firebase Console -> Authentication -> Settings -> Authorized Domains)';
        }
        throw new Error(err.message || `Failed to send OTP: ${err.code || err}${extraMsg}`);
      }
      // If error occurs (e.g. captcha issues or provider disabled), fallback gracefully to sandbox flow
      return 'sandbox_mode';
    }
  };

  const verifyOTP = async (otpCode: string, confirmationResultOrPhone: any) => {
    if (isProduction && (confirmationResultOrPhone === 'sandbox_mode' || typeof confirmationResultOrPhone === 'string')) {
      throw new Error('Sandbox/Demo Mobile Auth is disabled on production. Real OTP verification is required.');
    }

    if (confirmationResultOrPhone === 'sandbox_mode' || typeof confirmationResultOrPhone === 'string') {
      // Handle Simulation / Sandbox Login
      const mockPhone = typeof confirmationResultOrPhone === 'string' && confirmationResultOrPhone !== 'sandbox_mode' 
        ? confirmationResultOrPhone 
        : '+91 9999999999';
        
      if (otpCode !== '123456') {
        throw new Error('Invalid verification code. Please enter the sandbox demo code: 123456');
      }

      // Bootstrap a demo customer profile session!
      setIsDemoUser(true);
      const demoProfile: UserProfile = {
        uid: 'demo_customer_uid',
        name: 'Demo Customer (Konkan Explorer)',
        email: 'explorer@geetasmasale.com',
        phone: mockPhone,
        rewardPoints: 120,
        cart: [],
        wishlist: [],
        addresses: [
          {
            id: 'address_demo_1',
            type: 'HOME',
            fullName: 'Bhavesh Koyande',
            streetAddress: 'Flat 402, Ocean Vista Heights, Devbag Beach Road',
            landmark: 'Near Malvan Jetty',
            cityStatePincode: 'Malvan, Maharashtra - 416606',
            mobile: mockPhone,
            isDefault: true
          }
        ],
        recentlyViewed: ['p1', 'p2'],
        couponsUsed: ['GEETA10'],
        preferences: {
          marketing: true,
          orderUpdates: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProfile(demoProfile);
      setUser({
        uid: 'demo_customer_uid',
        displayName: 'Demo Customer',
        email: 'explorer@geetasmasale.com',
        phoneNumber: mockPhone,
        emailVerified: true,
        isAnonymous: false,
      } as any);
      setLoading(false);
      return;
    }

    // Real Firebase Verification
    await (confirmationResultOrPhone as ConfirmationResult).confirm(otpCode);
  };

  return (
    <UserContext.Provider value={{
      user,
      profile,
      loading,
      orders,
      reviews,
      isDemoUser,
      loginWithEmail,
      loginAsDemo,
      registerWithEmail,
      forgotPassword,
      logout,
      updateUserProfile,
      changeUserPassword,
      syncCartToFirestore,
      toggleWishlist,
      saveAddress,
      deleteAddress,
      placeOrder,
      fetchUserOrders,
      submitProductReview,
      fetchUserReviews,
      addToRecentlyViewed,
      setupRecaptcha,
      sendOTP,
      verifyOTP
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
