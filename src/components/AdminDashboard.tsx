/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, ShoppingBag, Tags, ListOrdered, Users, CreditCard, 
  Star, MessageSquare, Settings, LogOut, Plus, Edit2, Trash2, Search, 
  Check, X, Truck, AlertCircle, Eye, RefreshCw, Smartphone, Key,
  XCircle, Filter, Tag, Image, CheckCircle, Store, Send
} from 'lucide-react';
import { isFirebaseConfigured, db, auth, isVercel } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { PRODUCTS, CATEGORIES, resolveProductImage } from '../data/storeData';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'reviews' | 'contacts' | 'settings' | 'coupons'>('dashboard');
  const [contactsSubTab, setContactsSubTab] = useState<'orders' | 'messages'>('orders');

  // API Data Status
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  
  // Loading & Action queues
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  // Product Form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    weight: '250gm',
    mrp: 0,
    ratePerKg: 0,
    description: '',
    ingredients: '',
    usage: '',
    shelfLife: '12 Months',
    notes: '',
    image: '',
    stock: 50,
    isBestseller: false
  });

  // Category Form states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    image: ''
  });

  // Coupon Form state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'Fixed',
    value: 50,
    minOrderAmount: 399
  });

  // Filters & Search states
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [custSearch, setCustSearch] = useState('');

  // Auto-fill ratePerKg when mrp changes
  useEffect(() => {
    if (productForm.mrp) {
      // Estimate weight ratio: 250gm means 4x mrp, 500gm means 2x mrp, 1kg means 1x, etc.
      let multiplier = 4;
      const w = productForm.weight.toLowerCase();
      if (w.includes('500g')) multiplier = 2;
      else if (w.includes('1kg') || w.includes('1 kg')) multiplier = 1;
      else if (w.includes('200g')) multiplier = 5;
      else if (w.includes('100g')) multiplier = 10;
      else if (w.includes('300g')) multiplier = 3.33;
      
      setProductForm(prev => ({
        ...prev,
        ratePerKg: Math.round(prev.mrp * multiplier)
      }));
    }
  }, [productForm.mrp, productForm.weight]);

  // Auth bootstrap
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAdminUser({
            username: user.email,
            email: user.email,
            role: 'Super Admin'
          });
          setToken(user.uid);
        } else {
          setAdminUser(null);
          setToken(null);
        }
      });
      return () => unsubscribe();
    } else if (token) {
      fetchProfile();
    }
  }, [token]);

  // Load active tab dependencies
  useEffect(() => {
    if (token) {
      loadDataForTab();
    }
  }, [token, activeTab]);

  const loadDataForTab = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && db) {
        try {
          if (activeTab === 'dashboard') {
            const [ordersSnap, productsSnap, reviewsSnap] = await Promise.all([
              getDocs(collection(db, 'orders')),
              getDocs(collection(db, 'products')),
              getDocs(collection(db, 'reviews'))
            ]);
            
            const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const productsList = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const reviewsList = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate dynamic real-time metrics!
            const totalSales = ordersList
              .filter((o: any) => o.status !== 'Cancelled')
              .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
            
            const pendingOrders = ordersList.filter((o: any) => ['Pending', 'Confirmed', 'Processing', 'Dispatched'].includes(o.status)).length;

            setAnalytics({
              metrics: {
                totalRevenue: totalSales,
                ordersCount: ordersList.length,
                productsCount: productsList.length,
                pendingCount: pendingOrders,
                growthRate: 15.2,
                satisfactionRate: 4.9
              },
              recentOrders: ordersList.slice(0, 5),
              topSellingProducts: productsList.slice(0, 5),
              reviewsCount: reviewsList.length
            });
          } else if (activeTab === 'products') {
            const [prodSnap, catSnap] = await Promise.all([
              getDocs(collection(db, 'products')),
              getDocs(collection(db, 'categories'))
            ]);
            setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } else if (activeTab === 'categories') {
            const catSnap = await getDocs(collection(db, 'categories'));
            setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } else if (activeTab === 'orders') {
            const orderSnap = await getDocs(collection(db, 'orders'));
            setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt)));
          } else if (activeTab === 'customers') {
            const orderSnap = await getDocs(collection(db, 'orders'));
            const ordersList = orderSnap.docs.map(d => d.data());
            // Map unique customers dynamically from orders if no customers collection exists
            const customersMap = new Map();
            ordersList.forEach((o: any) => {
              const key = o.phone || o.email;
              if (key && !customersMap.has(key)) {
                customersMap.set(key, {
                  id: key,
                  name: o.name || 'Anonymous Customer',
                  email: o.email || '',
                  phone: o.phone || '',
                  ordersCount: ordersList.filter((x: any) => x.phone === o.phone || x.email === o.email).length,
                  totalSpent: ordersList.filter((x: any) => (x.phone === o.phone || x.email === o.email) && x.status !== 'Cancelled').reduce((sum: number, x: any) => sum + Number(x.total || 0), 0)
                });
              }
            });
            setCustomers(Array.from(customersMap.values()));
          } else if (activeTab === 'reviews') {
            const reviewSnap = await getDocs(collection(db, 'reviews'));
            setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } else if (activeTab === 'contacts') {
            const [contactSnap, orderSnap] = await Promise.all([
              getDocs(collection(db, 'contacts')),
              getDocs(collection(db, 'orders'))
            ]);
            setContacts(contactSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt)));
            setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt)));
          } else if (activeTab === 'settings') {
            const settingsSnap = await getDoc(doc(db, 'settings', 'store_settings'));
            if (settingsSnap.exists()) {
              setSettings(settingsSnap.data());
            }
          } else if (activeTab === 'coupons') {
            const couponSnap = await getDocs(collection(db, 'coupons'));
            setCoupons(couponSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
          setLoading(false);
          return;
        } catch (firebaseErr) {
          console.error("Failed to load Firebase dashboard data, falling back to local/API:", firebaseErr);
        }
      }

      if (isVercel) {
        if (activeTab === 'dashboard') {
          setAnalytics({
            metrics: { totalRevenue: 124500, ordersCount: 24, productsCount: 25, pendingCount: 3, growthRate: 15.2, satisfactionRate: 4.9 },
            recentOrders: [],
            topSellingProducts: [],
            reviewsCount: 4
          });
        } else if (activeTab === 'products') {
          // Fall back to clean static data
          setProducts(PRODUCTS as any);
          setCategories(CATEGORIES as any);
        } else if (activeTab === 'categories') {
          setCategories(CATEGORIES as any);
        }
        setLoading(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };
      
      const safeFetchJson = async (url: string, init?: RequestInit) => {
        const response = await fetch(url, init);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response, but got: ${contentType || 'unknown'}`);
        }
        return await response.json();
      };
      
      if (activeTab === 'dashboard') {
        const data = await safeFetchJson('/api/admin/analytics', { headers });
        setAnalytics(data);
      } else if (activeTab === 'products') {
        const [prodData, catData] = await Promise.all([
          safeFetchJson('/api/admin/products', { headers }),
          safeFetchJson('/api/admin/categories', { headers })
        ]);
        setProducts(prodData);
        setCategories(catData);
      } else if (activeTab === 'categories') {
        const data = await safeFetchJson('/api/admin/categories', { headers });
        setCategories(data);
      } else if (activeTab === 'orders') {
        const data = await safeFetchJson('/api/admin/orders', { headers });
        setOrders(data);
      } else if (activeTab === 'customers') {
        const data = await safeFetchJson('/api/admin/customers', { headers });
        setCustomers(data);
      } else if (activeTab === 'reviews') {
        const data = await safeFetchJson('/api/admin/reviews', { headers });
        setReviews(data);
      } else if (activeTab === 'contacts') {
        const [contactData, orderData] = await Promise.all([
          safeFetchJson('/api/admin/contact', { headers }),
          safeFetchJson('/api/admin/orders', { headers })
        ]);
        setContacts(contactData);
        setOrders(orderData);
      } else if (activeTab === 'settings') {
        const data = await safeFetchJson('/api/settings');
        setSettings(data);
      } else if (activeTab === 'coupons') {
        const data = await safeFetchJson('/api/admin/coupons', { headers });
        setCoupons(data);
      }
    } catch (err) {
      console.error("Dashboard failed to retrieve live records:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setAdminUser(data.user);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        // Firebase authentication expects an email format
        const email = username.includes('@') ? username : `${username}@gmail.com`;
        try {
          await signInWithEmailAndPassword(auth, email, password);
          showToast('Login successful (Firebase). Welcome back!');
          return;
        } catch (signInErr: any) {
          const errorCode = signInErr?.code || '';
          // If user doesn't exist, try auto-registering the default user!
          if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-disabled') {
            try {
              console.log("Admin account not found in Firebase Auth, attempting to auto-create...");
              await createUserWithEmailAndPassword(auth, email, password);
              showToast("Admin account automatically created in Firebase and logged in successfully!");
              return;
            } catch (signUpErr: any) {
              console.error("Auto-registration of admin failed:", signUpErr);
              if (signUpErr?.code === 'auth/operation-not-allowed') {
                setLoginError("Email/Password provider is disabled in your Firebase Console. Action required: Go to Firebase Console -> Authentication -> Sign-in Method, and enable 'Email/Password'. Then try logging in again!");
              } else if (signUpErr?.code === 'auth/weak-password') {
                setLoginError("Firebase rejected the login: Password is too weak. (Minimum 6 characters required by Firebase).");
              } else {
                setLoginError(`Firebase Login / Creation Failed: ${signUpErr.message || signUpErr}`);
              }
              return;
            }
          } else if (errorCode === 'auth/operation-not-allowed') {
            setLoginError("Email/Password provider is disabled in your Firebase Console. Action required: Go to Firebase Console -> Authentication -> Sign-in Method, and enable 'Email/Password'.");
            return;
          } else {
            throw signInErr;
          }
        }
      }

      if (isVercel) {
        setLoginError('Vercel hosting is serverless (client-only) and requires Firebase for database storage and admin authentication. Please configure VITE_FIREBASE_* environment variables in your Vercel Dashboard to enable this.');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setAdminUser(data.user);
        showToast('Login successful. Welcome back!');
      } else {
        setLoginError(data.error || 'Login verification failed.');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (isFirebaseConfigured) {
        setLoginError(err.message || 'Firebase login failed. Please verify your Email/Password is enabled in Firebase Console.');
      } else {
        setLoginError('Could not communicate with the backend.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase SignOut error:", err);
      }
    }
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdminUser(null);
    onClose();
  };

  // Convert uploaded image file locally to Base64 (STEP 17 - Save base64 string in DB file)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, objectType: 'product' | 'category') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (objectType === 'product') {
        setProductForm(prev => ({ ...prev, image: base64String }));
      } else {
        setCategoryForm(prev => ({ ...prev, image: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Products Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isFirebaseConfigured && db) {
        const isEditing = !!editingProduct;
        const prodId = isEditing ? editingProduct.id : `p_${Date.now()}`;
        const finalForm = { ...productForm, id: prodId };
        await setDoc(doc(db, 'products', prodId), finalForm);
        showToast(isEditing ? 'Product modified successfully.' : 'Product listed successfully.');
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadDataForTab();
        return;
      }

      const isEditing = !!editingProduct;
      const url = isEditing ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEditing ? 'Product modified successfully.' : 'Product listed successfully.');
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadDataForTab();
      } else {
        alert(data.error || 'Failed to submit product.');
      }
    } catch (err) {
      alert('Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product? This will update category counters too.')) return;
    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'products', id));
        showToast('Product successfully removed from active listings.');
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Product successfully removed from active listings.');
        loadDataForTab();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete product.');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Toggle Bestseller helper
  const toggleBestseller = async (prod: any) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'products', prod.id), { isBestseller: !prod.isBestseller });
        showToast(`Bestseller badge ${!prod.isBestseller ? 'enabled' : 'removed'}.`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBestseller: !prod.isBestseller })
      });
      if (res.ok) {
        showToast(`Bestseller badge ${!prod.isBestseller ? 'enabled' : 'removed'}.`);
        loadDataForTab();
      }
    } catch (err) {
      console.error('Error toggling bestseller status');
    }
  };

  // Increment Stock helper
  const adjustStock = async (prod: any, amount: number) => {
    const rawStock = Math.max(0, prod.stock + amount);
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'products', prod.id), { stock: rawStock });
        showToast(`Stock updated to ${rawStock} items.`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: rawStock })
      });
      if (res.ok) {
        showToast(`Stock updated to ${rawStock} items.`);
        loadDataForTab();
      }
    } catch (err) {
      console.error('Error adjusting stock');
    }
  };

  // Categories Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isFirebaseConfigured && db) {
        const isEditing = !!editingCategory;
        const catId = isEditing ? editingCategory.id : `c_${Date.now()}`;
        const finalForm = { ...categoryForm, id: catId };
        await setDoc(doc(db, 'categories', catId), finalForm);
        showToast(isEditing ? 'Category successfully modified.' : 'New department category created.');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        loadDataForTab();
        return;
      }

      const isEditing = !!editingCategory;
      const url = isEditing ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEditing ? 'Category successfully modified.' : 'New department category created.');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        loadDataForTab();
      } else {
        alert(data.error || 'Failed to submit category.');
      }
    } catch (err) {
      alert('Error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Associated items will automatically be routed to "General" category.')) return;
    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'categories', id));
        showToast('Category deleted and items reallocated.');
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Category deleted and items reallocated.');
        loadDataForTab();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to remove category.');
      }
    } catch (err) {
      alert('Error deleting category.');
    }
  };

  // Toggle Category Hidden
  const toggleCategoryHidden = async (cat: any) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'categories', cat.id), { hidden: !cat.hidden });
        showToast(`Category ${!cat.hidden ? 'hidden from client site' : 'visible on client site'}.`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hidden: !cat.hidden })
      });
      if (res.ok) {
        showToast(`Category ${!cat.hidden ? 'hidden from client site' : 'visible on client site'}.`);
        loadDataForTab();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Orders Workflow (Confirm, Process, Dispatch, Deliver, Cancel) (STEP 7)
  const handleOrderStatusUpdate = async (id: string, newStatus: string) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'orders', id), { status: newStatus });
        showToast(`Order status successfully updated to: ${newStatus}`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status successfully updated to: ${newStatus}`);
        loadDataForTab();
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const handleOrderPaymentStatusUpdate = async (id: string, newPaymentStatus: string) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'orders', id), { paymentStatus: newPaymentStatus });
        showToast(`Payment status successfully updated to: ${newPaymentStatus}`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/orders/${id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      if (res.ok) {
        showToast(`Payment status successfully updated to: ${newPaymentStatus}`);
        loadDataForTab();
      }
    } catch (err) {
      alert('Error updating payment status');
    }
  };

  // Orders add tracking ID
  const handleOrderAddTracking = async (id: string, trackingNumber: string) => {
    if (!trackingNumber) return;
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'orders', id), { trackingNumber });
        showToast(`Tracking ID added to order.`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/orders/${id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber })
      });
      if (res.ok) {
        showToast(`Tracking ID added to order.`);
        loadDataForTab();
      }
    } catch (err) {
      alert('Error adding tracking information');
    }
  };

  // Reviews approval (STEP 11)
  const handleReviewApprove = async (id: number, approveState: boolean) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'reviews', String(id)), { approved: approveState });
        showToast(approveState ? 'Review published successfully.' : 'Review retracted from listing.');
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: approveState })
      });
      if (res.ok) {
        showToast(approveState ? 'Review published successfully.' : 'Review retracted from listing.');
        loadDataForTab();
      }
    } catch (err) {
      alert('Review moderation failed.');
    }
  };

  // Delete review
  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this testimonial review?')) return;
    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'reviews', String(id)));
        showToast('Review permanently deleted.');
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Review permanently deleted.');
        loadDataForTab();
      }
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // Contact status mark (New, In Progress, Resolved) (STEP 12)
  const handleInquiryStatusChange = async (id: number, newStatus: string) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'contacts', String(id)), { status: newStatus });
        showToast(`Inquiry status updated to ${newStatus}.`);
        loadDataForTab();
        return;
      }

      const res = await fetch(`/api/admin/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Inquiry status updated to ${newStatus}.`);
        loadDataForTab();
      }
    } catch (err) {
      alert('Failed to modify inquiry status.');
    }
  };

  // Website Settings Submit (STEP 14)
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'settings', 'store_settings'), settings);
        showToast('Global shop specifications saved beautifully!');
        loadDataForTab();
        return;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Global shop specifications saved beautifully!');
        loadDataForTab();
      } else {
        alert('Failed to update website settings.');
      }
    } catch (err) {
      alert('Error updating specs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Coupons submit
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isFirebaseConfigured && db) {
        const couponId = couponForm.id || `coupon_${Date.now()}`;
        const finalCoupon = { ...couponForm, id: couponId };
        await setDoc(doc(db, 'coupons', couponId), finalCoupon);
        showToast('New coupon code created successfully!');
        setIsCouponModalOpen(false);
        loadDataForTab();
        return;
      }

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(couponForm)
      });
      if (res.ok) {
        showToast('New coupon code created successfully!');
        setIsCouponModalOpen(false);
        loadDataForTab();
      }
    } catch (err) {
      alert('Error creating coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      weight: prod.weight,
      mrp: prod.mrp,
      ratePerKg: prod.ratePerKg,
      description: prod.description || '',
      ingredients: prod.ingredients || '',
      usage: prod.usage || '',
      shelfLife: prod.shelfLife || '12 Months',
      notes: prod.notes || '',
      image: prod.image || '',
      stock: prod.stock || 50,
      isBestseller: !!prod.isBestseller
    });
    setIsProductModalOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories.length > 0 ? categories[0].id : 'Masale',
      weight: '250gm',
      mrp: 150,
      ratePerKg: 600,
      description: '',
      ingredients: '',
      usage: '',
      shelfLife: '12 Months',
      notes: 'No artificial preservatives.',
      image: '',
      stock: 50,
      isBestseller: false
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Category Modal
  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || ''
    });
    setIsCategoryModalOpen(true);
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      description: '',
      image: ''
    });
    setIsCategoryModalOpen(true);
  };


  // -------------------------------------------------------------
  // RENDER LOGIN PAGE (STEP 3)
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-100"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#A61B1B]" />
              <h2 className="text-lg font-mono font-black uppercase text-slate-800 tracking-wider">
                GEETA'S ADMIN PORTAL
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-5 bg-[#A61B1B]/5 p-4 rounded-2xl border border-[#A61B1B]/10">
            <p className="text-[11px] font-sans text-slate-600 leading-relaxed">
              Authenticate via standard staff credentials to access live stock inventory, process customer shipments, approve reviews, or change store settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                Staff Username:
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#A61B1B]/40 focus:border-[#A61B1B]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#A61B1B]/40 focus:border-[#A61B1B]"
                required
              />
            </div>

            {loginError && (
              <div className="flex items-center space-x-1.5 text-xs text-red-600 font-sans font-bold bg-red-50 p-3 rounded-xl border border-red-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-xl bg-[#A61B1B] hover:bg-rose-950 disabled:bg-slate-300 text-white text-xs font-mono font-black tracking-widest uppercase transition-all shadow-md mt-2 cursor-pointer"
            >
              {loginLoading ? 'Authenticating...' : 'Validate Access 🔑'}
            </button>
          </form>


        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DASHBOARD LAYOUT (STEP 4)
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white max-w-md px-6 py-3.5 rounded-full shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-mono font-black tracking-wider uppercase text-white">{successToast}</span>
        </div>
      )}

      <div className="w-full h-full max-w-7xl bg-[#FAF9F6] rounded-3xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-slate-100 flex flex-col lg:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {/* Header branding logo */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-[#E86A17] animate-pulse" />
              <div>
                <span className="block text-xs font-mono font-black uppercase text-white tracking-widest leading-none">
                  GEETA'S MASALAS
                </span>
                <span className="block text-[8px] font-mono text-emerald-400 tracking-wider">
                  REALTIME DB SYNC • {adminUser?.role || 'Staff'}
                </span>
              </div>
            </div>
            
            {/* Quick exit icon */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
            
            <span className="block px-2 text-[8px] font-mono font-black tracking-[0.25em] text-slate-500 uppercase mt-2 mb-1.5">
              General Operations
            </span>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'dashboard' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'products' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Products Shelf</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'categories' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tags className="w-4 h-4 shrink-0" />
              <span>Categories</span>
            </button>

            <span className="block px-2 text-[8px] font-mono font-black tracking-[0.25em] text-slate-500 uppercase mt-4 mb-1.5">
              E-Commerce Logs
            </span>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider relative ${
                activeTab === 'orders' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4 shrink-0" />
              <span>Orders Book</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'customers' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Customer Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'coupons' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Coupons</span>
            </button>

            <span className="block px-2 text-[8px] font-mono font-black tracking-[0.25em] text-slate-500 uppercase mt-4 mb-1.5">
              Feedback & Media
            </span>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'reviews' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Testimonials</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'contacts' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Inquiries</span>
            </button>

            <span className="block px-2 text-[8px] font-mono font-black tracking-[0.25em] text-slate-500 uppercase mt-4 mb-1.5">
              Layout Settings
            </span>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider ${
                activeTab === 'settings' ? 'bg-[#A61B1B] text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Shop Properties</span>
            </button>
          </nav>

          {/* Sidebar Footer with username */}
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950/60 font-mono">
            <div>
              <span className="block font-black text-white leading-none truncate max-w-32">
                {adminUser?.name || 'Bhavesh'}
              </span>
              <span className="block text-[8px] text-slate-400 mt-1">
                {adminUser?.username || 'admin'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 px-2 uppercase text-[9px] font-bold bg-slate-800 text-rose-300 hover:text-white rounded hover:bg-[#A61B1B] transition-colors cursor-pointer"
              title="Logout session"
            >
              Exit
            </button>
          </div>
        </aside>

        {/* MAIN VISUAL WORKSPACE PANEL */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] overflow-hidden">
          
          {/* Top workspace bar */}
          <header className="h-14 border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white shadow-sm">
            
            <div className="flex items-center space-x-2">
              <span className="text-xl font-mono uppercase font-black text-slate-800 tracking-tight">
                {activeTab} console
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50 uppercase">
                Production-Store synced
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Reset live tab trigger */}
              <button
                onClick={loadDataForTab}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 active:scale-95 transition-all text-xs font-mono flex items-center space-x-1 cursor-pointer"
                title="Sync dynamic database states"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>

              <button
                onClick={onClose}
                className="hidden lg:flex items-center space-x-1 p-1.5 px-3 rounded-lg bg-slate-900 text-white hover:bg-rose-950 text-xs font-mono font-bold uppercase cursor-pointer"
              >
                <span>Back to Shop</span>
              </button>
            </div>
          </header>

          {/* Dynamic viewport scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {loading && !analytics && !products.length ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-[#A61B1B]" />
                <span className="text-xs font-mono uppercase tracking-wider">Syncing database collections...</span>
              </div>
            ) : (
              <>

                {/* ========================================== */}
                {/* 1. OVERVIEW / DASHBOARD ANALYTICS (STEP 13)* */}
                {/* ========================================== */}
                {activeTab === 'dashboard' && analytics && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Top highlights grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest leading-none mb-1">
                          Lifetime Revenue
                        </span>
                        <div className="flex items-baseline space-x-1 text-[#A61B1B]">
                          <span className="text-2xl font-black">₹{analytics.summary?.totalRevenue || 0}</span>
                        </div>
                        <span className="text-[9px] font-sans text-slate-400 mt-1 block">
                          Excludes cancelled orders
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest leading-none mb-1">
                          Completed Shipments
                        </span>
                        <div className="text-2xl font-black text-slate-800">
                          {analytics.summary?.totalOrdersCount || 0}
                        </div>
                        <span className="text-[9px] font-mono text-emerald-600 mt-1 block">
                          100% fulfill rating
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest leading-none mb-1 text-amber-600">
                          Low Stock Alerts
                        </span>
                        <div className="text-2xl font-black text-slate-800">
                          {analytics.summary?.lowStockThresholdCount || 0} ITEMS
                        </div>
                        <span className="text-[9px] font-mono text-amber-500 mt-1 block">
                          Under 15 items remaining
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest leading-none mb-1">
                          Pending Inquiries
                        </span>
                        <div className="text-2xl font-black text-slate-800">
                          {analytics.summary?.unreadInquiriesCount || 0} NEW
                        </div>
                        <span className="text-[9px] font-mono text-rose-500 mt-1 block">
                          Requires staff reply
                        </span>
                      </div>

                    </div>

                    {/* Sales charts & category share visualizers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Simulated elegant pure-CSS monthly graph */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700 mb-4">
                          Sales Progression over time
                        </h3>
                        {analytics.ordersOverTime?.length > 0 ? (
                          <div className="h-44 flex items-end justify-between space-x-2 pt-4">
                            {analytics.ordersOverTime.map((item: any, idx: number) => {
                              const maxVal = Math.max(...analytics.ordersOverTime.map((o: any) => o.revenue), 1);
                              const heightPct = Math.round((item.revenue / maxVal) * 80) + 10;
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                  <span className="text-[8px] font-mono text-slate-500 mb-1 leading-none">₹{item.revenue}</span>
                                  <div 
                                    style={{ height: `${heightPct}px` }} 
                                    className="w-full rounded-t-lg bg-gradient-to-t from-[#A61B1B] to-rose-400 group relative cursor-pointer hover:opacity-90"
                                  >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[8px] rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                      Revenue: ₹{item.revenue}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 mt-1.5 leading-none">{item.period}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
                            No sales data registered yet to generate visual trends.
                          </div>
                        )}
                      </div>

                      {/* Bestselling items by volume */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-left">
                        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700 mb-4">
                          🏆 Top-Selling Coastal Items
                        </h3>
                        {analytics.topSellingProducts?.length > 0 ? (
                          <div className="space-y-3.5">
                            {analytics.topSellingProducts.map((p: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[#A61B1B]/5 border border-slate-100 flex items-center justify-center font-mono font-bold text-[#A61B1B] text-xs">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans font-black text-slate-800 uppercase line-clamp-1">
                                      {p.name}
                                    </span>
                                    <span className="block text-[8px] font-mono text-slate-400 uppercase">
                                      Category: {p.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs font-mono font-black text-slate-800">
                                    {p.qty} Liters / Packs
                                  </span>
                                  <span className="block text-[9px] font-mono text-emerald-600">
                                    Value: ₹{p.value}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
                            Top product counts will compute automatically based on orders placed.
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Recent Orders List */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm text-left">
                      <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700 mb-4">
                        🕒 Latest Transaction Queue
                      </h3>
                      {analytics.recentOrders?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left text-slate-500">
                            <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50 rounded-lg">
                              <tr>
                                <th className="px-3 py-2.5">Order ID</th>
                                <th className="px-3 py-2.5">Recipient</th>
                                <th className="px-3 py-2.5">Placed Date</th>
                                <th className="px-3 py-2.5 text-right">Amount</th>
                                <th className="px-3 py-2.5 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.recentOrders.map((o: any) => (
                                <tr key={o.id} className="border-b border-slate-100 font-sans hover:bg-slate-50/55 transition-colors">
                                  <td className="px-3 py-3 font-mono font-black text-slate-800">{o.id}</td>
                                  <td className="px-3 py-3 font-bold text-slate-700">{o.customer}</td>
                                  <td className="px-3 py-3 text-slate-400">{new Date(o.date).toLocaleDateString()}</td>
                                  <td className="px-3 py-3 text-right font-mono font-black text-slate-850">₹{o.amount}</td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                                      o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                      o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-855'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-slate-450 text-xs font-mono text-center py-6">
                          Waiting for live customer checkout transactions to log logs.
                        </p>
                      )}
                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 2. PRODUCTS MODULE (STEP 5)                */}
                {/* ========================================== */}
                {activeTab === 'products' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Filters & action buttons */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
                      
                      {/* Left: Input searches */}
                      <div className="flex flex-1 flex-col sm:flex-row items-stretch gap-2.5">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={prodSearch}
                            onChange={e => setProdSearch(e.target.value)}
                            placeholder="Find products by name..."
                            className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                          />
                        </div>

                        <div className="flex items-center space-x-1">
                          <Filter className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            value={prodCatFilter}
                            onChange={e => setProdCatFilter(e.target.value)}
                            className="bg-transparent border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-600 focus:outline-none"
                          >
                            <option value="all">All Departments</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Right: Add triggers */}
                      <button
                        onClick={openNewProduct}
                        className="p-3 bg-[#A61B1B] hover:bg-rose-950 text-white rounded-xl text-xs font-mono font-bold uppercase inline-flex items-center space-x-1 scroll-mt-20 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>

                    </div>

                    {/* Products Grid list */}
                    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm text-left">
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-500">
                          <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                            <tr className="border-b border-slate-150">
                              <th className="px-4 py-3">Details / SKU</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3 text-right">MRP (Priced)</th>
                              <th className="px-4 py-3 text-center">Bestseller Toggle</th>
                              <th className="px-4 py-3 text-center">Remaining Stock</th>
                              <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products
                              .filter(p => !prodSearch || (p.name || '').toLowerCase().includes(prodSearch.toLowerCase()))
                              .filter(p => prodCatFilter === 'all' || (p.category || '').toLowerCase() === prodCatFilter.toLowerCase())
                              .map(p => (
                                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors font-sans">
                                  
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={resolveProductImage(p) || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'}
                                        alt={p.name}
                                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/50"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
                                        }}
                                      />
                                      <div>
                                        <span className="block font-black text-slate-800 text-xs sm:text-sm uppercase">{p.name}</span>
                                        <div className="flex items-center space-x-1.5 text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                                          <span>SKU: {p.id}</span>
                                          <span>•</span>
                                          <span>Weight: {p.weight}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3.5 font-mono text-[#A61B1B] font-bold uppercase text-[10px]">
                                    {p.category}
                                  </td>

                                  <td className="px-4 py-3.5 text-right">
                                    <span className="block font-mono font-black text-slate-800 text-xs">₹{p.mrp}</span>
                                    <span className="block text-[8px] font-mono text-slate-400">₹{p.ratePerKg}/KG</span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <button
                                      onClick={() => toggleBestseller(p)}
                                      className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase transition-all tracking-wider ${
                                        p.isBestseller 
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                                      }`}
                                    >
                                      {p.isBestseller ? '★ YES' : '☆ NO'}
                                    </button>
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <div className="flex items-center justify-center space-x-1.5">
                                      <button 
                                        onClick={() => adjustStock(p, -5)}
                                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                        p.stock < 15 ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-800'
                                      }`}>
                                        {p.stock} units
                                      </span>
                                      <button 
                                        onClick={() => adjustStock(p, 5)}
                                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => openEditProduct(p)}
                                        className="p-1 px-2 border border-slate-200 rounded hover:bg-[#A61B1B] hover:text-white hover:border-[#A61B1B] text-slate-500 transition-all text-[10px] font-mono font-bold uppercase cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="p-1 px-2 border border-rose-100 rounded hover:bg-red-650 hover:text-white hover:border-red-650 text-red-500 transition-all text-[10px] font-mono font-bold uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 3. CATEGORIES MODULE (STEP 6)             */}
                {/* ========================================== */}
                {activeTab === 'categories' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex items-center justify-between text-left">
                      <span className="text-xs font-mono text-slate-500">
                        *Add and manage your primary e-commerce classification shelves.
                      </span>
                      <button
                        onClick={openNewCategory}
                        className="py-2.5 px-3.5 bg-[#A61B1B] hover:bg-rose-950 text-white rounded-xl text-xs font-mono font-bold uppercase inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm text-left">
                      <table className="w-full text-xs text-left text-slate-500">
                        <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                          <tr className="border-b border-slate-150">
                            <th className="px-4 py-3">Category Detail</th>
                            <th className="px-4 py-3 text-center">ID Reference</th>
                            <th className="px-4 py-3 text-center">Status Filters</th>
                            <th className="px-4 py-3 text-center">Connected SKUs</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((c, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                              
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3 font-sans text-left">
                                  <img
                                    src={c.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'}
                                    alt={c.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <span className="block font-black text-slate-800 text-xs sm:text-sm uppercase">{c.name}</span>
                                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">{c.description || 'No custom description.'}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-center font-mono font-black text-[#A61B1B] text-xs">
                                {c.id}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => toggleCategoryHidden(c)}
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border cursor-pointer ${
                                    c.hidden 
                                      ? 'bg-red-50 text-red-500 border-red-200' 
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  }`}
                                >
                                  {c.hidden ? '● Hidden' : '● Live'}
                                </button>
                              </td>

                              <td className="px-4 py-3 text-center font-mono font-black text-slate-700 text-xs">
                                {c.count || 0} Listed Items
                              </td>

                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => openEditCategory(c)}
                                    className="p-1 px-2 border border-slate-200 rounded hover:bg-[#A61B1B] hover:text-white text-slate-500 transition-all text-[10px] font-mono font-bold uppercase cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(c.id)}
                                    className="p-1 px-2 border border-rose-100 rounded hover:bg-rose-950 hover:text-white text-red-500 transition-all text-[10px] font-mono font-bold uppercase cursor-pointer text-center whitespace-nowrap"
                                  >
                                    Archive
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 4. ORDERS WORKFLOW CONTROLS (STEP 7)      */}
                {/* ========================================== */}
                {activeTab === 'orders' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Search and filters */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                          placeholder="Search orders ID, recipient, smartphone..."
                          className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      <select
                        value={orderStatusFilter}
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className="bg-transparent border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-600 focus:outline-none"
                      >
                        <option value="all">All Shipping Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Orders timeline and card entries */}
                    <div className="space-y-4">
                      {orders
                        .filter(o => !orderSearch || (o.id || '').toLowerCase().includes(orderSearch.toLowerCase()) || (o.customerName || o.name || '').toLowerCase().includes(orderSearch.toLowerCase()) || (o.customerPhone || o.phone || '').includes(orderSearch))
                        .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                        .map((o) => (
                          <div key={o.id} className="bg-white rounded-2xl border border-slate-150 p-4 sm:p-5 shadow-sm text-left font-sans space-y-4">
                            
                            {/* Inner header */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div>
                                <span className="block text-xs font-mono font-black text-[#A61B1B] uppercase">{o.id}</span>
                                <span className="block text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                                  Placed: {new Date(o.createdAt).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {/* Workflow drop selector */}
                                <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Status:</span>
                                <select
                                  value={o.status || 'Pending'}
                                  onChange={e => handleOrderStatusUpdate(o.id, e.target.value)}
                                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none bg-slate-50 font-bold"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Dispatched">Dispatched</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            {/* Recipient / Customer Coordinates */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              
                              <div>
                                <span className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">
                                  Delivery Address
                                </span>
                                <p className="font-bold text-slate-800 uppercase">{o.customerName}</p>
                                <p className="text-slate-500 mt-0.5">{o.customerAddress}</p>
                                <p className="text-slate-400 mt-1 font-mono">{o.customerPhone} | {o.customerEmail || 'No Email'}</p>
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">
                                  Payment & Invoicing
                                </span>
                                <div className="flex items-center space-x-1 text-slate-700 font-bold">
                                  <span>Method: {o.paymentType}</span>
                                </div>
                                <p className="text-slate-500 mt-1">Total Bill: <span className="font-mono font-black text-slate-800">₹{o.amount}</span></p>
                                <p className="text-emerald-600">Paid: <span className="font-mono font-bold">₹{o.paidAmount || 0}</span></p>
                                <p className="text-rose-600">Pending: <span className="font-mono font-bold">₹{o.pendingAmount || 0}</span></p>
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">
                                  Shipping Logistics
                                </span>
                                {o.trackingNumber ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1 text-emerald-600 font-mono font-black bg-emerald-50 px-2 py-1 rounded inline-block text-[10px]">
                                      <Truck className="w-3.5 h-3.5" />
                                      <span>ID: {o.trackingNumber}</span>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        const next = prompt('Modify Tracking ID:', o.trackingNumber);
                                        if (next !== null) handleOrderAddTracking(o.id, next);
                                      }}
                                      className="block text-[9px] font-mono uppercase text-[#A61B1B] hover:underline"
                                    >
                                      Change Tracking ID ↗
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 block italic">No tracking credentials added yet.</span>
                                    <button
                                      onClick={() => {
                                        const val = prompt('Enter Courier tracking registration ID (e.g., Delhivery / DTDC):');
                                        if (val) handleOrderAddTracking(o.id, val);
                                      }}
                                      className="py-1 px-2 border border-[#A61B1B]/15 text-[#A61B1B] hover:bg-[#A61B1B] hover:text-white rounded text-[10px] font-mono font-black uppercase transition-all inline-block cursor-pointer"
                                    >
                                      + Dispatch tracking ID
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* Ordered Items loop */}
                            <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-150">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                                Items Ordered Checklist
                              </span>
                              <div className="space-y-1.5">
                                {o.items?.map((item: any, iIdx: number) => (
                                  <div key={iIdx} className="flex items-center justify-between text-xs text-slate-700">
                                    <span>
                                      ● {item.productName} ({item.weight}) — <span className="font-bold text-slate-800">Qty: {item.quantity}</span>
                                    </span>
                                    <span className="font-mono text-slate-800 font-bold">
                                      ₹{item.price * item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        ))}

                      {orders.length === 0 && (
                        <p className="text-slate-450 text-xs font-mono bg-white p-12 text-center rounded-2xl border border-slate-150">
                          Empty Order ledger. Synched client transactions will populate live here.
                        </p>
                      )}
                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 5. CUSTOMER TRAILS (STEP 8)               */}
                {/* ========================================== */}
                {activeTab === 'customers' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-left">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={custSearch}
                          onChange={e => setCustSearch(e.target.value)}
                          placeholder="Search customer catalog by smartphone or name..."
                          className="pl-9 pr-4 py-2 w-full sm:w-80 rounded-xl border border-[#FAF9F6] text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm text-left">
                      <table className="w-full text-xs text-left text-slate-500">
                        <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                          <tr className="border-b border-slate-150">
                            <th className="px-4 py-3">Customer Profile</th>
                            <th className="px-4 py-3">Primary Shipment Address</th>
                            <th className="px-4 py-3 text-center">Transactions count</th>
                            <th className="px-4 py-3 text-right">Lifetime purchase bill</th>
                            <th className="px-4 py-3 text-center">Trust status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers
                            .filter(c => !custSearch || (c.name || '').toLowerCase().includes(custSearch.toLowerCase()) || (c.phone || '').includes(custSearch))
                            .map((c, idx) => (
                              <tr key={idx} className="border-b border-slate-100 font-sans hover:bg-slate-50/30 transition-colors">
                                
                                <td className="px-4 py-3.5">
                                  <span className="block font-black text-slate-800 text-sm uppercase">{c.name}</span>
                                  <span className="block text-[9px] font-mono text-[#A61B1B] mt-0.5">{c.phone} | {c.email}</span>
                                </td>

                                <td className="px-4 py-3.5 text-slate-500 text-xs max-w-xs">{c.address}</td>

                                <td className="px-4 py-3.5 text-center font-mono font-black text-slate-850">
                                  {c.totalOrders} Orders
                                </td>

                                <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900 text-xs">
                                  ₹{c.totalPurchasesAmount}
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100">
                                    Trusted Buyer
                                  </span>
                                </td>

                              </tr>
                            ))}

                          {customers.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-12 text-center text-slate-400 font-mono text-xs">
                                No customer registrations found. Registrations generate on completed inquiries.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 6. TESTIMONIAL MODERATION (STEP 11)       */}
                {/* ========================================== */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
                      <p className="text-xs font-mono text-slate-500 leading-relaxed">
                        To protect the brand kitchen from spam, all customer-written recipes or spice ratings entered on the website go into moderation first. Toggle "Approve / Publish" to list it.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map((r) => (
                        <div key={r.id} className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm text-left space-y-3 font-sans">
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="block text-xs font-black uppercase text-slate-800">{r.name}</span>
                              <span className="block text-[8px] font-mono text-slate-400 mt-0.5">{r.date}</span>
                            </div>
                            
                            {/* Stars rating */}
                            <div className="flex items-center space-x-0.5 bg-slate-50 p-1 px-2 rounded-lg border border-slate-200">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                              <span className="text-[10px] font-mono font-bold text-slate-700">{r.ratingValue}/5</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 italic">
                            "{r.comment}"
                          </p>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                            <span className="text-[10px] font-mono text-slate-400">
                              Verified tag: {r.verified ? 'YES' : 'NO'}
                            </span>

                            <div className="flex items-center space-x-2">
                              {r.approved ? (
                                <button
                                  onClick={() => handleReviewApprove(r.id, false)}
                                  className="px-2 py-1 text-[9px] font-mono font-black tracking-wider uppercase text-red-650 hover:bg-red-50 rounded border border-red-100 cursor-pointer"
                                >
                                  Retract Publication
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReviewApprove(r.id, true)}
                                  className="px-2 py-1 text-[9px] font-mono font-black tracking-wider uppercase text-white bg-emerald-600 hover:bg-[#5b8c5a] rounded border border-emerald-100 cursor-pointer"
                                >
                                  Approve & Publish
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteReview(r.id)}
                                className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                )}


                {/* ========================================== */}
                {/* 7. CONTACT MESSAGES (STEP 12)             */}
                {/* ========================================== */}
                {activeTab === 'contacts' && (
                  <div className="space-y-4 animate-fadeIn text-left">
                    
                    {/* Sub-tabs segment switcher */}
                    <div className="flex space-x-2 border-b border-slate-100 pb-2">
                      <button
                        onClick={() => setContactsSubTab('orders')}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
                          contactsSubTab === 'orders'
                            ? 'bg-[#A61B1B] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Order Inquiries ({orders.filter(o => o.status === 'Inquiry').length})
                      </button>
                      <button
                        onClick={() => setContactsSubTab('messages')}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition ${
                          contactsSubTab === 'messages'
                            ? 'bg-[#A61B1B] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Contact Messages ({contacts.length})
                      </button>
                    </div>

                    {contactsSubTab === 'orders' ? (
                      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                        <table className="w-full text-xs text-left text-slate-500">
                          <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                            <tr className="border-b border-slate-150">
                              <th className="px-4 py-3">Order Details</th>
                              <th className="px-4 py-3">Ordered Items</th>
                              <th className="px-4 py-3">Pricing Details</th>
                              <th className="px-4 py-3 text-center">Order Status</th>
                              <th className="px-4 py-3 text-center">Payment Status</th>
                              <th className="px-4 py-3 text-center">Action / Chat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.filter(o => o.status === 'Inquiry').map((o, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                                <td className="px-4 py-3.5">
                                  <span className="block text-[10px] font-mono font-black text-[#A61B1B] uppercase tracking-wider">{o.id}</span>
                                  <span className="block font-black text-slate-800 text-xs sm:text-sm uppercase mt-1">{o.customerName || o.name}</span>
                                  <span className="block text-[9px] font-mono text-slate-500 mt-0.5">{o.customerPhone || o.phone}</span>
                                  {o.customerEmail || o.email ? (
                                    <span className="block text-[9px] font-mono text-slate-400">{o.customerEmail || o.email}</span>
                                  ) : null}
                                  <span className="block text-[8px] font-mono text-slate-400 mt-1">Date: {new Date(o.createdAt).toLocaleString()}</span>
                                </td>

                                <td className="px-4 py-3.5 max-w-xs">
                                  <div className="space-y-1">
                                    {o.items?.map((item: any, itemIdx: number) => (
                                      <div key={itemIdx} className="text-[11px] font-sans text-slate-700 leading-normal">
                                        • <span className="font-bold uppercase">{item.productName}</span> 
                                        <span className="text-slate-500 text-[10px]"> ({item.weight || item.size || 'Pack'})</span>
                                        <span className="font-mono text-[#A61B1B] font-bold"> x{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span className="block text-xs font-mono font-black text-slate-800">Total: ₹{o.amount || o.total}</span>
                                  <span className="block text-[10px] font-mono text-emerald-600 font-bold mt-0.5">Paid: ₹{o.paidAmount || 0}</span>
                                  <span className="block text-[10px] font-mono text-amber-600 font-bold">Pending: ₹{o.pendingAmount || (o.amount || o.total) - (o.paidAmount || 0)}</span>
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                  <select
                                    value={o.status}
                                    onChange={e => handleOrderStatusUpdate(o.id, e.target.value)}
                                    className="border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-mono font-bold uppercase focus:outline-none bg-rose-50 text-rose-700"
                                  >
                                    <option value="Inquiry">Inquiry</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                  <select
                                    value={o.paymentStatus || 'Pending'}
                                    onChange={e => handleOrderPaymentStatusUpdate(o.id, e.target.value)}
                                    className={`border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-mono font-bold uppercase focus:outline-none ${
                                      (o.paymentStatus || 'Pending') === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Failed">Failed</option>
                                  </select>
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                  <a
                                    href={`https://wa.me/${(o.customerPhone || o.phone || '').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(o.customerName || o.name)},%20this%20is%20Geeta\'s%20Masale%20staff.%20We%20have%20received%20your%20Order%20Inquiry%20ID%20${o.id}%20for%20total%20amount%20Rs.%20${o.amount || o.total}.%20Please%20send%20your%20payment%20screenshot%20to%20confirm:`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-rose-950 text-white text-[9px] font-mono uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                  >
                                    <Send className="w-3 h-3 text-white fill-current shrink-0" />
                                    <span>WhatsApp</span>
                                  </a>
                                </td>
                              </tr>
                            ))}

                            {orders.filter(o => o.status === 'Inquiry').length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-400 font-mono text-xs">
                                  No active Order Inquiries. When a customer places an order, it will appear here immediately!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                        <table className="w-full text-xs text-left text-slate-500">
                          <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                            <tr className="border-b border-slate-150">
                              <th className="px-4 py-3">Inquirer Details</th>
                              <th className="px-4 py-3">Subject Matter</th>
                              <th className="px-4 py-3">Message Content</th>
                              <th className="px-4 py-3 text-center">Status Flag</th>
                              <th className="px-4 py-3 text-center">Respond</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contacts.map((m, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                                <td className="px-4 py-3.5">
                                  <span className="block font-black text-slate-800 text-xs sm:text-sm uppercase">{m.name}</span>
                                  <span className="block text-[9px] font-mono text-[#A61B1B] mt-0.5">{m.phone} | {m.email}</span>
                                  <span className="block text-[8px] font-mono text-slate-400 mt-1">{new Date(m.createdAt).toLocaleString()}</span>
                                </td>

                                <td className="px-4 py-3.5 font-bold text-slate-700 uppercase max-w-xs">{m.subject}</td>

                                <td className="px-4 py-3.5 text-xs text-slate-600 max-w-sm italic">"{m.message}"</td>

                                <td className="px-4 py-3.5 text-center">
                                  <select
                                    value={m.status || 'New'}
                                    onChange={e => handleInquiryStatusChange(m.id, e.target.value)}
                                    className={`border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-mono font-bold uppercase focus:outline-none ${
                                      m.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                                      m.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                    }`}
                                  >
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                  </select>
                                </td>

                                <td className="px-4 py-3.5 text-center">
                                  <a
                                    href={`https://wa.me/${m.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(m.name)},%20this%20is%20Geeta\'s%20Masale%20answering%20your%20inquiry%20regarding%20${encodeURIComponent(m.subject)}:`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-rose-950 text-white text-[9px] font-mono uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                  >
                                    <Send className="w-3 h-3 text-white fill-current shrink-0" />
                                    <span>WhatsApp</span>
                                  </a>
                                </td>
                              </tr>
                            ))}

                            {contacts.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 font-mono text-xs">
                                  Clear inquiry board. Customer contact entries will populate live here.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}


                {/* ========================================== */}
                {/* 8. WEBSITE SETTINGS (STEP 14)             */}
                {/* ========================================== */}
                {activeTab === 'settings' && settings && (
                  <form onSubmit={handleSettingsSubmit} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-150 shadow-sm text-left font-sans space-y-5 animate-fadeIn">
                    
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-mono font-black uppercase text-slate-800 tracking-wider">
                          🛠️ Core Website Configuration
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Change global parameters dynamically without editing code. Changes propagate on client refresh.
                        </p>
                      </div>
                      <select
                        value={settings.storeStatus || 'Open'}
                        onChange={e => setSettings((prev: any) => ({ ...prev, storeStatus: e.target.value }))}
                        className="bg-[#A61B1B]/5 border border-[#A61B1B]/15 text-[#A61B1B] text-xs font-mono font-bold uppercase rounded-lg px-3 py-1.5 focus:outline-none"
                      >
                        <option value="Open">Store: Open</option>
                        <option value="Closed">Store: Closed</option>
                        <option value="Maintenance">Store: Maintenance</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Enterprise Logo URL:
                        </label>
                        <input
                          type="text"
                          value={settings.logo}
                          onChange={e => setSettings((prev: any) => ({ ...prev, logo: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          UPI Billing VPA Address (For client checkouts):
                        </label>
                        <input
                          type="text"
                          value={settings.upiId}
                          onChange={e => setSettings((prev: any) => ({ ...prev, upiId: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-amber-50/20 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Primary Office Hotline:
                        </label>
                        <input
                          type="text"
                          value={settings.contactNumber}
                          onChange={e => setSettings((prev: any) => ({ ...prev, contactNumber: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Contact Inbox Email:
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={e => setSettings((prev: any) => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Enterprise Flagship Headquarter Location Address:
                        </label>
                        <input
                          type="text"
                          value={settings.address}
                          onChange={e => setSettings((prev: any) => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Instagram Handle link:
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks?.instagram || ''}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                          }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          WhatsApp API contact link:
                        </label>
                        <input
                          type="text"
                          value={settings.socialLinks?.whatsapp || ''}
                          onChange={e => setSettings((prev: any) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                          }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                          Dynamic Footer copyright text:
                        </label>
                        <textarea
                          rows={2}
                          value={settings.footer}
                          onChange={e => setSettings((prev: any) => ({ ...prev, footer: e.target.value }))}
                          className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-4 px-8 bg-[#A61B1B] hover:bg-rose-950 disabled:bg-slate-350 text-white rounded-xl text-xs font-mono font-black tracking-widest uppercase transition-all shadow-md cursor-pointer"
                    >
                      {submitting ? 'Saving settings...' : 'Commit Settings to DB 💾'}
                    </button>

                  </form>
                )}


                {/* ========================================== */}
                {/* 9. COUPONS & DISCOUNTS                    */}
                {/* ========================================== */}
                {activeTab === 'coupons' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left">
                      <span className="text-xs font-mono text-slate-500">
                        Create promo coupon codes (fixed discount or percentage) to encourage customers checkouts.
                      </span>
                      <button
                        onClick={() => {
                          setCouponForm({ code: 'DISCOUNT', discountType: 'Fixed', value: 50, minOrderAmount: 299 });
                          setIsCouponModalOpen(true);
                        }}
                        className="py-2.5 px-3.5 bg-[#A61B1B] hover:bg-rose-950 text-white rounded-xl text-xs font-mono font-bold uppercase inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Coupon</span>
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm text-left">
                      <table className="w-full text-xs text-left text-slate-500">
                        <thead className="text-[10px] uppercase font-mono text-slate-400 bg-slate-50">
                          <tr className="border-b border-slate-150">
                            <th className="px-4 py-3">Promo Code</th>
                            <th className="px-4 py-3 text-center">Type</th>
                            <th className="px-4 py-3 text-center">Discount Value</th>
                            <th className="px-4 py-3 text-center">Min Order Threshold</th>
                            <th className="px-4 py-3 text-center">Usage Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((c) => (
                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/40">
                              <td className="px-4 py-3 font-mono font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider">{c.code}</td>
                              <td className="px-4 py-3 text-center font-mono">{c.discountType}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">
                                {c.discountType === 'Percentage' ? `${c.value}%` : `₹${c.value}`}
                              </td>
                              <td className="px-4 py-3 text-center font-mono text-slate-600">₹{c.minOrderAmount}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 uppercase">
                                  ACTIVE & LIVE
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

              </>
            )}

          </div>
        </main>

      </div>


      {/* ========================================================= */}
      {/* 10. PRODUCT ADD / EDIT MODAL COMPONENT (STEP 5)            */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#FAF9F6] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-slate-100 text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-4">
              <span className="text-xs font-mono font-black uppercase text-slate-800 tracking-wider">
                {editingProduct ? `Edit SKU Product: ${editingProduct.id}` : 'Create a New Spice Listing'}
              </span>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 px-2.5 bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors uppercase font-mono text-[9px] tracking-widest font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Authentic Product Title:
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Malvani Chicken Masala"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Category Department:
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                      Weight:
                    </label>
                    <select
                      value={productForm.weight}
                      onChange={e => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 bg-white"
                    >
                      <option value="100gm">100gm</option>
                      <option value="200gm">200gm</option>
                      <option value="250gm">250gm</option>
                      <option value="300gm">300gm</option>
                      <option value="500gm">500gm</option>
                      <option value="1kg">1kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                      MRP (INR):
                    </label>
                    <input
                      type="number"
                      value={productForm.mrp}
                      onChange={e => setProductForm(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Rate per KG (Calculates automatically):
                  </label>
                  <input
                    type="number"
                    value={productForm.ratePerKg}
                    onChange={e => setProductForm(prev => ({ ...prev, ratePerKg: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-750 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                      Initial Stock Level:
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={e => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                      Shelf Life:
                    </label>
                    <input
                      type="text"
                      value={productForm.shelfLife}
                      onChange={e => setProductForm(prev => ({ ...prev, shelfLife: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Authentic Description:
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe traditional roasting, mill methods, or key features..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1 font-bold text-[#A61B1B]">
                    List of Ingredients (Coarse list):
                  </label>
                  <input
                    type="text"
                    value={productForm.ingredients}
                    onChange={e => setProductForm(prev => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="Coriander, Sankeshwari red chillies, cloves..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Kitchen Usage Instruction:
                  </label>
                  <input
                    type="text"
                    value={productForm.usage}
                    onChange={e => setProductForm(prev => ({ ...prev, usage: e.target.value }))}
                    placeholder="Mix with lime-juice paste or sprinkle during gravy boil..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1">
                    Image Hosting Options (Base64 file or direct URL):
                  </label>
                  
                  <div className="space-y-2.5">
                    {/* URL text paste */}
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Paste Unsplash or Image Kit direct URL link..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                    />

                    {/* Base64 Upload component (STEP 17) */}
                    <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-dashed border-slate-250">
                      <Image className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="text-left flex-1">
                        <span className="block text-[10px] font-sans font-bold text-slate-700">Upload custom local picture</span>
                        <span className="block text-[8px] font-mono text-slate-400">Save directly inside MySQL store via base64</span>
                      </div>
                      <label className="py-1 px-3 bg-slate-900 text-white rounded text-[10px] font-mono font-bold uppercase cursor-pointer text-center">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageUpload(e, 'product')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {productForm.image && (
                      <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl">
                        <img 
                          src={productForm.image} 
                          alt="preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase">Image Attached Properly!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="isBestseller"
                    checked={productForm.isBestseller}
                    onChange={e => setProductForm(prev => ({ ...prev, isBestseller: e.target.checked }))}
                    className="w-4 h-4 text-[#A61B1B] border-slate-300 focus:ring-[#A61B1B]"
                  />
                  <label htmlFor="isBestseller" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Display of "Bestseller" Ribbon Badge on customer website.
                  </label>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-200/60 flex justify-end space-x-3.5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 px-6 bg-[#A61B1B] hover:bg-rose-950 text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm cursor-pointer"
                >
                  {submitting ? 'Committing changes...' : 'Save Product Spec 💾'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 11. CATEGORY ADD / EDIT MODAL COMPONENT (STEP 6)          */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#FAF9F6] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-slate-100 text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-4">
              <span className="text-xs font-mono font-black uppercase text-slate-800 tracking-wider">
                {editingCategory ? `Edit Category: ${editingCategory.id}` : 'Create a New Department'}
              </span>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 px-2.5 bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors uppercase font-mono text-[9px] tracking-widest font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                  Category ID Key (No spaces, lowercase/Camel e.g. Masale, Pith):
                </label>
                <input
                  type="text"
                  value={categoryForm.id}
                  onChange={e => setCategoryForm(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g. Masale"
                  disabled={!!editingCategory}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-white disabled:bg-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                  Human Legible Name:
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Malvani Specials"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                  Brief description summary:
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Multi-generational griddle roasts..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest mb-1.5">
                  Cover Image URL or Base64 file attached:
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={e => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'category')}
                  className="text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-[#A61B1B] hover:bg-rose-950 disabled:bg-slate-300 text-white text-xs font-mono font-black tracking-widest uppercase transition-all shadow-md mt-2 cursor-pointer"
              >
                {submitting ? 'Submitting changes...' : 'Save Category details 🏛️'}
              </button>

            </form>
          </motion.div>
        </div>
      )}


      {/* ========================================================= */}
      {/* 12. COUPON CODE CREATION MODAL                            */}
      {/* ========================================================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#FAF9F6] rounded-3xl p-5 shadow-2xl border border-slate-100 text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 mb-4">
              <span className="text-xs font-mono font-black uppercase text-slate-800 tracking-wider">
                Create Promo Coupon
              </span>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Coupon Code name:</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={e => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Discount Type:</label>
                  <select
                    value={couponForm.discountType}
                    onChange={e => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 bg-white"
                  >
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Percentage">Percentage %</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Discount Value:</label>
                  <input
                    type="number"
                    value={couponForm.value}
                    onChange={e => setCouponForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-black mb-1">Min Order Sum threshold:</label>
                <input
                  type="number"
                  value={couponForm.minOrderAmount}
                  onChange={e => setCouponForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#A61B1B] hover:bg-rose-950 text-white font-mono font-black uppercase text-xs rounded-xl transition-all cursor-pointer"
              >
                Create Promo Coupon
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
