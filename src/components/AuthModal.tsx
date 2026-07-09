/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ArrowLeft
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
    loginWithGoogle,
    setupRecaptcha, 
    sendOTP, 
    verifyOTP 
  } = useUser();

  const [mode, setMode] = useState<'login' | 'phone_input' | 'otp'>('login');
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [otpConfirmation, setOtpConfirmation] = useState<any>(null);
  const [isSandboxOTP, setIsSandboxOTP] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setInfoMessage(null);
      setLoading(false);
      setOtpConfirmation(null);
      setIsSandboxOTP(false);
      setMode('login');
      // Reset inputs
      setPhone('');
      setOtpCode('');
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const containerId = 'recaptcha-container';
      if (!recaptchaVerifierRef.current) {
        const verifier = await setupRecaptcha(containerId);
        recaptchaVerifierRef.current = verifier;
      }
      
      const result = await sendOTP(phone.trim(), recaptchaVerifierRef.current);
      setOtpConfirmation(result);
      
      if (result === 'sandbox_mode') {
        if (isProduction) {
          throw new Error('Sandbox/Demo Mobile Auth is disabled on production. Real SMS OTP is required.');
        }
        setIsSandboxOTP(true);
        setInfoMessage('Sandbox Mode: A demo code has been generated. Use verification code: 123456');
      } else {
        setInfoMessage('OTP sent successfully to your phone!');
      }
      setMode('otp');
    } catch (err: any) {
      console.error('OTP sending failed:', err);
      if (isProduction) {
        setError(err.message || 'OTP transmission failed. Please configure or verify your Firebase setup and authorized domains.');
      } else {
        setIsSandboxOTP(true);
        setOtpConfirmation('sandbox_mode');
        setInfoMessage('Sandbox Mode: Fallback activated. Please use verification code: 123456');
        setMode('otp');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the OTP verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const activeConfirmation = isSandboxOTP ? phone.trim() : otpConfirmation;
      await verifyOTP(otpCode.trim(), activeConfirmation);
      setInfoMessage('Mobile verification successful!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Incorrect verification code. Please try again.');
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
                {mode === 'login' && "Welcome to Geeta's Masale"}
                {mode === 'phone_input' && "Continue with Phone"}
                {mode === 'otp' && "Verify Your Mobile"}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 px-4 leading-relaxed">
                {mode === 'login' && "Sign in to view orders, track your custom reward points, and sync your shopping cart."}
                {mode === 'phone_input' && "Enter your 10-digit mobile number to receive a secure OTP code."}
                {mode === 'otp' && `Enter the 6-digit verification code sent to ${phone}.`}
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

            {/* reCAPTCHA Invisible Element container */}
            <div id="recaptcha-container" ref={recaptchaContainerRef} className="absolute invisible pointer-events-none" />

            {/* MAIN LOGIN OPTIONS VIEW */}
            {mode === 'login' && (
              <div className="space-y-4">
                {/* 1. Primary Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center justify-center space-x-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-xs font-black border border-slate-100 group-hover:scale-105 transition-transform">
                    <span className="text-[#4285F4]">G</span>
                  </div>
                  <span>Continue with <span className="font-bold">Google</span></span>
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-slate-200/60" />
                  <span className="relative bg-[#FAF9F6] px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    OR
                  </span>
                </div>

                {/* 2. Secondary Phone Button */}
                <button
                  type="button"
                  onClick={() => setMode('phone_input')}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl border border-[#A61B1B]/10 bg-[#A61B1B]/5 hover:bg-[#A61B1B]/10 text-[#A61B1B] text-sm font-semibold tracking-wide transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone className="w-5 h-5 shrink-0 text-[#A61B1B]" />
                  <span>Continue with Phone Number</span>
                </button>

                {/* 3. Demo Login option for quick review (Non-production) */}
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
            )}

            {/* PHONE INPUT VIEW */}
            {mode === 'phone_input' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 px-1">
                    We will send a secure 6-digit OTP code to verify this number.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center space-x-1.5 hover:underline cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In Options</span>
                </button>
              </form>
            )}

            {/* OTP VERIFICATION VIEW */}
            {mode === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5 flex justify-between">
                    <span>Verification Code (OTP)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpConfirmation(null);
                        setOtpCode('');
                        setError(null);
                        setMode('phone_input');
                      }}
                      className="text-[10px] text-[#A61B1B] lowercase font-semibold hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-sm font-bold pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify OTP Code'}
                </button>

                {isSandboxOTP && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 leading-relaxed text-center">
                    <span className="font-bold">Sandbox Mode Demo OTP: </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-500/30 font-bold">123456</span>
                  </div>
                )}
              </form>
            )}

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
