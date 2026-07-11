/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings,   
  LogOut, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Clock, 
  Gift, 
  Star, 
  CheckCircle, 
  Bell, 
  ChevronRight, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Home,
  Briefcase,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useUser, SavedAddress, Order, Review } from '../context/UserContext';
import { PRODUCTS, resolveProductImage } from '../data/storeData.ts';
import { Product } from '../types';

interface MyAccountDashboardProps {
  onClose: () => void;
  onOpenCart: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

type TabType = 'dashboard' | 'orders' | 'wishlist' | 'addresses' | 'profile' | 'reviews' | 'settings';

export default function MyAccountDashboard({ onClose, onOpenCart, onAddToCart }: MyAccountDashboardProps) {
  const { 
    profile, 
    orders, 
    reviews, 
    logout, 
    updateUserProfile, 
    changeUserPassword, 
    saveAddress, 
    deleteAddress,
    isDemoUser
  } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Profile forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Address forms
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrType, setAddrType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCityState, setAddrCityState] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  // Preference Settings form
  const [marketingPref, setMarketingPref] = useState(true);
  const [orderUpdatesPref, setOrderUpdatesPref] = useState(true);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Detailed selected order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load profile values on active profile tab
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setMarketingPref(profile.preferences?.marketing !== false);
      setOrderUpdatesPref(profile.preferences?.orderUpdates !== false);
    }
  }, [profile, activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (isDemoUser) {
      setPassError('Password updates are restricted for demo customer accounts.');
      return;
    }

    if (!newPass || !confirmNewPass) {
      setPassError('Please fill in password fields.');
      return;
    }

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setUpdatingPass(true);
    try {
      await changeUserPassword(newPass);
      setPassSuccess('Your password has been changed successfully.');
      setNewPass('');
      setConfirmNewPass('');
      setCurrentPass('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password. Re-authenticate and try again.');
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateUserProfile({
        preferences: {
          marketing: marketingPref,
          orderUpdates: orderUpdatesPref
        }
      });
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddressModal = (addr: SavedAddress | null = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrType(addr.type);
      setAddrName(addr.fullName);
      setAddrStreet(addr.streetAddress);
      setAddrLandmark(addr.landmark || '');
      setAddrCityState(addr.cityStatePincode);
      setAddrMobile(addr.mobile);
      setAddrDefault(addr.isDefault || false);
    } else {
      setEditingAddress(null);
      setAddrType('HOME');
      setAddrName(profile?.name || '');
      setAddrStreet('');
      setAddrLandmark('');
      setAddrCityState('');
      setAddrMobile(profile?.phone || '');
      setAddrDefault(profile?.addresses?.length === 0);
    }
    setAddrError(null);
    setAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);

    if (!addrName.trim() || !addrStreet.trim() || !addrCityState.trim() || !addrMobile.trim()) {
      setAddrError('Please fill in all required address fields.');
      return;
    }

    try {
      await saveAddress({
        id: editingAddress?.id,
        type: addrType,
        fullName: addrName.trim(),
        streetAddress: addrStreet.trim(),
        landmark: addrLandmark.trim(),
        cityStatePincode: addrCityState.trim(),
        mobile: addrMobile.trim(),
        isDefault: addrDefault
      });
      setAddressModalOpen(false);
    } catch (e: any) {
      setAddrError(e.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddressClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  // Find product helper
  const getProductById = (id: string): Product | undefined => {
    return PRODUCTS.find(p => p.id === id);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans flex flex-col pt-16 sm:pt-20">
      {/* Account Upper Banner */}
      <div className="bg-[#A61B1B] text-white py-8 sm:py-12 border-b border-amber-950/15 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Back to store"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-200 uppercase">
                  CUSTOMER ACCOUNT PORTAL
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Namaste, {profile?.name || 'Customer'}
                </h1>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  Manage your orders, synchronized cart, wishlist, and rewards
                </p>
              </div>
            </div>

            {/* Loyalty Card widget */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg max-w-xs w-full">
              <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-inner shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-black block">
                  GEETA'S LOYALTY POINTS
                </span>
                <span className="text-2xl font-black text-white tracking-wider">
                  {profile?.rewardPoints || 0}
                </span>
                <span className="text-[9px] text-white/70 block font-medium mt-0.5">
                  10 Points = ₹1.00 automatic discount at checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Dashboard Left Sidebar Tabs */}
          <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-4 h-fit space-y-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.015)]">
            <div className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 mb-2 block">
              Navigation Menu
            </div>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              <span>My Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className={`ml-auto text-[9.5px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-white text-slate-900' : 'bg-[#A61B1B]/10 text-[#A61B1B]'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('wishlist'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Wishlist</span>
              {profile?.wishlist && profile.wishlist.length > 0 && (
                <span className={`ml-auto text-[9.5px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === 'wishlist' ? 'bg-white text-slate-900' : 'bg-[#A61B1B]/10 text-[#A61B1B]'
                }`}>
                  {profile.wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('addresses'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Profile & Security</span>
            </button>

            <button
              onClick={() => { setActiveTab('reviews'); setSelectedOrder(null); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#A61B1B]'
              }`}
            >
              <Star className="w-4 h-4 shrink-0" />
              <span>Reviews & Ratings</span>
              {reviews.length > 0 && (
                <span className={`ml-auto text-[9.5px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === 'reviews' ? 'bg-white text-slate-900' : 'bg-[#A61B1B]/10 text-[#A61B1B]'
                }`}>
                  {reviews.length}
                </span>
              )}
            </button>

            <div className="border-t border-slate-100 my-4" />

            <button
              onClick={async () => {
                if (confirm('Are you sure you want to log out?')) {
                  await logout();
                  onClose();
                }
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-red-600 hover:bg-red-50 hover:text-red-700 transition-all flex items-center space-x-3 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Tab Views Panel Content Area */}
          <div className="lg:col-span-3">
            
            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* 3-Bento Grid Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Stat 1: Total Orders */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block">Total Orders</span>
                      <span className="text-3xl font-bold text-slate-950 block mt-1.5">{orders.length}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Stat 2: Active Wishlist Items */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block">Wishlisted Spices</span>
                      <span className="text-3xl font-bold text-slate-950 block mt-1.5">
                        {profile?.wishlist?.length || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-red-50 text-red-500">
                      <Heart className="w-6 h-6 fill-red-500/10" />
                    </div>
                  </div>

                  {/* Stat 3: Saved Addresses */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.012)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block">Saved Addresses</span>
                      <span className="text-3xl font-bold text-slate-950 block mt-1.5">
                        {profile?.addresses?.length || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-500">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Profile Overview & Loyalty explanation card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                  <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-4">
                    Account Overview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3.5">
                      <div className="flex items-center space-x-2.5 text-slate-600 text-xs">
                        <span className="w-24 text-slate-400 font-medium">Full Name:</span>
                        <span className="text-slate-800 font-bold">{profile?.name || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-slate-600 text-xs">
                        <span className="w-24 text-slate-400 font-medium">Email Address:</span>
                        <span className="text-slate-800 font-bold">{profile?.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-slate-600 text-xs">
                        <span className="w-24 text-slate-400 font-medium">Mobile:</span>
                        <span className="text-slate-800 font-bold">{profile?.phone || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#A61B1B]/5 border border-[#A61B1B]/10 flex flex-col justify-between">
                      <span className="text-xs font-bold text-[#A61B1B] flex items-center gap-1.5">
                        <Gift className="w-4 h-4" />
                        <span>Loyalty Points Benefits</span>
                      </span>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        Earn reward points on every single purchase! You get <strong className="text-slate-900">10% points cashback</strong> on your order values which can be easily used to claim instant discounts on your future orders.
                      </p>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="text-xs text-[#A61B1B] font-bold mt-3 text-left hover:underline cursor-pointer"
                      >
                        Edit Profile Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Orders section */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900">
                      Recent Orders
                    </h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#A61B1B] font-bold hover:underline cursor-pointer"
                    >
                      View All Orders
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                      You haven't placed any traditional spice orders yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Order #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-xs font-extrabold text-slate-900 block">₹{order.total}</span>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                              {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                            </span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}
                              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recently Viewed Spices */}
                {profile?.recentlyViewed && profile.recentlyViewed.length > 0 && (
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                    <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-4">
                      Recently Viewed Spices
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {profile.recentlyViewed.slice(0, 4).map(prodId => {
                        const prod = getProductById(prodId);
                        if (!prod) return null;
                        return (
                          <div key={prodId} className="border border-slate-100 rounded-xl p-2.5 text-center flex flex-col justify-between">
                            <img 
                              src={resolveProductImage(prod)} 
                              alt={prod.name} 
                              className="w-14 h-14 object-contain mx-auto rounded-lg mb-2"
                              referrerPolicy="no-referrer"
                            />
                            <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{prod.name}</h4>
                            <span className="text-[10px] text-[#A61B1B] font-extrabold mt-1 block">₹{prod.mrp}</span>
                            <button
                              onClick={() => onAddToCart(prod, 1)}
                              className="mt-2 py-1 bg-[#A61B1B]/10 hover:bg-[#A61B1B] hover:text-white rounded-lg text-[9px] font-bold text-[#A61B1B] transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: ORDERS PANEL */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {!selectedOrder ? (
                  /* LIST OF ORDERS */
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                    <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-4">
                      Your Order History
                    </h3>

                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-3">
                        <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                        <p>You haven't placed any traditional spice orders yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-mono tracking-widest uppercase">
                              <th className="py-3">Order ID</th>
                              <th className="py-3">Date</th>
                              <th className="py-3">Items</th>
                              <th className="py-3">Status</th>
                              <th className="py-3 text-right">Total Amount</th>
                              <th className="py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 font-medium">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50/50">
                                <td className="py-4 font-bold text-slate-900">
                                  #{order.id.slice(-6).toUpperCase()}
                                </td>
                                <td className="py-4 text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </td>
                                <td className="py-4 text-slate-600">
                                  {order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                                </td>
                                <td className="py-4">
                                  <span className={`text-[9.5px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-4 text-right font-extrabold text-slate-900">
                                  ₹{order.total}
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-xs font-bold text-[#A61B1B] hover:underline cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SINGLE ORDER DETAILED VIEW */
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)] space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                      <div className="flex items-center space-x-2.5">
                        <button 
                          onClick={() => setSelectedOrder(null)}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <span className="text-xs text-slate-400 block font-mono font-bold">ORDER DETAIL</span>
                          <h4 className="text-sm font-bold text-slate-900">Order #{selectedOrder.id.slice(-6).toUpperCase()}</h4>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full ${
                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        Status: {selectedOrder.status}
                      </span>
                    </div>

                    {/* Order summary info cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                        <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase block">Delivery Address</span>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">{selectedOrder.name}</p>
                          <p className="text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                          <p className="text-slate-600 font-mono font-semibold">Mob: {selectedOrder.phone}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                        <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase block">Payment Details</span>
                        <div className="space-y-1">
                          <p className="text-slate-600">Method: <strong className="text-slate-800">{selectedOrder.paymentMethod}</strong></p>
                          <p className="text-slate-600">Paid Amount: <strong className="text-slate-800">₹{selectedOrder.paidAmount}</strong></p>
                          <p className="text-slate-600">Order Placed: <strong className="text-slate-800">{new Date(selectedOrder.createdAt).toLocaleString()}</strong></p>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block mb-3">Items Ordered</span>
                      <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                        <div className="grid grid-cols-12 bg-slate-50 font-mono tracking-wide font-bold text-slate-500 py-2 px-4 uppercase">
                          <div className="col-span-6">Product Details</div>
                          <div className="col-span-2 text-center">Weight</div>
                          <div className="col-span-2 text-center">Qty</div>
                          <div className="col-span-2 text-right">Price</div>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 py-3 px-4 items-center">
                              <div className="col-span-6 font-bold text-slate-900">{item.productName}</div>
                              <div className="col-span-2 text-center text-slate-500">{item.weight}</div>
                              <div className="col-span-2 text-center font-extrabold text-slate-800">{item.quantity}</div>
                              <div className="col-span-2 text-right font-extrabold text-[#A61B1B]">₹{item.price * item.quantity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Total billing detail */}
                    <div className="flex flex-col items-end pr-4 text-xs space-y-1.5 font-medium text-slate-600">
                      <div className="flex justify-between w-48">
                        <span>Items Total:</span>
                        <span className="font-bold text-slate-900">₹{selectedOrder.total}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-1.5 flex justify-between w-48 text-sm">
                        <span className="font-bold text-slate-800">Final Paid:</span>
                        <span className="font-black text-[#A61B1B]">₹{selectedOrder.paidAmount || selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-6">
                  Your Wishlisted Spices
                </h3>

                {!profile?.wishlist || profile.wishlist.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-3">
                    <Heart className="w-10 h-10 mx-auto text-slate-300" />
                    <p>Your wishlist is empty. Explore our authentic traditional masalas!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {profile.wishlist.map(id => {
                      const prod = getProductById(id);
                      if (!prod) return null;
                      return (
                        <div 
                          key={id}
                          className="border border-slate-200/50 hover:border-amber-900/15 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all bg-slate-50/50"
                        >
                          <div className="relative">
                            <img 
                              src={resolveProductImage(prod)} 
                              alt={prod.name} 
                              className="w-24 h-24 object-contain mx-auto rounded-xl mb-3"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          <div className="text-center">
                            <span className="text-[9px] font-mono tracking-widest text-[#A61B1B] uppercase font-bold">{prod.category}</span>
                            <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{prod.weight}</p>
                            <span className="text-sm font-black text-slate-900 mt-1.5 block">₹{prod.mrp}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                              onClick={() => onAddToCart(prod, 1)}
                              className="w-full py-1.5 bg-[#A61B1B] hover:bg-[#8f1515] text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${prod.name} from wishlist?`)) {
                                  updateUserProfile({
                                    wishlist: (profile.wishlist || []).filter(wid => wid !== id)
                                  });
                                }
                              }}
                              className="w-full py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)] space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900">
                    Your Saved Delivery Addresses
                  </h3>
                  <button
                    onClick={() => handleOpenAddressModal()}
                    className="px-3.5 py-1.5 bg-[#A61B1B] hover:bg-[#8f1515] text-white rounded-full text-[10px] font-bold tracking-wider uppercase transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {!profile?.addresses || profile.addresses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-3">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300" />
                    <p>No delivery addresses found. Add one to accelerate your checkout process!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        className={`border rounded-2xl p-4.5 space-y-3 relative shadow-sm ${
                          addr.isDefault 
                            ? 'border-[#A61B1B] bg-[#A61B1B]/5' 
                            : 'border-slate-200 bg-white hover:bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9.5px] font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded ${
                            addr.type === 'HOME' ? 'bg-amber-100 text-amber-800' :
                            addr.type === 'OFFICE' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {addr.type}
                          </span>
                          
                          {addr.isDefault && (
                            <span className="text-[9.5px] font-bold text-[#A61B1B] flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>DEFAULT DELIVERY</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="font-extrabold text-slate-900">{addr.fullName}</p>
                          <p className="text-slate-600 leading-relaxed">{addr.streetAddress}</p>
                          {addr.landmark && <p className="text-slate-500 italic">Landmark: {addr.landmark}</p>}
                          <p className="text-slate-600 font-medium">{addr.cityStatePincode}</p>
                          <p className="text-slate-700 font-semibold font-mono mt-2">Mob: {addr.mobile}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                          {!addr.isDefault && (
                            <button
                              onClick={() => saveAddress({ ...addr, isDefault: true })}
                              className="text-[10px] font-bold text-slate-500 hover:text-[#A61B1B] transition-all cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                          
                          <div className="flex items-center space-x-3.5 ml-auto">
                            <button
                              onClick={() => handleOpenAddressModal(addr)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-[#A61B1B] cursor-pointer"
                              title="Edit address"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddressClick(addr.id)}
                              className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE & SECURITY */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Profile Edit Form */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                  <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-5">
                    Personal Information
                  </h3>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                        Customer Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        disabled // Auth accounts should keep emails isolated or require verify
                        value={email}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-[11px] font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                  <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-5">
                    Account Password Setup
                  </h3>

                  {passError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{passError}</span>
                    </div>
                  )}

                  {passSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-start space-x-2">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          placeholder="Min 6 characters"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmNewPass}
                        onChange={(e) => setConfirmNewPass(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPass}
                      className="px-5 py-2.5 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-[11px] font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {updatingPass ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)]">
                <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  My Written Reviews & Ratings
                </h3>

                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-3">
                    <Star className="w-10 h-10 mx-auto text-slate-300" />
                    <p>You haven't authored any spice reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{rev.productName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-black">
                            <span>{rev.rating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.reviewText}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SETTINGS & PREFERENCES */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.012)] space-y-6">
                <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  Account Settings & Preferences
                </h3>

                {prefSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Preferences updated successfully!</span>
                  </div>
                )}

                {/* Preference Toggles */}
                <div className="space-y-4 max-w-md">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#A61B1B]" />
                        <span>Order Updates Alerts</span>
                      </label>
                      <p className="text-[10.5px] text-slate-500 leading-snug">Receive automated SMS & email notifications when your spices are shipped.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={orderUpdatesPref}
                      onChange={(e) => setOrderUpdatesPref(e.target.checked)}
                      className="accent-[#A61B1B] w-4 h-4 mt-0.5"
                    />
                  </div>

                  <div className="flex items-start justify-between border-t border-slate-100 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#A61B1B]" />
                        <span>Promotional Marketing & Recipes</span>
                      </label>
                      <p className="text-[10.5px] text-slate-500 leading-snug">Get updates on new seasonal Malvani spices, recipes, and exclusive discount codes.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={marketingPref}
                      onChange={(e) => setMarketingPref(e.target.checked)}
                      className="accent-[#A61B1B] w-4 h-4 mt-0.5"
                    />
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="mt-6 px-5 py-2.5 bg-[#A61B1B] hover:bg-[#8f1515] text-white rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ADDRESS DETAILS MODAL POPUP */}
      <AnimatePresence>
        {addressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-100 z-10 flex flex-col"
            >
              <div className="h-1 bg-[#A61B1B] w-full" />
              <button
                onClick={() => setAddressModalOpen(false)}
                className="absolute top-4.5 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-slate-900 border-b border-slate-100 pb-2 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
                </h3>

                {addrError && (
                  <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addrError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAddressSubmit} className="space-y-4">
                  {/* Address Type Selector */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      Address Type Tag
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['HOME', 'OFFICE', 'OTHER'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddrType(type)}
                          className={`py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 border cursor-pointer ${
                            addrType === type
                              ? 'bg-[#A61B1B]/10 border-[#A61B1B] text-[#A61B1B]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type === 'HOME' && <Home className="w-3.5 h-3.5" />}
                          {type === 'OFFICE' && <Briefcase className="w-3.5 h-3.5" />}
                          {type === 'OTHER' && <MapPin className="w-3.5 h-3.5" />}
                          <span>{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Full Name */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      Recipient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhavesh Koyande"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>

                  {/* Street address */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. House No. 405, Devbag Beach Road"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200 resize-none"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Jetty, Opposite Malvan High School"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>

                  {/* City, State, Pincode */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      City, State & Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Malvan, Maharashtra - 416606"
                      value={addrCityState}
                      onChange={(e) => setAddrCityState(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>

                  {/* Contact Mobile */}
                  <div>
                    <label className="block text-slate-700 text-[10px] font-mono tracking-wider font-bold uppercase mb-1.5">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={addrMobile}
                      onChange={(e) => setAddrMobile(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>

                  {/* Default Address Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="addr-default"
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                      className="accent-[#A61B1B] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="addr-default" className="text-xs text-slate-600 select-none cursor-pointer">
                      Make this my default delivery address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
