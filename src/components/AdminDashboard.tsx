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
    XCircle, Filter, Tag, Image, CheckCircle, Store, Send,
    Phone, MessageCircle, MoreVertical, ChevronLeft, ChevronRight, Download, Printer, FileText
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
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortByFilter, setSortByFilter] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
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
              const [orderSnap, prodSnap] = await Promise.all([
                getDocs(collection(db, 'orders')),
                getDocs(collection(db, 'products'))
              ]);
              setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt)));
              setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
          const [orderData, prodData] = await Promise.all([
            safeFetchJson('/api/admin/orders', { headers }),
            safeFetchJson('/api/admin/products', { headers }).catch(() => [])
          ]);
          setOrders(orderData);
          if (prodData && prodData.length) {
            setProducts(prodData);
          }
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

    const handleExportOrdersCSV = () => {
      if (orders.length === 0) {
        alert("No orders to export.");
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Order ID,Date,Customer Name,Phone,Email,Address,Items Count,Total Amount,Payment Method,Payment Status,Status,Tracking Number\n";
      
      orders.forEach(o => {
        const itemsCount = o.items?.reduce((sum: number, it: any) => sum + it.quantity, 0) || 0;
        const cleanAddress = (o.customerAddress || o.address || '').replace(/"/g, '""');
        const row = [
          o.id,
          o.createdAt,
          o.customerName || o.name || '',
          o.customerPhone || o.phone || '',
          o.customerEmail || o.email || '',
          `"${cleanAddress}"`,
          itemsCount,
          o.amount || o.total || 0,
          o.paymentMethod || o.paymentType || '',
          o.paymentStatus || 'Pending',
          o.status || 'Pending',
          o.trackingNumber || ''
        ].join(",");
        csvContent += row + "\r\n";
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Orders exported successfully as CSV!");
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
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#FAF9F6] flex items-center justify-center p-0">
        
        {/* Toast Alert */}
        {successToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white max-w-md px-6 py-3.5 rounded-full shadow-2xl flex items-center space-x-2.5 animate-bounce">
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-xs font-mono font-black tracking-wider uppercase text-white">{successToast}</span>
          </div>
        )}

        <div className="w-full h-full bg-[#FAF9F6] overflow-hidden flex flex-col lg:flex-row">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800">
            
            {/* Header branding logo */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex flex-col items-start justify-center space-y-0.5">
                <span className="block text-base font-sans font-bold text-white tracking-wide leading-tight">
                  Geeta’s Masalas
                </span>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Orders Console
                </span>
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

            {/* New Order Button */}
            <div className="px-3 pb-4 shrink-0">
              <button
                onClick={() => {
                  alert("To place a new order, please use the main store frontend by adding items to the cart and clicking 'Confirm Order'. Direct admin order creation will be available in the next console update.");
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#A61B1B] text-white hover:bg-[#851414] rounded-xl text-xs font-sans font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white shrink-0" />
                <span>New Order</span>
              </button>
            </div>

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
            <header className="h-16 border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white shadow-sm">
              
              <div className="flex items-center space-x-3">
                <span className="text-lg font-sans font-extrabold text-slate-800 tracking-tight">
                  {activeTab === 'orders' ? 'Orders Console' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Console`}
                </span>
                <span className="hidden md:inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#EBFDFB] text-[#1E6B65] border border-[#C6F7F2] uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B65] animate-pulse"></span>
                  <span>Production Store Synced</span>
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                {/* Reset live tab trigger */}
                <button
                  onClick={loadDataForTab}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-xs font-sans font-bold flex items-center space-x-1.5 cursor-pointer"
                  title="Sync dynamic database states"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh Data</span>
                </button>

                {activeTab === 'orders' && (
                  <button
                    onClick={handleExportOrdersCSV}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-xs font-sans font-bold flex items-center space-x-1.5 cursor-pointer"
                    title="Export Orders list as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export Orders</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex items-center space-x-1.5 p-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-rose-950 text-xs font-sans font-bold cursor-pointer transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Back to Shop</span>
                </button>

                {/* Profile Circle */}
                <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden bg-slate-100 hidden sm:block shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
                    alt="Staff Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
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
                    <div className="space-y-6 animate-fadeIn text-left">
                      
                      {/* Search & Filters Console */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <div>
                          <span className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            Search Console
                          </span>
                          <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={orderSearch}
                              onChange={e => {
                                setOrderSearch(e.target.value);
                                setCurrentPage(1);
                              }}
                              placeholder="Search by order number, customer name, phone number or item"
                              className="pl-10 pr-4 py-3 w-full rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B] placeholder-slate-400"
                            />
                          </div>
                        </div>

                        {/* Dropdown filters grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                          <div>
                            <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              Order Status
                            </label>
                            <select
                              value={orderStatusFilter}
                              onChange={e => {
                                setOrderStatusFilter(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                            >
                              <option value="all">All Statuses</option>
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              Payment
                            </label>
                            <select
                              value={paymentFilter}
                              onChange={e => {
                                setPaymentFilter(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                            >
                              <option value="all">All Payments</option>
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              Date Range
                            </label>
                            <select
                              value={dateFilter}
                              onChange={e => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                            >
                              <option value="all">All Time</option>
                              <option value="today">Today</option>
                              <option value="7days">Last 7 Days</option>
                              <option value="30days">Last 30 Days</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              Sort By
                            </label>
                            <select
                              value={sortByFilter}
                              onChange={e => {
                                setSortByFilter(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                            >
                              <option value="newest">Newest First</option>
                              <option value="oldest">Oldest First</option>
                              <option value="highest">Highest Value</option>
                              <option value="lowest">Lowest Value</option>
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              setOrderSearch('');
                              setOrderStatusFilter('all');
                              setPaymentFilter('all');
                              setDateFilter('all');
                              setSortByFilter('newest');
                              setCurrentPage(1);
                            }}
                            className="w-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl py-2.5 text-xs font-sans font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer h-[38px] lg:mb-0.5"
                          >
                            <X className="w-3.5 h-3.5 shrink-0" />
                            <span>Clear Filters</span>
                          </button>
                        </div>
                      </div>

                      {/* Orders Book List Area */}
                      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm animate-fadeIn">
                        <div className="overflow-x-auto">
                          <div className="min-w-[1000px] w-full">
                            {/* Table Headers */}
                            <div className="grid grid-cols-12 bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest text-left">
                              <div className="col-span-2">Order ID & Date</div>
                              <div className="col-span-2">Customer & City</div>
                              <div className="col-span-2">Contact</div>
                              <div className="col-span-3">Items Summary</div>
                              <div className="col-span-1.5">Payment Status</div>
                              <div className="col-span-1.5 text-right pr-6">Status</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-slate-100">
                              {(() => {
                                // Apply nested filtering and sorting
                                const filteredOrdersList = orders
                                  .filter(o => {
                                    if (!orderSearch) return true;
                                    const term = orderSearch.toLowerCase();
                                    const idMatch = (o.id || '').toLowerCase().includes(term);
                                    const nameMatch = (o.customerName || o.name || '').toLowerCase().includes(term);
                                    const phoneMatch = (o.customerPhone || o.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
                                    const emailMatch = (o.customerEmail || o.email || '').toLowerCase().includes(term);
                                    const itemMatch = o.items?.some((it: any) => (it.productName || '').toLowerCase().includes(term)) || false;
                                    return idMatch || nameMatch || phoneMatch || emailMatch || itemMatch;
                                  })
                                  .filter(o => {
                                    if (orderStatusFilter === 'all') return true;
                                    const status = (o.status || '').toLowerCase();
                                    const filter = orderStatusFilter.toLowerCase();
                                    if (filter === 'pending') return status === 'pending' || status === 'inquiry';
                                    if (filter === 'shipped') return status === 'shipped' || status === 'dispatched';
                                    return status === filter;
                                  })
                                  .filter(o => {
                                    if (paymentFilter === 'all') return true;
                                    const payStatus = o.paymentStatus || 'Pending';
                                    return payStatus.toLowerCase() === paymentFilter.toLowerCase();
                                  })
                                  .filter(o => {
                                    if (dateFilter === 'all') return true;
                                    const orderDate = new Date(o.createdAt);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    
                                    if (dateFilter === 'today') {
                                      return orderDate.toDateString() === now.toDateString();
                                    }
                                    if (dateFilter === '7days') {
                                      return diffDays <= 7;
                                    }
                                    if (dateFilter === '30days') {
                                      return diffDays <= 30;
                                    }
                                    return true;
                                  })
                                  .sort((a, b) => {
                                    const amtA = Number(a.amount || a.total || 0);
                                    const amtB = Number(b.amount || b.total || 0);
                                    if (sortByFilter === 'highest') return amtB - amtA;
                                    if (sortByFilter === 'lowest') return amtA - amtB;
                                    
                                    const dateA = new Date(a.createdAt || 0).getTime();
                                    const dateB = new Date(b.createdAt || 0).getTime();
                                    if (sortByFilter === 'oldest') return dateA - dateB;
                                    return dateB - dateA; // newest default
                                  });

                                const totalFiltered = filteredOrdersList.length;
                                const lastIdx = currentPage * rowsPerPage;
                                const firstIdx = lastIdx - rowsPerPage;
                                const pageItems = filteredOrdersList.slice(firstIdx, lastIdx);

                                if (totalFiltered === 0) {
                                  return (
                                    <div className="p-16 text-center text-slate-400 font-sans">
                                      <p className="text-sm font-semibold text-slate-600">No orders matched current console filter criteria.</p>
                                      <p className="text-[11px] text-slate-400 mt-1">Try modifying your search console terms or active state filters.</p>
                                    </div>
                                  );
                                }

                                return pageItems.map((o) => {
                                  // Formatting helper functions
                                  const formattedId = (() => {
                                    if (!o.id) return 'ORD-UNKNOWN';
                                    if (o.id.startsWith('order_')) {
                                      const d = new Date(o.createdAt || Date.now());
                                      const day = String(d.getDate()).padStart(2, '0');
                                      const month = String(d.getMonth() + 1).padStart(2, '0');
                                      const year = String(d.getFullYear()).slice(-2);
                                      const suffix = o.id.slice(-3);
                                      return `ORD-${day}_${month}_${year}-${suffix}`;
                                    }
                                    return o.id;
                                  })();

                                  const formattedDate = (() => {
                                    try {
                                      const d = new Date(o.createdAt);
                                      const day = d.getDate();
                                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                      const month = monthNames[d.getMonth()];
                                      const year = d.getFullYear();
                                      const hours = String(d.getHours()).padStart(2, '0');
                                      const minutes = String(d.getMinutes()).padStart(2, '0');
                                      return `${day} ${month} ${year} • ${hours}:${minutes}`;
                                    } catch(e) {
                                      return o.createdAt;
                                    }
                                  })();

                                  const formattedCity = (() => {
                                    const addr = o.customerAddress || o.address || '';
                                    if (!addr) return 'Unknown City';
                                    const parts = addr.split(',');
                                    if (parts.length >= 2) {
                                      const city = parts[parts.length - 2].trim();
                                      const statePart = parts[parts.length - 1].trim();
                                      const stateClean = statePart.replace(/\d+/g, '').trim();
                                      return `${city}, ${stateClean}`;
                                    }
                                    return addr.length > 22 ? addr.slice(0, 22) + '...' : addr;
                                  })();

                                  // Helper to find the matching product image
                                  const getProductImg = (productId: string, productName: string) => {
                                    const p = products.find(x => x.id === productId || x.name === productName);
                                    if (p && p.image) return p.image;
                                    const nameLower = productName.toLowerCase();
                                    if (nameLower.includes('malvani')) return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=100&auto=format&fit=crop&q=60';
                                    if (nameLower.includes('garam')) return 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=100&auto=format&fit=crop&q=60';
                                    if (nameLower.includes('biryani')) return 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=100&auto=format&fit=crop&q=60';
                                    return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=100&auto=format&fit=crop&q=60';
                                  };

                                  const statusUpper = (o.status || 'Pending').toUpperCase();

                                  return (
                                    <div key={o.id} className="grid grid-cols-12 px-6 py-4.5 items-center hover:bg-slate-50/50 transition-colors text-left text-xs text-slate-700 relative">
                                      {/* Order ID & Date */}
                                      <div className="col-span-2 space-y-0.5">
                                        <span className="font-sans font-extrabold text-[#A61B1B] block truncate" title={o.id}>
                                          {formattedId}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 font-mono font-medium whitespace-nowrap">
                                          {formattedDate}
                                        </span>
                                      </div>

                                      {/* Customer & City */}
                                      <div className="col-span-2 min-w-0 pr-2">
                                        <span className="block font-sans font-semibold text-slate-800 truncate" title={o.customerName || o.name}>
                                          {o.customerName || o.name || 'Anonymous'}
                                        </span>
                                        <span className="block text-[10px] text-slate-500 font-medium truncate" title={o.customerAddress || o.address}>
                                          {formattedCity}
                                        </span>
                                      </div>

                                      {/* Contact Coordinates */}
                                      <div className="col-span-2 min-w-0">
                                        {(o.customerPhone || o.phone) ? (
                                          <div className="flex items-center space-x-1">
                                            <span className="font-sans font-medium text-slate-700 truncate" title={o.customerPhone || o.phone}>
                                              {o.customerPhone || o.phone}
                                            </span>
                                            <div className="flex items-center space-x-0.5 shrink-0">
                                              <a
                                                href={`https://wa.me/${(o.customerPhone || o.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${(o.customerName || o.name)}, this is Geeta's Masale. We have received your order inquiry ID ${o.id}.`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1 rounded-full text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Open WhatsApp chat"
                                              >
                                                <MessageCircle className="w-4 h-4 shrink-0" />
                                              </a>
                                              <a
                                                href={`tel:${o.customerPhone || o.phone}`}
                                                className="p-1 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Call customer"
                                              >
                                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                              </a>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400 italic">No phone</span>
                                        )}
                                      </div>

                                      {/* Items Summary */}
                                      <div className="col-span-3 min-w-0 pr-2">
                                        {o.items && o.items.length > 0 ? (
                                          <div className="flex items-center space-x-2.5">
                                            <div className="relative shrink-0 w-9 h-9 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                                              <img
                                                src={getProductImg(o.items[0].productId, o.items[0].productName)}
                                                alt={o.items[0].productName}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                              />
                                              {o.items.length > 1 && (
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-slate-900/80 text-[8px] font-mono font-black text-white px-1 py-0.5 rounded-tl-md">
                                                  +{o.items.length - 1}
                                                </div>
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-xs font-sans font-semibold text-slate-800 truncate" title={o.items[0].productName}>
                                                {o.items[0].productName} {o.items[0].weight ? `(${o.items[0].weight})` : ''} x {o.items[0].quantity}
                                              </p>
                                              {o.items.length > 1 && (
                                                <p className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">
                                                  + {o.items.length - 1} more masala items
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-slate-400 italic">No Items listed</span>
                                        )}
                                      </div>

                                      {/* Payment Status & Amount */}
                                      <div className="col-span-1.5 min-w-0">
                                        <div className="flex flex-col">
                                          <span className="font-mono font-black text-slate-800 text-xs">
                                            ₹{Number(o.amount || o.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </span>
                                          <span className={`text-[9px] font-mono font-black uppercase tracking-wider mt-0.5 ${
                                            (o.paymentStatus === 'Paid') ? 'text-emerald-600' : 'text-amber-500'
                                          }`}>
                                            {o.paymentStatus || 'Pending'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Status Badge & Actions */}
                                      <div className="col-span-1.5 flex items-center justify-end space-x-2 pr-2">
                                        <div>
                                          {(() => {
                                            const s = statusUpper;
                                            if (s === 'SHIPPED' || s === 'DISPATCHED') {
                                              return (
                                                <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                  SHIPPED
                                                </span>
                                              );
                                            }
                                            if (s === 'PROCESSING') {
                                              return (
                                                <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                                  PROCESSING
                                                </span>
                                              );
                                            }
                                            if (s === 'CONFIRMED') {
                                              return (
                                                <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                                                  CONFIRMED
                                                </span>
                                              );
                                            }
                                            if (s === 'DELIVERED') {
                                              return (
                                                <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                  DELIVERED
                                                </span>
                                              );
                                            }
                                            if (s === 'CANCELLED') {
                                              return (
                                                <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                                                  CANCELLED
                                                </span>
                                              );
                                            }
                                            return (
                                              <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                                PENDING
                                              </span>
                                            );
                                          })()}
                                        </div>

                                        {/* Action Dropdown Menu Trigger */}
                                        <div className="relative shrink-0">
                                          <button
                                            onClick={() => setOpenMenuOrderId(openMenuOrderId === o.id ? null : o.id)}
                                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer"
                                            title="Open order actions"
                                          >
                                            <MoreVertical className="w-4 h-4 shrink-0" />
                                          </button>

                                          {/* Floating Action Menu dropdown */}
                                          {openMenuOrderId === o.id && (
                                            <>
                                              <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setOpenMenuOrderId(null)}
                                              />
                                              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 z-20 py-1.5 overflow-hidden font-sans">
                                                <div className="px-3 py-1.5 border-b border-slate-100 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                                  Console Management
                                                </div>
                                                
                                                {/* Shipping status transitions */}
                                                <div className="p-1 space-y-0.5">
                                                  <span className="block px-2 py-1 text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                                    Shipment Status
                                                  </span>
                                                  {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                                                    <button
                                                      key={st}
                                                      onClick={() => {
                                                        handleOrderStatusUpdate(o.id, st);
                                                        setOpenMenuOrderId(null);
                                                      }}
                                                      className={`w-full text-left px-2 py-1 text-[11px] rounded hover:bg-slate-50 flex items-center justify-between ${
                                                        (o.status || 'Pending').toLowerCase() === st.toLowerCase() ? 'text-[#A61B1B] font-bold bg-rose-50/50' : 'text-slate-600'
                                                      }`}
                                                    >
                                                      <span>{st}</span>
                                                      {(o.status || 'Pending').toLowerCase() === st.toLowerCase() && <Check className="w-3 h-3 text-[#A61B1B]" />}
                                                    </button>
                                                  ))}
                                                </div>

                                                <div className="border-t border-slate-100 my-1"></div>

                                                {/* Payment status transitions */}
                                                <div className="p-1 space-y-0.5">
                                                  <span className="block px-2 py-1 text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                                    Payment Status
                                                  </span>
                                                  {['Pending', 'Paid', 'Failed'].map((pay) => (
                                                    <button
                                                      key={pay}
                                                      onClick={() => {
                                                        handleOrderPaymentStatusUpdate(o.id, pay);
                                                        setOpenMenuOrderId(null);
                                                      }}
                                                      className={`w-full text-left px-2 py-1 text-[11px] rounded hover:bg-slate-50 flex items-center justify-between ${
                                                        (o.paymentStatus || 'Pending').toLowerCase() === pay.toLowerCase() ? 'text-[#E86A17] font-bold bg-orange-50/30' : 'text-slate-600'
                                                      }`}
                                                    >
                                                      <span>{pay}</span>
                                                      {(o.paymentStatus || 'Pending').toLowerCase() === pay.toLowerCase() && <Check className="w-3 h-3 text-[#E86A17]" />}
                                                    </button>
                                                  ))}
                                                </div>

                                                <div className="border-t border-slate-100 my-1"></div>

                                                {/* Other logistics */}
                                                <button
                                                  onClick={() => {
                                                    setOpenMenuOrderId(null);
                                                    const val = prompt('Enter Courier tracking registration ID (e.g., Delhivery / DTDC):', o.trackingNumber || '');
                                                    if (val !== null) handleOrderAddTracking(o.id, val);
                                                  }}
                                                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium"
                                                >
                                                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                                                  <span>{o.trackingNumber ? 'Modify Tracking ID' : 'Add Tracking ID'}</span>
                                                </button>

                                                <button
                                                  onClick={() => {
                                                    setOpenMenuOrderId(null);
                                                    setSelectedOrderDetails(o);
                                                  }}
                                                  className="w-full text-left px-3 py-2 text-xs text-[#A61B1B] hover:bg-rose-50/50 flex items-center space-x-2 font-bold"
                                                >
                                                  <FileText className="w-3.5 h-3.5 text-[#A61B1B]" />
                                                  <span>View Full Invoice</span>
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Paginated rows pagination bar */}
                        {orders.length > 0 && (
                          <div className="bg-slate-50/50 px-6 py-4.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {(() => {
                              // Perform same filtering to get counts
                              const filteredOrdersCount = orders
                                .filter(o => {
                                  if (!orderSearch) return true;
                                  const term = orderSearch.toLowerCase();
                                  const idMatch = (o.id || '').toLowerCase().includes(term);
                                  const nameMatch = (o.customerName || o.name || '').toLowerCase().includes(term);
                                  const phoneMatch = (o.customerPhone || o.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
                                  const emailMatch = (o.customerEmail || o.email || '').toLowerCase().includes(term);
                                  const itemMatch = o.items?.some((it: any) => (it.productName || '').toLowerCase().includes(term)) || false;
                                  return idMatch || nameMatch || phoneMatch || emailMatch || itemMatch;
                                })
                                .filter(o => {
                                  if (orderStatusFilter === 'all') return true;
                                  const status = (o.status || '').toLowerCase();
                                  const filter = orderStatusFilter.toLowerCase();
                                  if (filter === 'pending') return status === 'pending' || status === 'inquiry';
                                  if (filter === 'shipped') return status === 'shipped' || status === 'dispatched';
                                  return status === filter;
                                })
                                .filter(o => {
                                  if (paymentFilter === 'all') return true;
                                  const payStatus = o.paymentStatus || 'Pending';
                                  return payStatus.toLowerCase() === paymentFilter.toLowerCase();
                                })
                                .filter(o => {
                                  if (dateFilter === 'all') return true;
                                  const orderDate = new Date(o.createdAt);
                                  const now = new Date();
                                  const diffTime = Math.abs(now.getTime() - orderDate.getTime());
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  
                                  if (dateFilter === 'today') return orderDate.toDateString() === now.toDateString();
                                  if (dateFilter === '7days') return diffDays <= 7;
                                  if (dateFilter === '30days') return diffDays <= 30;
                                  return true;
                                });

                              const totalCount = filteredOrdersCount.length;
                              const startRow = totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
                              const endRow = Math.min(currentPage * rowsPerPage, totalCount);
                              const totalPagesCount = Math.ceil(totalCount / rowsPerPage) || 1;

                              // Safe page bounds correction
                              if (currentPage > totalPagesCount && totalPagesCount > 0) {
                                setCurrentPage(totalPagesCount);
                              }

                              const getPageItemsList = () => {
                                const pagesList = [];
                                if (totalPagesCount <= 5) {
                                  for (let i = 1; i <= totalPagesCount; i++) pagesList.push(i);
                                } else {
                                  if (currentPage <= 3) {
                                    pagesList.push(1, 2, 3, '...', totalPagesCount);
                                  } else if (currentPage >= totalPagesCount - 2) {
                                    pagesList.push(1, '...', totalPagesCount - 2, totalPagesCount - 1, totalPagesCount);
                                  } else {
                                    pagesList.push(1, '...', currentPage, '...', totalPagesCount);
                                  }
                                }
                                return pagesList;
                              };

                              return (
                                <>
                                  <div className="text-xs font-sans text-slate-500 font-medium">
                                    Showing <span className="font-bold text-slate-700">{startRow}</span> to <span className="font-bold text-slate-700">{endRow}</span> of <span className="font-bold text-slate-700">{totalCount}</span> results
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4">
                                    {/* Rows Per Page */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                                        Rows Per Page:
                                      </span>
                                      <select
                                        value={rowsPerPage}
                                        onChange={e => {
                                          setRowsPerPage(Number(e.target.value));
                                          setCurrentPage(1);
                                        }}
                                        className="bg-transparent border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                                      >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                      </select>
                                    </div>

                                    {/* Page Number list */}
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer`}
                                        title="Previous page"
                                      >
                                        <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                                      </button>

                                      {getPageItemsList().map((p, idx) => {
                                        if (p === '...') {
                                          return (
                                            <span key={`dots-${idx}`} className="px-2 py-1 text-xs font-mono font-bold text-slate-400">
                                              ...
                                            </span>
                                          );
                                        }
                                        return (
                                          <button
                                            key={`page-${p}`}
                                            onClick={() => setCurrentPage(Number(p))}
                                            className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                                              currentPage === p
                                                ? 'bg-[#A61B1B] text-white border-[#A61B1B] font-black'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                          >
                                            {p}
                                          </button>
                                        );
                                      })}

                                      <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount))}
                                        disabled={currentPage === totalPagesCount}
                                        className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer`}
                                        title="Next page"
                                      >
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
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

        {/* ========================================== */}
        {/* INVOICE DETAILS MODAL                      */}
        {/* ========================================== */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col font-sans text-left animate-fadeIn">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#A61B1B]" />
                  <div>
                    <h3 className="text-sm font-sans font-bold text-slate-800">
                      Order Invoice Details
                    </h3>
                    <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      {selectedOrderDetails.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                {/* Coordinates & Logistics row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-5">
                  <div className="space-y-2 text-left">
                    <span className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                      Customer & Delivery Address
                    </span>
                    <p className="font-extrabold text-slate-800 text-sm">{selectedOrderDetails.customerName || selectedOrderDetails.name}</p>
                    <p className="text-slate-600 font-medium leading-relaxed">{selectedOrderDetails.customerAddress || selectedOrderDetails.address}</p>
                    <p className="text-slate-450 font-mono mt-1">
                      {selectedOrderDetails.customerPhone || selectedOrderDetails.phone} | {selectedOrderDetails.customerEmail || selectedOrderDetails.email || 'No email registered'}
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div>
                      <span className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">
                        Invoicing Details
                      </span>
                      <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                        <span>Payment Method: {selectedOrderDetails.paymentType || selectedOrderDetails.paymentMethod || 'UPI'}</span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Invoiced total amount: <span className="font-mono font-extrabold text-[#A61B1B]">₹{selectedOrderDetails.amount || selectedOrderDetails.total}</span>
                      </p>
                      <p className="text-emerald-600 font-medium mt-0.5">
                        Paid transaction: <span className="font-mono font-bold">₹{selectedOrderDetails.paidAmount || 0}</span>
                      </p>
                    </div>

                    <div>
                      <span className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Logistics Courier Tracking
                      </span>
                      {selectedOrderDetails.trackingNumber ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                            {selectedOrderDetails.trackingNumber}
                          </span>
                          <button
                            onClick={() => {
                              const next = prompt('Modify Tracking ID:', selectedOrderDetails.trackingNumber);
                              if (next !== null) {
                                handleOrderAddTracking(selectedOrderDetails.id, next);
                                setSelectedOrderDetails(prev => ({ ...prev, trackingNumber: next }));
                              }
                            }}
                            className="text-[#A61B1B] hover:underline font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const val = prompt('Enter Courier tracking registration ID (e.g., Delhivery / DTDC):');
                            if (val) {
                              handleOrderAddTracking(selectedOrderDetails.id, val);
                              setSelectedOrderDetails(prev => ({ ...prev, trackingNumber: val }));
                            }
                          }}
                          className="py-1 px-2.5 border border-[#A61B1B]/15 text-[#A61B1B] hover:bg-[#A61B1B] hover:text-white rounded text-[10px] font-mono font-black uppercase transition-all inline-block cursor-pointer"
                        >
                          + Dispatch tracking ID
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3 text-left">
                  <span className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                    Items Checklist
                  </span>
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="grid grid-cols-12 px-4 py-2 text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider bg-slate-100/50 border-b border-slate-150">
                      <div className="col-span-6">Masala Item Name</div>
                      <div className="col-span-2 text-center">Weight</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                    </div>
                    <div className="divide-y divide-slate-150">
                      {selectedOrderDetails.items?.map((item: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-12 px-4 py-3 items-center text-slate-700 font-medium">
                          <div className="col-span-6 font-bold text-slate-800">
                            {item.productName}
                          </div>
                          <div className="col-span-2 text-center font-mono">
                            {item.weight || '250gm'}
                          </div>
                          <div className="col-span-2 text-center font-mono font-bold">
                            {item.quantity}
                          </div>
                          <div className="col-span-2 text-right font-mono font-extrabold text-slate-800">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-100/40 p-4 border-t border-slate-150 flex items-center justify-between text-xs font-sans font-bold text-slate-800">
                      <span>Total Invoice Value:</span>
                      <span className="font-mono text-[#A61B1B] text-sm font-black">
                        ₹{Number(selectedOrderDetails.amount || selectedOrderDetails.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="p-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-sans font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Print Invoice</span>
                </button>

                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-bold transition-all cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
