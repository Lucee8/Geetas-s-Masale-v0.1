/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { 
    loginWithEmail, 
    loginAsDemo,
    registerWithEmail, 
    forgotPassword, 
    setupRecaptcha, 
    sendOTP, 
    verifyOTP 
  } = useUser();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'otp'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Password visibility
  const [showPass, setShowPass] = useState(false);

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
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhone('');
      setOtpCode('');
    }
  }, [isOpen]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password || !fullName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, fullName.trim(), phone.trim());
      setInfoMessage('Account created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setInfoMessage('Password reset link sent! Check your email inbox.');
      setTimeout(() => setMode('login'), 3500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
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
      // 1. Initialize invisible reCAPTCHA if we can
      if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
        recaptchaVerifierRef.current = await setupRecaptcha('recaptcha-container');
      }

      // 2. Request OTP code
      const result = await sendOTP(phone.trim(), recaptchaVerifierRef.current);
      setOtpConfirmation(result);
      
      if (result === 'sandbox_mode') {
        setIsSandboxOTP(true);
        setInfoMessage('Sandbox Mode: A demo code has been generated. Use verification code: 123456');
      } else {
        setInfoMessage(`Verification SMS sent to ${phone}`);
      }
      
      setMode('otp');
    } catch (err: any) {
      console.error('OTP sending failed:', err);
      // Fallback sandbox activation
      setIsSandboxOTP(true);
      setOtpConfirmation('sandbox_mode');
      setInfoMessage('Sandbox Mode: Fallback activated. Please use verification code: 123456');
      setMode('otp');
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#A61B1B]/10 text-[#A61B1B] mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-xl font-bold tracking-tight text-slate-900">
                {mode === 'login' && "Welcome back!"}
                {mode === 'register' && "Join Geeta's Masale"}
                {mode === 'forgot' && "Reset your password"}
                {mode === 'otp' && "Verify Your Mobile"}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {mode === 'login' && "Log in to view orders, reward points, and sync your cart."}
                {mode === 'register' && "Create your traditional spice lover account in seconds."}
                {mode === 'forgot' && "Enter your email, and we will send you a reset link."}
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
            <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden" />

            {/* EMAIL LOGIN VIEW */}
            {mode === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#A61B1B] hover:underline font-medium cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Log In'}
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Quick Demo Login (Bypass Auth)</span>
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-slate-200" />
                  <span className="relative bg-[#FAF9F6] px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    OR LOGIN WITH PHONE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMode('otp')}
                  className="w-full py-2.5 rounded-xl border border-[#A61B1B]/20 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#A61B1B]" />
                  <span>Use Mobile OTP Verification</span>
                </button>
              </form>
            )}

            {/* SIGN UP / REGISTER VIEW */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kadam"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                      Confirm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-type"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating Account...' : 'Register Account'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Request...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}

            {/* MOBILE NUMBER INPUT & OTP VIEW */}
            {mode === 'otp' && (
              <form onSubmit={otpConfirmation ? handleVerifyOTP : handleSendOTP} className="space-y-4">
                {!otpConfirmation ? (
                  /* STEP 1: MOBILE NUMBER ENTRY */
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
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      We'll send an OTP code to verify your phone number.
                    </span>
                  </div>
                ) : (
                  /* STEP 2: VERIFICATION OTP CODE */
                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-1.5 flex justify-between">
                      <span>Verification Code (OTP)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpConfirmation(null);
                          setOtpCode('');
                          setError(null);
                        }}
                        className="text-[10px] text-[#A61B1B] lowercase font-medium hover:underline cursor-pointer"
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
                        className="w-full text-center tracking-[0.5em] text-sm font-bold pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#A61B1B] bg-white text-slate-800 border-slate-200"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#A61B1B] hover:bg-[#8f1515] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : (otpConfirmation ? 'Verify OTP Code' : 'Send Verification OTP')}
                </button>
              </form>
            )}

            {/* Toggle login vs register links */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200/60 text-xs text-slate-600">
              {mode === 'login' && (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="font-semibold text-[#A61B1B] hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-[#A61B1B] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-[#A61B1B] hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              )}
              {mode === 'otp' && !otpConfirmation && (
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-[#A61B1B] hover:underline cursor-pointer"
                >
                  Back to Email Login
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
