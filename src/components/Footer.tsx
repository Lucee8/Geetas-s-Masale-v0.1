/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Phone, MapPin, Compass, ArrowUp, Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({ onNavigate, onOpenAdmin }: FooterProps) {
  const [emailSub, setEmailSub] = useState('');
  const [success, setSuccess] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSub.trim()) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setEmailSub('');
    }, 3000);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer-root" className="relative bg-white text-slate-800 pt-16 pb-8 border-t border-slate-200 overflow-hidden">
      
      {/* Absolute faint background highlights */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#A61B1B]/3 rounded-tl-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-slate-100 pb-10">
          
          {/* Box 1: Brand description, tagline, social icons */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex items-center cursor-pointer" onClick={handleScrollToTop}>
              {!logoError ? (
                <div className="bg-white px-3.5 py-2.5 rounded-xl mr-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center justify-center">
                  <img
                    src="https://ik.imagekit.io/9f6w6a0wf/logo.png.png"
                    alt="Geeta's Logo"
                    className="h-8 sm:h-9 w-auto object-contain transition-all hover:scale-[1.05]"
                    onError={() => setLogoError(true)}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#A61B1B] flex items-center justify-center mr-3 shadow-lg shrink-0">
                    <span className="text-xl font-bold text-white select-none">G</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-lg font-black tracking-widest text-[#A61B1B] uppercase">
                      Geeta's <span className="text-slate-800 font-extrabold pb-0.5">Masale</span>
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">
                      Authentic Taste of Konkan
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-sm">
              We deliver elite Malvani spices, hand-rolled sweet laddoos, premium parboiled rice, sun-dried kokum sole, and gourmet cashew nuts crafted using generation-old recipes directly from Kasal, Malvan.
            </p>

            {/* Direct hotline shortcut links */}
            <div className="flex space-x-3">
              <a
                href="https://wa.me/917620428920"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-700 transition-all"
                title="WhatsApp Direct Chat"
              >
                <MessageSquare className="w-4 h-4 fill-current text-[#25D366]" />
              </a>
              <a
                href="tel:+917620428920"
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#A61B1B] transition-all"
                title="Phone Hotline Direct Dial"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://maps.google.com/?q=Kasal+-+Malvan+Rd,+Near+Petrol+Pump,+Dewoolwada,+Malvan,+Maharashtra+416606"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                title="GPS coordinates location"
              >
                <Compass className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Box 2: Quick navigation links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#A61B1B] uppercase">Navigations</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-sans uppercase tracking-wider font-semibold">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer">
                  Our Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recipes')} className="hover:text-[#A61B1B] transition-colors cursor-pointer">
                  Recipe Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('why')} className="hover:text-[#A61B1B] transition-colors cursor-pointer">
                  Quality standards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-[#A61B1B] transition-colors cursor-pointer">
                  Photo gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Box 3: Primary products categories shortcut */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#A61B1B] uppercase">Spice Categories</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-sans">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer text-left w-full">
                  • Malvani Special Sunday Masala
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer text-left w-full">
                  • Malvani Fish Fry Masala
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer text-left w-full">
                  • Traditional Flours (Pith)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer text-left w-full">
                  • Konkan Meva & Poli (Mango-Jackfruit)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#A61B1B] transition-colors cursor-pointer text-left w-full">
                  • Premium Salted Malvan Cashews
                </button>
              </li>
            </ul>
          </div>

          {/* Box 4: Newsletter newsletter sub */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#A61B1B] uppercase">Aroma Catalog News</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs font-sans">
              Subscribe to unlock quarterly secret recipes, wholesale discount alerts, and festival bulk booking windows.
            </p>

            <form onSubmit={handleSub} className="space-y-2 relative">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter email address..."
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 p-1.5 rounded-lg bg-[#A61B1B] text-white hover:bg-red-800 transition-colors cursor-pointer font-bold"
                  aria-label="Submit subscriber info"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {success && (
                <div className="text-[10px] text-emerald-600 font-mono mt-1 flex items-center space-x-1">
                  <span>✔ Thank you! You are subscribed.</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Closing details copyrights and back to top indicator */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-widest text-center sm:text-left gap-4">
          <div className="space-y-1 block">
            <p>© 2026 GEETA'S MASALE. AUTHENTIC MALVANI TASTE, CRAFTED WITH TRADITION.</p>
            <p className="text-[9px] text-slate-500 normal-case">
              Directly Sourced inside Kasal-Malvan Rd, Maharashtra 416606
              {onOpenAdmin && (
                <>
                  {' • '}
                  <button onClick={onOpenAdmin} className="text-[#A61B1B] font-bold hover:underline cursor-pointer">
                    🔑 Manage Store (Admin)
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Back to top bullet button */}
          <button
            onClick={handleScrollToTop}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 transition-all cursor-pointer bg-slate-50"
            title="Squeeze viewport back up"
          >
            <span>SCROLL TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
