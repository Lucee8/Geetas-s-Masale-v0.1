/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MapPin, Clock, MessageSquare, Compass, Send, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    selectedProduct: 'Custom General Inquiry'
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const productOptions = [
    'Custom General Inquiry',
    'Malvani Special Sunday Masala',
    'Malvani Fish Fry Masala',
    'Biryani Masala',
    'Kashmiri Mirchi Powder',
    'Malvani Special Bhajka Masala',
    'Malvani Special Mutton Masala',
    'Malvani Fish Curry Masala',
    'Polish Kaju (Big Size)',
    'Wholesale Bulk Supply Inquiry'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Save contact message to MongoDB/SQL database for admin dashboard
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          product: formData.selectedProduct,
          message: formData.message || 'No additional text specified.'
        })
      });
    } catch (err) {
      console.error("Failed to sync message with backend api:", err);
    }

    // Compose custom text template for instant notification
    const textMsg = `Hello Geeta's Masale! I am sending an inquiry from your website:
- *Name*: ${formData.name}
- *Phone Number*: ${formData.phone}
- *Selected Product/Topic*: ${formData.selectedProduct}
- *Message Details*: ${formData.message || 'No additional text specified.'}

Please get back to me with terms and details. Thank you!`;

    const url = `https://api.whatsapp.com/send?phone=917620428920&text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ name: '', phone: '', message: '', selectedProduct: 'Custom General Inquiry' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-24 bg-white text-slate-800 relative snap-start scroll-mt-20">
      <div className="absolute top-0 right-0 w-full h-1 bg-[#A61B1B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/30 text-[#A61B1B] text-xs font-mono tracking-widest uppercase">
            <MapPin className="w-4 h-4 text-[#A61B1B]" />
            <span>KASAL SPICE HUB LOCATION</span>
          </div>
          <h2 className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase">
            Visit Our Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A61B1B] to-[#D21F1F]">& Connect</span>
          </h2>
          <p className="text-gray-500 text-sm font-light font-sans max-w-md mx-auto">
            Drop by our headquarters on the Kasal-Malvan national highway or dispatch an instant inquiry directly to our phone line.
          </p>
        </div>

        {/* 2 Column Coordinates info and form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Column 1: Store Coordinates and map */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-sans text-2xl font-black uppercase text-slate-800 tracking-wider border-b border-slate-100 pb-3">
                GEETA'S MASALE
              </h3>

              {/* Coordinates block list */}
              <div className="space-y-5">
                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#A61B1B]/10 text-[#A61B1B] shrink-0 mt-1">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm uppercase text-slate-800 tracking-wider">Store Location Address</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Kasal - Malvan Rd, Near Petrol Pump,<br />
                      Dewoolwada, Malvan,<br />
                      Maharashtra 416606
                    </p>
                  </div>
                </div>

                {/* Telephone dial links */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#A61B1B]/10 text-[#A61B1B] shrink-0 mt-1">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm uppercase text-slate-800 tracking-wider">Phone Lines / Hotline</h4>
                    <p className="text-sm mt-1 leading-relaxed">
                      <a href="tel:+917620428920" className="text-[#A61B1B] font-bold text-base hover:underline block">
                        +91 76204 28920
                      </a>
                      <span className="text-xs text-gray-400 block mt-0.5">Dual support for direct calling and WhatsApp</span>
                    </p>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-red-100 text-[#A61B1B] shrink-0 mt-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm uppercase text-slate-800 tracking-wider">Operating Working Hours</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      <span className="font-semibold block text-slate-800">Monday – Sunday (Open All Days)</span>
                      <span>8:30 AM – 10:00 PM IST</span>
                    </p>
                  </div>
                </div>

                {/* Support Email fallback */}
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-[#A61B1B]/10 text-[#A61B1B] shrink-0 mt-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm uppercase text-slate-800 tracking-wider">Email Inquiry</h4>
                    <a href="mailto:bhaveshkoyande8@gmail.com" className="text-sm text-gray-500 mt-1 hover:underline block">
                      bhaveshkoyande8@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Action Guides Map Button and dial links */}
            <div className="pt-6 grid grid-cols-2 gap-3 shrink-0">
              <a
                href="tel:+917620428920"
                className="inline-flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[#A61B1B] text-white font-sans text-xs font-bold tracking-wider uppercase hover:bg-red-800 shadow-md"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call Store Phone</span>
              </a>

              <a
                href="https://maps.google.com/?q=Kasal+-+Malvan+Rd,+Near+Petrol+Pump,+Dewoolwada,+Malvan,+Maharashtra+416606"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-transparent border border-slate-200 hover:border-slate-400 text-slate-700 font-sans text-xs font-bold tracking-wider uppercase transition-all"
              >
                <Compass className="w-4 h-4 text-[#A61B1B]" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Column 2: Interactive map iframe & inquiry form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Google Maps Embed Location Map */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg h-60 relative">
                {/* Elegant real embedded map pointing directly to Kasal Malvan Rd Maharashtra */}
                <iframe
                  title="Geeta's Masale Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.5791781255554!2d73.689!3d16.14!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc007e0e0e00001%3A0xe0e0e0e0e0e0e0e0!2sKasal%2C%20Maharashtra%20416606!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Custom Inquiry Box Form */}
              <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 space-y-4">
                <h4 className="font-sans font-bold text-lg text-slate-800 uppercase tracking-wide">
                  Send Direct WhatsApp Purchase Inquiry
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhavesh Koyande"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 text-xs px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 text-xs px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                    />
                  </div>
                </div>

                {/* Product option selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">Interested Product</label>
                  <select
                    value={formData.selectedProduct}
                    onChange={(e) => setFormData({ ...formData, selectedProduct: e.target.value })}
                    className="w-full bg-slate-50 text-xs px-3 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] font-medium"
                  >
                    {productOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">Message details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe custom quantity or matching request directions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 text-xs px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A61B1B]"
                  />
                </div>

                {/* Submit trigger button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-[#A61B1B] text-white hover:bg-red-800 text-xs font-bold uppercase transition-all shadow-md cursor-pointer border border-[#A61B1B]"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>SEND WHATSAPP INQUIRY</span>
                </button>

                {/* Message success alert banner */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-mono flex items-center space-x-2 rounded-lg border border-emerald-200/50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Form compiled successfully! Merging text inputs to your WhatsApp app environment...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
