/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, LogIn } from 'lucide-react';
import FloatingSpices from './components/FloatingSpices';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductSection from './components/ProductSection';
import Heritage from './components/Heritage';
import RecipeSection from './components/RecipeSection';
import WhyChooseUs from './components/WhyChooseUs';
import Reviews from './components/Reviews';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import InquiryDrawer from './components/InquiryDrawer';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import MyAccountDashboard from './components/MyAccountDashboard';
import { useUser } from './context/UserContext';
import { Product } from './types';
import { PRODUCTS, CATEGORIES } from './data/storeData';
import { isFirebaseConfigured, db, seedDatabaseIfEmpty, isVercel } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function App() {
  const { user, profile, syncCartToFirestore } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [myAccountOpen, setMyAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inquiryBag, setInquiryBag] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const stored = localStorage.getItem('gm_guest_cart');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load initial cart from localStorage:', e);
    }
    return [];
  });
  const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false);
  const [showGoogleSuggestion, setShowGoogleSuggestion] = useState(false);

  // Full-stack dynamic data lists
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const checkIsAdmin = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase().replace(/\/$/, '');
    return path === '/admin' || hash === '#/admin' || hash === '#admin';
  };

  const [adminOpen, setAdminOpen] = useState(() => {
    const isAdmin = checkIsAdmin();
    console.log('[Routing] Initial adminOpen:', isAdmin, 'Path:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
    return isAdmin;
  });
  const [loading, setLoading] = useState(true);

  // Simple custom router for separate links
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdmin();
      console.log('[Routing] handleLocationChange adminOpen:', isAdmin, 'Path:', window.location.pathname, 'Hash:', window.location.hash);
      setAdminOpen(isAdmin);
    };

    // Run once on mount to align state
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    console.log('[Routing] Opening admin panel...');
    window.history.pushState(null, '', '/admin');
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    console.log('[Routing] Closing admin panel...');
    window.history.pushState(null, '', '/');
    setAdminOpen(false);
    setMyAccountOpen(false); // prevent fall-through to customer account portal
  };

  const fetchStoreData = async () => {
    try {
      if (isFirebaseConfigured && db) {
        try {
          // Auto seed if database collections are empty
          await seedDatabaseIfEmpty();

          // Fetch from Firestore
          const prodSnap = await getDocs(collection(db, 'products'));
          const catSnap = await getDocs(collection(db, 'categories'));

          const products = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          const categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          if (products.length > 0) {
            setProductsList(products);
          } else {
            setProductsList(PRODUCTS);
          }

          if (categories.length > 0) {
            setCategoriesList(categories);
          } else {
            setCategoriesList(CATEGORIES);
          }

          setLoading(false);
          return;
        } catch (firebaseErr) {
          console.error("Firebase fetch failed, falling back to local/API:", firebaseErr);
        }
      }

      if (isVercel) {
        setProductsList(PRODUCTS);
        setCategoriesList(CATEGORIES);
        setLoading(false);
        return;
      }

      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/categories').catch(() => null)
      ]);
      
      let gotProducts = false;
      let gotCategories = false;

      if (prodRes && prodRes.ok) {
        try {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            setProductsList(prodData);
            gotProducts = true;
          }
        } catch (err) {
          console.error("Error parsing products from API:", err);
        }
      }

      if (catRes && catRes.ok) {
        try {
          const catData = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategoriesList(catData);
            gotCategories = true;
          }
        } catch (err) {
          console.error("Error parsing categories from API:", err);
        }
      }

      // If API calls failed or returned empty (e.g. on Vercel), fall back to clean local storeData
      if (!gotProducts) {
        setProductsList(PRODUCTS);
      }
      if (!gotCategories) {
        setCategoriesList(CATEGORIES);
      }
    } catch (e) {
      console.error("Failed to load products/categories from express DB APIs, falling back to local:", e);
      setProductsList(PRODUCTS);
      setCategoriesList(CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [adminOpen]);

  // Load customer's cloud cart on successful login
  useEffect(() => {
    if (user && profile?.cart && productsList.length > 0) {
      const mappedCart = profile.cart
        .map((item) => {
          const prod = productsList.find((p) => p.id === item.productId);
          return prod ? { product: prod, quantity: item.quantity } : null;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
      
      const localCartSig = inquiryBag.map(item => `${item.product.id}:${item.quantity}`).join(',');
      const cloudCartSig = mappedCart.map(item => `${item.product.id}:${item.quantity}`).join(',');
      
      if (cloudCartSig !== localCartSig && mappedCart.length > 0) {
        setInquiryBag(mappedCart);
      }
    }
  }, [user, profile?.cart, productsList]);

  // Push local cart mutations to cloud Firestore securely OR save to localStorage for guests
  useEffect(() => {
    if (user && profile) {
      syncCartToFirestore(inquiryBag);
    } else {
      try {
        localStorage.setItem('gm_guest_cart', JSON.stringify(inquiryBag));
      } catch (e) {
        console.error('Failed to save guest cart to localStorage:', e);
      }
    }
  }, [inquiryBag, user]);

  // Google Sign-In Recommendation banner trigger on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('gm_suggestion_dismissed');
      if (!user && !dismissed) {
        setShowGoogleSuggestion(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user]);

  // Smooth scroll helper
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Synchronized category mapping
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    handleScrollToSection('products');
  };

  // Inquiry list controllers
  const handleAddToInquiry = (product: Product, quantity: number) => {
    setInquiryBag((prevBag) => {
      const existing = prevBag.find((item) => item.product.id === product.id);
      if (existing) {
        return prevBag.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevBag, { product, quantity }];
    });
    
    // Auto-open drawer when adding for premium visual feedback
    setInquiryDrawerOpen(true);
  };

  const handleRemoveInquiryItem = (productId: string) => {
    setInquiryBag((prevBag) => prevBag.filter((item) => item.product.id !== productId));
  };

  const handleUpdateInquiryItemQuantity = (productId: string, quantity: number) => {
    setInquiryBag((prevBag) =>
      prevBag.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Master WhatsApp Click actions
  const handleWhatsAppGeneralClick = () => {
    const textMsg = `Hello Geeta's Masale! I am visiting your brand website and would like to ask some questions regarding your traditional Malvani masalas and fresh grain flours. Please connect with me. Thank you!`;
    const url = `https://api.whatsapp.com/send?phone=917620428920&text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If Admin panel dashboard is activated, direct viewport to dashboard workspace
  if (adminOpen) {
    return <AdminDashboard onClose={handleCloseAdmin} />;
  }

  // If Customer My Account dashboard is active, render customer profile workspace
  if (myAccountOpen) {
    return (
      <MyAccountDashboard 
        onClose={() => setMyAccountOpen(false)}
        onOpenCart={() => {
          setMyAccountOpen(false);
          setInquiryDrawerOpen(true);
        }}
        onAddToCart={handleAddToInquiry}
      />
    );
  }

  return (
    <motion.div
      key="main-app-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="font-sans antialiased bg-[#FAF9F6] text-slate-900 selection:bg-[#A61B1B]/15 selection:text-[#A61B1B] min-h-screen relative overflow-x-hidden"
    >
      {/* Absolute Particle floating background layer */}
      <FloatingSpices />

      {/* Sticky Navigation Bar */}
      <Navbar
        onNavigate={handleScrollToSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inquiryCount={inquiryBag.reduce((total, item) => total + item.quantity, 0)}
        onOpenInquiry={() => setInquiryDrawerOpen(true)}
        onLoginClick={() => setAuthModalOpen(true)}
        onMyAccountClick={() => setMyAccountOpen(true)}
      />

      {/* Main view sections */}
      <Hero
        onExploreClick={() => handleScrollToSection('products')}
        onWhatsAppClick={handleWhatsAppGeneralClick}
        onSelectCategory={handleCategorySelection}
      />

      <ProductSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddToInquiry={handleAddToInquiry}
        inquiryList={inquiryBag}
        productsList={productsList}
        categoriesList={categoriesList}
      />

      <Heritage />

      <RecipeSection />

      <WhyChooseUs />

      <Reviews />

      <Gallery />

      <Contact />

      <Footer
        onNavigate={handleScrollToSection}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Shopping Inquiry side drawer */}
      <InquiryDrawer
        isOpen={inquiryDrawerOpen}
        onClose={() => setInquiryDrawerOpen(false)}
        inquiryList={inquiryBag}
        onRemoveItem={handleRemoveInquiryItem}
        onUpdateQuantity={handleUpdateInquiryItemQuantity}
        onClearCart={() => setInquiryBag([])}
      />

      {/* Customer Unified Auth Modal (Email/Password, Registration, Mobile OTP) */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={() => {
          // Open dashboard upon successful login/register
          setMyAccountOpen(true);
        }}
      />

      {/* Google Sign-in Suggestion Toast */}
      <AnimatePresence>
        {showGoogleSuggestion && !user && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(166,27,27,0.15)] border border-[#A61B1B]/10 p-5 flex flex-col space-y-3.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#A61B1B] shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-slate-900 leading-snug">
                    Namaste! Unlock Rewards
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Sign in with your Google account to get <span className="font-semibold text-amber-600">50 welcome points</span> & track orders!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGoogleSuggestion(false);
                  sessionStorage.setItem('gm_suggestion_dismissed', 'true');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1.5">
              <button
                onClick={async () => {
                  try {
                    setShowGoogleSuggestion(false);
                    setAuthModalOpen(true);
                  } catch (e) {
                    console.error("Google Sign-in failed:", e);
                  }
                }}
                className="flex-1 bg-[#A61B1B] hover:bg-[#8A1414] text-white py-2 px-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In Now</span>
              </button>
              <button
                onClick={() => {
                  setShowGoogleSuggestion(false);
                  sessionStorage.setItem('gm_suggestion_dismissed', 'true');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
