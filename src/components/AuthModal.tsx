/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { isProduction } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { 
    loginAsDemo,
    loginWithGoogle
  } = useUser();

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setInfoMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    setInfoMessage(null);
    try {
      await loginWithGoogle();
      setInfoMessage('Logged in successfully with Google!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setError(null);
    setLoading(true);
    try {
      loginAsDemo();
      setInfoMessage('Logged in as Demo Customer!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Demo Login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Background Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-[#FAF9F6] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-amber-900/10 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Graphic Accent */}
          <div className="h-1.5 w-full bg-[#A61B1B]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div className="p-6 overflow-y-auto">
            {/* Branding Logo & Tagline */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-[#A61B1B] mb-2 shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                Welcome to Geeta's Masale
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 px-4 leading-relaxed">
                Sign in to view orders, track your custom reward points, and sync your shopping cart.
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </motion.div>
            )}

            {/* Success Info Notification Alert */}
            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#A61B1B]" />
                <span className="leading-snug font-medium">{infoMessage}</span>
              </motion.div>
            )}

            {/* MAIN LOGIN OPTIONS VIEW */}
            <div className="space-y-4">
              {/* 1. Primary Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center justify-center space-x-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-xs font-black border border-slate-100 group-hover:scale-105 transition-transform">
                  <span className="text-[#4285F4]">G</span>
                </div>
                <span>Continue with <span className="font-bold">Google</span></span>
              </button>

              {/* 2. Demo Login option for quick review (Non-production) */}
              {!isProduction && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-[11px] text-amber-600 hover:text-amber-800 font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Demo Login (Bypass)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Guest Mode Action */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200/40">
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-[#A61B1B] text-xs font-semibold hover:underline cursor-pointer"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
