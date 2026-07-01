/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { TESTIMONIALS } from '../data/storeData';

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>(TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);

  // States for write a review modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revLoc, setRevLoc] = useState('');
  const [revProd, setRevProd] = useState('Malvani Sunday Special');
  const [revMsg, setRevMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Load reviews from API with fallback to static testimonials
  useEffect(() => {
    fetch('/api/reviews')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API failed');
      })
      .then(data => {
        if (data && data.length > 0) {
          setReviews(data);
        }
      })
      .catch(err => {
        console.log("Using static mock testimonials fallback:", err);
      });
  }, []);

  // Auto-scroll effect every 5.5 seconds
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [reviews]);

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revMsg.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: revName,
          rating: Number(revRating),
          location: revLoc || 'India',
          product: revProd,
          review: revMsg
        })
      });
      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => {
          setShowFormModal(false);
          setSuccessMsg(false);
          setRevName('');
          setRevLoc('');
          setRevMsg('');
          setRevRating(5);
        }, 2200);
      }
    } catch (err) {
      console.error("Failed to post user review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-24 bg-[#FAF9F6] text-slate-800 relative overflow-hidden snap-start scroll-mt-20">
      {/* Absolute decorative backdrops */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#A61B1B]/5 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#A61B1B]/5 to-transparent rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/30 text-[#A61B1B] text-xs font-mono tracking-widest uppercase"
          >
            <Star className="w-4 h-4 text-[#A61B1B] fill-current" />
            <span>COMMUNITY SENTIMENT & RATINGS</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase"
          >
            Trusted by Cooks <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A61B1B] to-[#D21F1F]">& Food Critics</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-500 text-sm font-light font-sans"
          >
            Hear from native Malvanites, Pune foodies, and resort chefs who trust their kitchens with Geeta's Masale.
          </motion.p>
        </div>

        {/* Carousel slide container inside glassmorphism shell */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          
          <div className="absolute inset-0 bg-[#A61B1B]/5 rounded-3xl blur-xl" />

          {/* Premium Glassmorphism Card */}
          <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/65 min-h-[380px] flex flex-col justify-between">
            <span className="text-6xl text-[#A61B1B]/15 font-serif absolute top-6 left-6 select-none leading-none">“</span>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6 relative z-10"
              >
                {/* 5 Stars display */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Number(reviews[activeIndex]?.rating || 5) }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                  ))}
                </div>

                {/* Feedback prose */}
                <p className="text-lg sm:text-xl font-sans italic text-slate-800 leading-relaxed font-light">
                  "{reviews[activeIndex]?.review}"
                </p>

                {/* User author details */}
                <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-[#A61B1B]/10 flex items-center justify-center text-[#A61B1B]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-base text-slate-800 uppercase tracking-wide">
                      {reviews[activeIndex]?.name}
                    </h4>
                    <p className="text-xs font-mono text-gray-400 uppercase">
                      Location: {reviews[activeIndex]?.location || 'India'}
                    </p>
                  </div>

                  {/* Certified Product Purchased Badge */}
                  <div className="ml-auto hidden sm:block">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#A61B1B]/10 text-[#A61B1B] text-[10px] font-mono uppercase font-black">
                      VERIFIED: {reviews[activeIndex]?.product || 'Geeta\'s Masale'}
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls Indicators of bottom */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 relative z-10">
              {/* Dots tracker indicators */}
              <div className="flex items-center space-x-2">
                {reviews.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveIndex(dotIdx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === dotIdx ? 'w-8 bg-[#A61B1B]' : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Show testimonial ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Slider Controls Arrows + Post CTA */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFormModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#A61B1B] text-white hover:bg-red-800 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-[0_4px_12px_rgba(166,27,27,0.15)] cursor-pointer"
                >
                  Write Review
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    aria-label="Previous Review"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    aria-label="Next Review"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Modal form overlay for customer reviews */}
        <AnimatePresence>
          {showFormModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowFormModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-sans text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                  Share Your Spice Story
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-sans font-light">
                  Your feedback helps us remain Kasal's finest. Reviews undergo moderations.
                </p>

                {successMsg ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center text-emerald-600 font-sans"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      ✔
                    </div>
                    <p className="font-bold text-base uppercase tracking-wider">Review Submitted!</p>
                    <p className="text-xs text-slate-500 mt-1">Thank you. It will show up after moderation.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={revName}
                        onChange={(e) => setRevName(e.target.value)}
                        placeholder="e.g. Rohini Parab"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Location</label>
                        <input
                          type="text"
                          value={revLoc}
                          onChange={(e) => setRevLoc(e.target.value)}
                          placeholder="e.g. Pune, Kothrud"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Rating</label>
                        <select
                          value={revRating}
                          onChange={(e) => setRevRating(Number(e.target.value))}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800 uppercase font-bold"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                          <option value={3}>⭐⭐⭐ (3/5)</option>
                          <option value={2}>⭐⭐ (2/5)</option>
                          <option value={1}>⭐ (1/5)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">What did you buy?</label>
                      <input
                        type="text"
                        value={revProd}
                        onChange={(e) => setRevProd(e.target.value)}
                        placeholder="e.g. Sunday Masala, Parboiled Rice"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">Your Cook Review</label>
                      <textarea
                        required
                        rows={3}
                        value={revMsg}
                        onChange={(e) => setRevMsg(e.target.value)}
                        placeholder="Write dynamic feedback here..."
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A61B1B] text-slate-800 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-[#A61B1B] text-white hover:bg-red-800 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'SUBMITTING...' : 'POST USER TESTIMONIAL'}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
