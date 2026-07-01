/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  MessageSquare, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft, 
  Smartphone, 
  QrCode, 
  Check, 
  Copy, 
  Sparkles, 
  CreditCard,
  MapPin,
  Home,
  Briefcase,
  User
} from 'lucide-react';
import { Product } from '../types';

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryList: { product: Product; quantity: number }[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
}

export default function InquiryDrawer({
  isOpen,
  onClose,
  inquiryList,
  onRemoveItem,
  onUpdateQuantity,
}: InquiryDrawerProps) {
  
  const [step, setStep] = useState<'bag' | 'address' | 'summary' | 'pay'>('bag');
  
  // Customer info states initialized from LocalStorage for seamless sessions
  const [fullName, setFullName] = useState(() => localStorage.getItem('gm_fullName') || '');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'OTHER'>(
    () => (localStorage.getItem('gm_addressType') as 'HOME' | 'OFFICE' | 'OTHER') || 'HOME'
  );
  const [streetAddress, setStreetAddress] = useState(() => localStorage.getItem('gm_streetAddress') || '');
  const [landmark, setLandmark] = useState(() => localStorage.getItem('gm_landmark') || '');
  const [cityStatePincode, setCityStatePincode] = useState(() => localStorage.getItem('gm_cityStatePincode') || '');
  const [mobile, setMobile] = useState(() => localStorage.getItem('gm_mobile') || '');
  
  const [addressErrors, setAddressErrors] = useState<string[]>([]);
  const [amountMode, setAmountMode] = useState<'full' | 'advance' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState<string>('299');
  const [copied, setCopied] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Dynamic database coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon(data);
      } else {
        const err = await res.json();
        setCouponError(err.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (e) {
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const submitOrderToBackend = async (method: 'COD' | 'UPI', paidAmt = 0) => {
    try {
      const itemsPayload = inquiryList.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.mrp,
        weight: item.product.weight
      }));

      const payload = {
        customerName: fullName,
        customerPhone: mobile,
        customerAddress: `${streetAddress}${landmark ? ` (Landmark: ${landmark})` : ''}, ${cityStatePincode}`,
        customerEmail: '',
        items: itemsPayload,
        paymentType: method,
        amount: finalTotalBill,
        paidAmount: paidAmt
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log("Order saved to database successfully!");
      }
    } catch (e) {
      console.error("Failed to post order to backend:", e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));
    }
  }, []);

  // Auto-reset state when drawer closes or list empties
  useEffect(() => {
    if (!isOpen) {
      setStep('bag');
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (inquiryList.length === 0) {
      setStep('bag');
    }
  }, [inquiryList]);

  // Pricing calculations
  const totalPricing = inquiryList.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const deliveryFee = totalPricing > 499 ? 0 : 40;

  // Coupon vs heritage standard offer application
  const discountPct = appliedCoupon ? Number(appliedCoupon.discount) / 100 : 0.10; // 10% authentic Konkan Heritage discount by default
  const maxDiscAmount = appliedCoupon?.maxDiscount ? Number(appliedCoupon.maxDiscount) : 99999;
  const discountAmount = Math.min(Math.round(totalPricing * discountPct), maxDiscAmount);

  const finalTotalBill = Math.max(0, totalPricing + deliveryFee - discountAmount);

  // Safely calculate pay amount based on selected mode
  const payAmount = amountMode === 'full'
    ? finalTotalBill
    : amountMode === 'advance'
      ? Math.min(299, finalTotalBill)
      : Number(customAmount) || 0;

  // Generate UPI deep link URI with required parameters
  const upiString = `upi://pay?pa=bhavesh62006@fam&pn=Geetas%20Masale&am=${payAmount}&cu=INR`;
  
  // Real dynamic live QR code generation endpoint
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}&color=A61B1B&bgcolor=FFFFFF`;

  const saveAddressToLocalStorage = () => {
    localStorage.setItem('gm_fullName', fullName);
    localStorage.setItem('gm_addressType', addressType);
    localStorage.setItem('gm_streetAddress', streetAddress);
    localStorage.setItem('gm_landmark', landmark);
    localStorage.setItem('gm_cityStatePincode', cityStatePincode);
    localStorage.setItem('gm_mobile', mobile);
  };

  const validateAddress = () => {
    const errors: string[] = [];
    if (!fullName.trim()) errors.push('Please enter your full name.');
    if (!streetAddress.trim()) errors.push('Please enter your address / flat / street.');
    if (!cityStatePincode.trim()) errors.push('Please enter your city, district & pincode.');
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      errors.push('Please enter a valid 10-digit mobile number.');
    }
    setAddressErrors(errors);
    return errors.length === 0;
  };

  const handleNextToSummary = () => {
    if (validateAddress()) {
      saveAddressToLocalStorage();
      setStep('summary');
    }
  };

  // WhatsApp transmission with complete customer payload
  const handleTransmitWhatsApp = () => {
    if (inquiryList.length === 0) return;

    let text = `Hello Geeta's Masale! My order request is compiled as below:\n\n`;

    text += `*📍 DELIVER TO:* \n`;
    text += `• *Name:* ${fullName}\n`;
    text += `• *Type:* ${addressType}\n`;
    text += `• *Address:* ${streetAddress}${landmark ? ` (Landmark: ${landmark})` : ''}, ${cityStatePincode}\n`;
    text += `• *Mobile/WhatsApp:* ${mobile}\n\n`;

    text += `*🛍 ORDER ITEMS:* \n`;
    inquiryList.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n`;
      text += `   - Size: ${item.product.weight}\n`;
      text += `   - Qty: ${item.quantity}\n`;
      text += `   - M.R.P.: Rs. ${item.product.mrp} each\n`;
      text += `   - Subtotal: Rs. ${item.product.mrp * item.quantity}\n\n`;
    });

    text += `*💰 BILLING SUMMARY:* \n`;
    text += `• Subtotal MRP: Rs. ${totalPricing}\n`;
    text += `• Courier & Packing: Rs. ${deliveryFee === 0 ? 'FREE' : deliveryFee}\n`;
    text += `• Heritage Discount (10%): Rs. ${discountAmount}\n`;
    text += `• *Net Total Bill*: *Rs. ${finalTotalBill}*\n\n`;
    text += `Please verify availability and dispatch courier packing details. Thank you!`;

    const url = `https://api.whatsapp.com/send?phone=917620428920&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp transmission for prepaid/initiated UPI payment
  const handleTransmitWhatsAppPay = () => {
    if (inquiryList.length === 0) return;

    let text = `Hello *Geeta's Masale*! I have completed order payment of *Rs. ${payAmount}* on the app:\n\n`;

    text += `*📍 DELIVER TO:* \n`;
    text += `• *Name:* ${fullName}\n`;
    text += `• *Type:* ${addressType}\n`;
    text += `• *Address:* ${streetAddress}${landmark ? ` (Landmark: ${landmark})` : ''}, ${cityStatePincode}\n`;
    text += `• *Mobile/WhatsApp:* ${mobile}\n\n`;

    text += `*🛍 ORDER ITEMS*:\n`;
    inquiryList.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}* (${item.product.weight})\n`;
      text += `   Qty: ${item.quantity} x Rs. ${item.product.mrp} = Rs. ${item.product.mrp * item.quantity}\n`;
    });

    text += `\n*💰 BILL SUMMARY*:\n`;
    text += `• Total MRP: Rs. ${totalPricing}\n`;
    text += `• Courier Shipping: Rs. ${deliveryFee === 0 ? 'FREE' : deliveryFee}\n`;
    text += `• Heritage Discount (10%): -Rs. ${discountAmount}\n`;
    text += `• *Net Final Bill*: *Rs. ${finalTotalBill}*\n`;
    text += `• *Direct UPI Paid/Initiated*: *Rs. ${payAmount}*\n`;
    
    if (payAmount < finalTotalBill) {
      text += `• *Remaining Cod Balance*: *Rs. ${finalTotalBill - payAmount}*\n`;
    }
    
    text += `• *Payment Reference*: Initiated on App (Attaching payment success screenshot)\n\n`;
    text += `Please confirm my express shipment order and share tracking ID! Thank you safely.`;

    const url = `https://api.whatsapp.com/send?phone=917620428920&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('bhavesh62006@fam');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomPriceChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setCustomAmount(clean);
  };

  // Modern Stepper matching your Flipkart styled design
  const renderStepper = () => {
    if (step === 'bag') return null;

    const stepsList = [
      { id: 'address', label: 'Address' },
      { id: 'summary', label: 'Summary' },
      { id: 'pay', label: 'Payment' }
    ];

    const getStepIndex = (s: typeof step) => {
      if (s === 'address') return 0;
      if (s === 'summary') return 1;
      return 2;
    };

    const currentIndex = getStepIndex(step);

    return (
      <div className="px-5 py-4 bg-white border-b border-gray-150 shrink-0">
        <div className="flex items-center justify-between max-w-[280px] sm:max-w-xs mx-auto relative">
          
          {/* Tracking continuous bar background */}
          <div className="absolute left-4 right-4 top-4.5 h-[2px] bg-slate-100 z-0">
            <div 
              className="h-full bg-[#A61B1B] transition-all duration-300"
              style={{ width: `${(currentIndex / 2) * 100}%` }}
            />
          </div>

          {stepsList.map((s, idx) => {
            const isCompleted = getStepIndex(step) > idx;
            const isActive = step === s.id;
            
            return (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => {
                    if (idx <= getStepIndex(step)) {
                      setStep(s.id as any);
                    }
                  }}
                  disabled={idx > getStepIndex(step)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-black transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm cursor-pointer'
                      : isActive
                        ? 'bg-[#A61B1B] text-white border-4 border-red-100 font-extrabold cursor-pointer'
                        : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white" /> : idx + 1}
                </button>
                <span className={`text-[9px] font-mono mt-1.5 uppercase tracking-wider font-extrabold transition-colors duration-200 ${
                  isActive ? 'text-[#A61B1B]' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="inquiry-drawer-overlay-root" className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop glass layer clickable to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Right sliding container panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#FAF9F6] text-slate-800 h-full flex flex-col justify-between shadow-2xl border-l border-[#A61B1B]/15"
            >
              
              {/* Drawer Header block */}
              <div className="px-6 py-5 bg-[#A61B1B] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-white text-[#A61B1B]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg uppercase tracking-wider">
                      {step === 'bag' ? 'Your spice wagon' : 'Safe checkout'}
                    </h3>
                    <p className="text-[10px] font-mono text-rose-100/70 uppercase">
                      {step === 'bag' ? `${inquiryList.length} Items Selected` : 'Malvani Kitchen Doorstep Shipping'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Steps Stepper Area */}
              {renderStepper()}

              {/* Step Segment Render */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-0">
                
                {/* CASE 1: BAG OVERVIEW */}
                {step === 'bag' && (
                  <div className="space-y-4">
                    {inquiryList.length === 0 ? (
                      <div className="text-center py-20 space-y-4">
                        <span className="text-6xl block">🥣</span>
                        <h4 className="font-sans font-bold text-base uppercase text-slate-400">Your bag is empty</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                          Explore our authentic konkan home masalas, premium cashews, or stone-ground flours and load your bag to checkout!
                        </p>
                        <button
                          onClick={onClose}
                          className="mt-4 px-6 py-2 rounded-full bg-[#A61B1B] text-white hover:bg-rose-950 text-xs font-mono font-bold uppercase cursor-pointer"
                        >
                          Browse Products Catalog
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiryList.map((item) => (
                          <motion.div
                            key={item.product.id}
                            layout
                            className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between shadow-xs space-x-3 hover:shadow-md duration-300"
                          >
                            <div className="flex-1 space-y-1">
                              <h4 className="font-sans font-bold text-sm uppercase text-slate-800 line-clamp-1">
                                {item.product.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                                <span className="font-mono">{item.product.weight} pack</span>
                                <span>•</span>
                                <span className="font-sans">Rate: ₹{item.product.mrp}</span>
                              </div>
                              <div className="text-xs font-sans font-extrabold text-[#A61B1B]">
                                Total: ₹{item.product.mrp * item.quantity}
                              </div>
                            </div>

                            {/* Counter */}
                            <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-155 uppercase shrink-0">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                className="w-5.5 h-5.5 rounded bg-white flex items-center justify-center text-xs font-bold border border-gray-200 cursor-pointer hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="w-5.5 h-5.5 rounded bg-white flex items-center justify-center text-xs font-bold border border-gray-200 cursor-pointer hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#A61B1B] shrink-0 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 2: ADDRESS INFO FORM (The Flipkart deliver to step) */}
                {step === 'address' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-2 text-[#A61B1B]">
                      <MapPin className="w-4 h-4 fill-current animate-pulse" />
                      <h4 className="font-sans font-bold text-sm uppercase tracking-wide">Enter Delivery Address</h4>
                    </div>

                    {/* Validation errors */}
                    {addressErrors.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                        {addressErrors.map((err, idx) => (
                          <p key={idx} className="text-[10px] text-red-700 font-sans leading-tight">🛑 {err}</p>
                        ))}
                      </div>
                    )}

                    {/* Form Fields Inputs */}
                    <div className="space-y-3.5">
                      {/* Name */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Full Name / Deliver to Name
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Bhavesh K"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                          />
                        </div>
                      </div>

                      {/* Address Type Buttons Tag Selector */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Address Category (Tag)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'HOME', icon: Home, label: 'Home' },
                            { id: 'OFFICE', icon: Briefcase, label: 'Office' },
                            { id: 'OTHER', icon: MapPin, label: 'Other' }
                          ].map((t) => {
                            const Icon = t.icon;
                            const isSel = addressType === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setAddressType(t.id as any)}
                                className={`py-2 px-3 rounded-xl border text-[10px] font-mono font-bold uppercase flex items-center justify-center space-x-1 duration-200 cursor-pointer ${
                                  isSel
                                    ? 'bg-[#A61B1B] text-white border-[#A61B1B] shadow-sm font-black'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* House / Flat / Street */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Flat, House no., Building, Company or Resort Name
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="e.g. House no.5 Chaitanya Beach Resort, Devbag"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                        />
                      </div>

                      {/* Landmark detail */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Tarkarli Beach Jetty"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                        />
                      </div>

                      {/* Town / City, State & Pincode */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          City, District, State & Pincode
                        </label>
                        <input
                          type="text"
                          value={cityStatePincode}
                          onChange={(e) => setCityStatePincode(e.target.value)}
                          placeholder="e.g. Malvan, Dist. Sindhudurg, Maharashtra 416606"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                        />
                      </div>

                      {/* WhatsApp Phone Contact */}
                      <div>
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          WhatsApp Mobile Number (10 digits)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-gray-400 text-xs font-bold font-mono">+91</span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="8378991750"
                            className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] focus:border-[#A61B1B]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 3: COMPLETE ORDER SUMMARY & FLIPKART PRICING */}
                {step === 'summary' && (
                  <div className="space-y-4">
                    {/* Deliver to card block */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black text-slate-400 uppercase">Deliver to:</span>
                        <button
                          onClick={() => setStep('address')}
                          className="text-xs font-bold font-sans text-emerald-600 hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-sans font-bold text-sm text-slate-900">{fullName}</span>
                          <span className="text-[9px] font-mono tracking-wide px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[#A61B1B] font-extrabold uppercase">
                            {addressType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-sans leading-normal">
                          {streetAddress}
                          {landmark ? `, Landmark: ${landmark}` : ''}, {cityStatePincode}
                        </p>
                        <p className="text-xs text-slate-800 font-mono font-bold pt-1">{mobile}</p>
                      </div>
                    </div>

                    {/* Small item lists shortcut */}
                    <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1.5 divide-y divide-slate-50 shrink-0">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider block mb-1">Items Summary ({inquiryList.length})</span>
                      {inquiryList.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between py-1.5 text-xs">
                          <span className="text-slate-800 capitalize line-clamp-1">{item.product.name} (x{item.quantity})</span>
                          <span className="font-mono text-slate-600">₹{item.product.mrp * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic coupon application block */}
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-2 text-left">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider block">Promo Coupon Code</span>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. GEETA20"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          disabled={appliedCoupon !== null}
                          className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800 disabled:opacity-75"
                        />
                        {appliedCoupon ? (
                          <button
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode('');
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-sans font-extrabold bg-slate-100 text-red-650 hover:bg-slate-200 cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-sans font-extrabold bg-[#A61B1B] text-white hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                          >
                            {couponLoading ? '...' : 'Apply'}
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <p className="text-[10px] text-red-600 font-mono font-medium">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-[10px] text-emerald-600 font-mono font-bold">
                          🎉 Active: "{appliedCoupon.code}" ({appliedCoupon.discount}% Off up to ₹{appliedCoupon.maxDiscount || 500})
                        </p>
                      )}
                    </div>

                    {/* Exact Flipkart styled billing detail container */}
                    <div className="bg-white rounded-xl p-4.5 border border-slate-200 shadow-xs space-y-3">
                      <h4 className="text-xs font-mono font-black text-[#A61B1B] uppercase tracking-wider border-b border-gray-100 pb-2">Price Details</h4>
                      
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>MRP (including all taxes)</span>
                        <span className="font-bold text-slate-800 font-mono">₹{totalPricing}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Courier & Delivery Fees</span>
                        {deliveryFee === 0 ? (
                          <span className="font-bold text-emerald-600 font-mono uppercase">FREE SHIPPING</span>
                        ) : (
                          <span className="font-bold text-slate-800 font-mono">₹{deliveryFee}</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Heritage Discount (10% Off)</span>
                        <span className="font-bold text-emerald-600 font-mono">-₹{discountAmount}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-slate-900 border-t border-slate-100 pt-2.5 font-sans font-black uppercase">
                        <span>Total Payable Amount</span>
                        <span className="text-lg text-[#A61B1B] font-mono">₹{finalTotalBill}</span>
                      </div>

                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center text-[10px] font-sans font-bold text-emerald-700 uppercase tracking-wide">
                        🎉 You will save ₹{discountAmount} on this order!
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 4: PAYMENT OPTIONS & DIRECT UPI */}
                {step === 'pay' && (
                  <div className="space-y-4">
                    {/* Tiny Deliver To Recap */}
                    <div className="bg-white rounded-xl p-3 border border-slate-150 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold text-left">Deliver to:</span>
                        <span className="font-sans font-bold text-slate-800">{fullName} ({cityStatePincode.split(',').pop()?.trim().slice(-6)})</span>
                      </div>
                      <span className="font-mono font-black text-[#A61B1B] text-sm">₹{finalTotalBill} Payable</span>
                    </div>

                    {/* Confirming amount mode selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                        Choose Direct UPI Amount:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 col-span-3">
                        {/* Option 1: Full Amount */}
                        <button
                          onClick={() => setAmountMode('full')}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-mono font-bold uppercase text-center transition duration-200 cursor-pointer flex flex-col justify-center items-center ${
                            amountMode === 'full'
                              ? 'bg-[#A61B1B] text-white border-[#A61B1B] shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span>Full Bill</span>
                          <span className="text-xs font-sans font-black mt-0.5 font-mono">₹{finalTotalBill}</span>
                        </button>

                        {/* Option 2: Flat Advance */}
                        <button
                          onClick={() => setAmountMode('advance')}
                          disabled={finalTotalBill < 299}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-mono font-bold uppercase text-center transition duration-200 cursor-pointer flex flex-col justify-center items-center disabled:opacity-50 ${
                            amountMode === 'advance'
                              ? 'bg-[#A61B1B] text-white border-[#A61B1B] shadow-sm font-black'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span>Advance</span>
                          <span className="text-xs font-sans font-black mt-0.5 font-mono">₹{Math.min(299, finalTotalBill)}</span>
                        </button>

                        {/* Option 3: Custom Amount */}
                        <button
                          onClick={() => setAmountMode('custom')}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-mono font-bold uppercase text-center transition duration-200 cursor-pointer flex flex-col justify-center items-center ${
                            amountMode === 'custom'
                              ? 'bg-[#A61B1B] text-white border-[#A61B1B] shadow-sm font-black'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span>Custom ₹</span>
                          <span className="text-xs font-sans font-black mt-0.5">Preset</span>
                        </button>
                      </div>

                      {/* Custom input active container */}
                      {amountMode === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-1.5"
                        >
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                            <input
                              type="text"
                              value={customAmount}
                              onChange={(e) => handleCustomPriceChange(e.target.value)}
                              placeholder="Enter Custom Amount to pay"
                              className="w-full pl-7 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Direct mobile pay & computer scanning QR Code */}
                    <div className="space-y-4">
                      {/* Desktop QR Scan Block */}
                      <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-xs flex flex-col items-center space-y-3.5">
                        <div className="flex items-center space-x-1.5 self-start text-xs font-bold font-sans">
                          <QrCode className="w-4 h-4 text-[#A61B1B] shrink-0" />
                          <span className="font-mono text-gray-400 uppercase text-left">💻 Scan QR Code to Pay:</span>
                        </div>

                        {/* Display QR Code */}
                        <div className="relative p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-center w-36 h-36">
                          <img
                            src={qrCodeUrl}
                            alt="Scan Geeta's Masale UPI QR Code"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain filter duration-300"
                          />
                        </div>

                        {/* Copy handle helper */}
                        <div className="w-full bg-[#A61B1B]/5 rounded-xl p-2.5 border border-[#A61B1B]/15 flex items-center justify-between text-xs font-mono">
                          <div className="flex flex-col text-left">
                            <span className="text-[9px] text-[#A61B1B]/70 uppercase font-black">Store UPI ID</span>
                            <span className="font-bold text-slate-800 text-xs">bhavesh62006@fam</span>
                          </div>
                          <button
                            onClick={handleCopyUPI}
                            className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-650 transition cursor-pointer"
                            title="Copy string"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 font-extrabold" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Fast Instructions Guideline bar */}
                    <div className="bg-white p-3.5 rounded-xl border border-dashed border-slate-200 space-y-1 leading-relaxed text-left">
                      <div className="flex items-center space-x-1 uppercase font-mono font-bold text-[#A61B1B] text-[9px] tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#A61B1B]" />
                        <span>Instant Checkout Guide</span>
                      </div>
                      <ol className="text-[9.5px] font-sans text-slate-600 space-y-0.5 list-decimal list-inside pl-1">
                        <li>Tap the pay button above or scan the QR Code.</li>
                        <li>Pay the configured <strong className="text-[#A61B1B]">₹{payAmount}</strong> on GPay/PhonePe.</li>
                        <li>Click below to confirm your address & order details on WhatsApp.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Dynamic Sticky Action Footer depending on current stage */}
              <div className="p-5 sm:p-6 bg-white border-t border-gray-100 shadow-inner shrink-0 text-slate-800">
                {step === 'bag' && inquiryList.length > 0 && (
                  <div className="space-y-3.5 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold block">Cart Subtotal Estimate</span>
                        <span className="text-2xl font-sans font-black text-[#A61B1B] font-mono">₹{totalPricing}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Items: {inquiryList.length}</span>
                    </div>

                    <button
                      onClick={() => setStep('address')}
                      className="w-full inline-flex items-center justify-center space-x-2 py-4 rounded-xl bg-[#A61B1B] hover:bg-red-800 text-white text-xs font-sans font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
                    >
                      <span>Proceed to enter Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 'address' && (
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      onClick={() => setStep('bag')}
                      className="inline-flex items-center justify-center py-3.5 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold uppercase transition cursor-pointer"
                    >
                      <span>Review bag</span>
                    </button>
                    <button
                      onClick={handleNextToSummary}
                      className="inline-flex items-center justify-center space-x-1.5 py-3.5 px-1 rounded-xl bg-[#A61B1B] hover:bg-rose-950 text-white text-xs font-sans font-bold uppercase transition shadow cursor-pointer"
                    >
                      <span>Save & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {step === 'summary' && (
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {/* Share Directly */}
                    <button
                      onClick={() => {
                        submitOrderToBackend('COD', 0);
                        handleTransmitWhatsApp();
                      }}
                      className="inline-flex items-center justify-center space-x-1 py-3.5 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-sans font-extrabold uppercase transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current text-white shrink-0" />
                      <span>Order on WhatsApp</span>
                    </button>

                    {/* Pay via UPI */}
                    <button
                      onClick={() => setStep('pay')}
                      className="inline-flex items-center justify-center space-x-1.5 py-3.5 px-1 rounded-xl bg-[#A61B1B] hover:bg-rose-950 text-white text-[10px] font-sans font-extrabold uppercase transition shadow-md cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>Proceed with Pay</span>
                      <ArrowRight className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                {step === 'pay' && (
                  <div className="space-y-4 text-left">
                    {isIOS ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-center space-x-1.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <span className="text-[10px] font-mono text-amber-700 font-extrabold uppercase tracking-wider">
                            🍎 iOS Device Detected (iPhone / iPad)
                          </span>
                        </div>
                        <p className="text-[9.5px] font-sans text-gray-500 leading-normal text-center">
                          Apple restricts standard wildcards. tap your installed app to pay:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {/* Google Pay */}
                          <a
                            href={`gpay://upi/pay?pa=bhavesh62006@fam&pn=Geetas%20Masale&am=${payAmount}&cu=INR`}
                            onClick={() => {
                              submitOrderToBackend('UPI', payAmount);
                              setTimeout(() => {
                                handleTransmitWhatsAppPay();
                              }, 1200);
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                            <span>Google Pay</span>
                          </a>

                          {/* PhonePe */}
                          <a
                            href={`phonepe://upi/pay?pa=bhavesh62006@fam&pn=Geetas%20Masale&am=${payAmount}&cu=INR`}
                            onClick={() => {
                              submitOrderToBackend('UPI', payAmount);
                              setTimeout(() => {
                                handleTransmitWhatsAppPay();
                              }, 1200);
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                            <span>PhonePe</span>
                          </a>

                          {/* Paytm */}
                          <a
                            href={`paytmmp://upi/pay?pa=bhavesh62006@fam&pn=Geetas%20Masale&am=${payAmount}&cu=INR`}
                            onClick={() => {
                              submitOrderToBackend('UPI', payAmount);
                              setTimeout(() => {
                                handleTransmitWhatsAppPay();
                              }, 1200);
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                            <span>Paytm</span>
                          </a>

                          {/* BHIM UPI */}
                          <a
                            href={`bhim://upi/pay?pa=bhavesh62006@fam&pn=Geetas%20Masale&am=${payAmount}&cu=INR`}
                            onClick={() => {
                              submitOrderToBackend('UPI', payAmount);
                              setTimeout(() => {
                                handleTransmitWhatsAppPay();
                              }, 1200);
                            }}
                            className="inline-flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                            <span>BHIM App</span>
                          </a>
                        </div>

                        {/* Standard generic fallback link */}
                        <a
                          href={upiString}
                          onClick={() => {
                            submitOrderToBackend('UPI', payAmount);
                            setTimeout(() => {
                              handleTransmitWhatsAppPay();
                            }, 1200);
                          }}
                          className="w-full inline-flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[#A61B1B] hover:bg-rose-950 text-white text-[10px] font-mono font-black tracking-widest uppercase transition-all shadow-md text-center cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5 shrink-0 text-white" />
                          <span>Any other UPI App (₹{payAmount})</span>
                        </a>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono text-gray-400 uppercase font-black tracking-wider block text-center mb-1">
                          ⚡ Tap to open any installed UPI App to Pay ₹{payAmount}:
                        </span>
                        
                        <a
                          href={upiString}
                          onClick={() => {
                            submitOrderToBackend('UPI', payAmount);
                            setTimeout(() => {
                              handleTransmitWhatsAppPay();
                            }, 800);
                          }}
                          className="w-full inline-flex items-center justify-center space-x-2.5 py-4 rounded-xl bg-[#A61B1B] hover:bg-rose-950 text-white text-xs font-sans font-black tracking-widest uppercase transition-all shadow-[0_10px_25px_rgba(166,27,27,0.15)] text-center active:scale-[0.98] cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4 animate-pulse shrink-0 text-white" />
                          <span>Pay via UPI App (₹{payAmount})</span>
                        </a>

                        <p className="text-[9px] font-sans text-center text-gray-400 select-none pt-1 leading-normal">
                          This will automatically open your device's payment app prompt (e.g. Google Pay, PhonePe, Paytm, or FamPay) to complete the transaction safely and securely.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
