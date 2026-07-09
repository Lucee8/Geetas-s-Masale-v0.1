  /**
   * @license
   * SPDX-License-Identifier: Apache-2.0
   */

  import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'motion/react';
  import { Search, ShoppingBag, Menu, X, Phone, MessageSquare, User, ChevronRight } from 'lucide-react';
  import { useUser } from '../context/UserContext';

  interface NavbarProps {
    onNavigate: (sectionId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    inquiryCount: number;
    onOpenInquiry: () => void;
    onLoginClick: () => void;
    onMyAccountClick: () => void;
  }

  export default function Navbar({
    onNavigate,
    searchQuery,
    onSearchChange,
    inquiryCount,
    onOpenInquiry,
    onLoginClick,
    onMyAccountClick
  }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const { user, profile } = useUser();

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
      { id: 'products', name: 'Our Products' },
      { id: 'heritage', name: 'Konkan Heritage' },
      { id: 'recipes', name: 'Recipes' },
      { id: 'gallery', name: 'Gallery' },
      { id: 'contact', name: 'Contact' },
    ];

    const handleNavClick = (id: string) => {
      onNavigate(id);
      setMobileMenuOpen(false);
    };

    return (
      <nav
        id="main-app-navbar"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-b border-slate-100 py-1'
            : 'bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-slate-200/40 py-2 sm:py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}>
            
            {/* Logo and Branding with red & dark slate styling directly from image */}
            <div
              id="brand-logo-container"
              className="flex items-center cursor-pointer group shrink-0"
              onClick={() => handleNavClick('hero')}
            >
              {!logoError ? (
                <img
                  src="https://ik.imagekit.io/9f6w6a0wf/logo.png.png"
                  alt="Geeta's Logo"
                  className={`object-contain transition-all duration-305 hover:scale-[1.05] ${
                    isScrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-12'
                  }`}
                  onError={() => setLogoError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center">
                  <motion.div
                    className="relative w-9 h-12 rounded-[1.25rem] bg-[#A61B1B] flex items-center justify-center mr-3 shrink-0 shadow-[0_4px_12px_rgba(166,27,27,0.18)] border border-white/10"
                    whileHover={{ scale: 1.08 }}
                  >
                    <span className="text-xl font-sans font-black select-none text-white tracking-widest pr-0.5">G</span>
                    {/* Outer circular pulse orbit */}
                    <div className="absolute inset-0 rounded-[1.25rem] border border-white/20 animate-pulse opacity-25" />
                  </motion.div>
                  
                  <div className="flex flex-col leading-none select-none">
                    <span className="font-sans text-xs font-black tracking-widest text-[#A61B1B] uppercase pb-0.5">
                      GEETA'S
                    </span>
                    <span className="font-sans text-[21px] font-black tracking-wider text-[#0F172A] uppercase leading-none pb-1">
                      MASALE
                    </span>
                    <span className="text-[7.5px] font-mono tracking-widest text-[#A61B1B] uppercase leading-normal font-bold">
                      AUTHENTIC TASTE OF
                    </span>
                    <span className="text-[7.5px] font-mono tracking-widest text-[#A61B1B] uppercase leading-none font-bold">
                      KONKAN
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation Link Entries */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="transition-all font-sans text-xs font-bold tracking-widest uppercase hover:scale-105 duration-300 relative py-1 group cursor-pointer text-slate-700 hover:text-[#A61B1B]"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A61B1B] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Right Interface Controls (Search, WhatsApp quick, Bag, Menu) */}
            <div className="flex items-center space-x-4">
              
              {/* Direct Dial quick shortcut button */}
              <a
                href="tel:+917620428920"
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all duration-300 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Call Geeta's Masale"
              >
                <Phone className="w-3.5 h-3.5 text-[#A61B1B]" />
                <span>CALL STORE</span>
              </a>

              {/* Inline search box triggers */}
              <div className="relative">
                <AnimatePresence>
                  {showSearch && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="absolute right-10 top-1/2 -translate-y-1/2"
                    >
                      <input
                        type="text"
                        placeholder="Search spices..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 rounded-full border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-slate-50 text-slate-800 placeholder-slate-400 border-slate-200"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 rounded-full transition-colors relative cursor-pointer text-slate-700 hover:text-[#A61B1B]"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Account Avatar / Login button */}
              <button
                onClick={user ? onMyAccountClick : onLoginClick}
                className={`rounded-full border transition-all relative group cursor-pointer overflow-hidden flex items-center justify-center ${
                  user 
                    ? (profile?.photoURL || user?.photoURL) 
                      ? 'p-0 border-2 border-[#A61B1B] w-10 h-10 shadow-md shadow-[#A61B1B]/15' 
                      : 'bg-[#A61B1B] border-[#A61B1B] text-white shadow-md shadow-[#A61B1B]/15 w-10 h-10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-10 h-10'
                }`}
                aria-label={user ? "My Account" : "Login"}
              >
                {user ? (
                  (profile?.photoURL || user?.photoURL) ? (
                    <img
                      src={profile?.photoURL || user?.photoURL}
                      alt={profile?.name || "User Avatar"}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-bold text-xs">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </span>
                  )
                ) : (
                  <User className="w-5 h-5 group-hover:scale-110 duration-300" />
                )}
              </button>

              {/* Glowing Shopping/Inquiry bag indicator - Styled as Red Bag with soft Red circle container */}
              <button
                onClick={onOpenInquiry}
                className="p-2.5 rounded-full border transition-all relative group cursor-pointer bg-[#A61B1B]/10 border-[#A61B1B]/20 text-[#A61B1B] hover:bg-[#A61B1B] hover:text-white hover:border-[#A61B1B] shadow-[0_2px_8px_rgba(166,27,27,0.05)]"
                aria-label="Open Inquiry Bag"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 duration-300" />
                <AnimatePresence>
                  {inquiryCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-[#A61B1B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white shadow-[0_2px_8px_rgba(166,27,27,0.25)]"
                    >
                      {inquiryCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full transition-colors text-slate-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Navigation overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 border-b overflow-hidden shadow-lg"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {/* Embedded search bar inside mobile */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Enter curry or product name..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-sm px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3" />
                </div>

                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="block w-full text-left px-4 py-2 rounded-lg text-slate-800 hover:bg-[#A61B1B]/5 hover:text-[#A61B1B] font-sans text-base font-semibold tracking-wide uppercase transition-all"
                  >
                    {item.name}
                  </button>
                ))}

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {user ? (
                    <button
                      onClick={() => {
                        onMyAccountClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#A61B1B]/5 hover:bg-[#A61B1B]/10 rounded-xl border border-[#A61B1B]/15 text-slate-800 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        {(profile?.photoURL || user?.photoURL) ? (
                          <img
                            src={profile?.photoURL || user?.photoURL}
                            alt={profile?.name || "User Avatar"}
                            className="w-8 h-8 rounded-full object-cover border-2 border-[#A61B1B]/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#A61B1B] text-white font-bold flex items-center justify-center text-sm">
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-[10px] font-mono tracking-wider text-[#A61B1B] uppercase font-bold">Logged In As</p>
                          <p className="text-xs font-bold text-slate-900">{profile?.name || 'Customer'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onLoginClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-[#A61B1B]/20 hover:bg-slate-50 text-slate-800 font-sans text-xs font-bold tracking-wider uppercase transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#A61B1B]" />
                      <span>LOG IN / REGISTER</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="tel:+917620428920"
                      className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#A61B1B] text-white font-mono text-xs font-semibold tracking-wider hover:bg-red-800 transition shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>CALL STORE</span>
                    </a>
                    <button
                      onClick={() => {
                        onOpenInquiry();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-900 text-white font-sans text-xs font-bold tracking-wider hover:bg-slate-800 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>BAG ({inquiryCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }
