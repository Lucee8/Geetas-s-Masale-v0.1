/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MoveRight } from 'lucide-react';
import { CATEGORIES } from '../data/storeData';

interface HeroProps {
  onExploreClick: () => void;
  onWhatsAppClick: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export default function Hero({ onExploreClick, onWhatsAppClick, onSelectCategory }: HeroProps) {
  // Stagger wrapper settings for clean visual entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 18 } 
    },
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#FAF9F6] pt-24 sm:pt-32 pb-16 snap-start scroll-mt-20 border-b border-slate-100"
    >
      {/* Subtle background color gradients for elegant depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-1/4 w-[350px] h-[350px] rounded-full bg-[#A61B1B]/4 blur-[130px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D21F1F]/3 blur-[140px]" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Block: Brand Statement & Typography */}
        <div className="flex flex-col items-center text-center py-6 sm:py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 sm:space-y-6 max-w-4xl"
          >
            {/* Title / Hero Headline */}
            <div className="space-y-3 sm:space-y-4">
              <motion.h1 
                variants={itemVariants}
                className="font-sans text-3xl sm:text-5xl md:text-[54px] font-black tracking-tight text-[#0F172A] leading-[1.1] uppercase"
              >
                HANDMADE AUTHENTIC <br className="hidden sm:inline" />
                <span className="text-[#A61B1B]">MALVANI MASALAS</span> & <span className="text-slate-500">PURE KONKANI MEVA</span>
              </motion.h1>

              {/* Minimal Warm Description */}
              <motion.p 
                variants={itemVariants}
                className="text-slate-600 text-sm sm:text-base font-normal font-sans max-w-xl sm:max-w-2xl mx-auto leading-relaxed"
              >
                From the stove of Sri Geeta’s coastal kitchen, we hand-roast original Sunday griddle spices, mill natural healthy grain flours (Pith), and pack export-grade coastal cashews. No artificial preservatives, colors, or heavy synthetic starches. Just pure Konkan culinary spirit.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* Departments & Custom Store Category Section */}
        {/* ------------------------------------------------------------------------- */}
        <div id="categories" className="mt-8 sm:mt-12 space-y-6 sm:space-y-8 scroll-mt-20">
          
          {/* Categories Title block */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[9px] font-mono tracking-[0.4em] font-black text-[#A61B1B] uppercase block">
              OUR DEPARTMENTS
            </span>
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase text-slate-900">
              Signature <span className="text-[#A61B1B]">Store Categories</span>
            </h2>
            <div className="w-10 h-0.5 bg-[#A61B1B]/80 mx-auto rounded-full" />
            <p className="text-slate-500 text-[11px] sm:text-xs font-normal font-sans max-w-lg mx-auto leading-relaxed">
              Select a classification below to filter the shelf and explore specific ingredients, shelf life, and traditional recipes.
            </p>
          </div>

          {/* Minimal 2-Column Mobile & 5-Column Desktop Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 pt-2">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{
                  y: -6,
                  borderColor: 'rgba(166,27,27,0.3)',
                }}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative h-56 sm:h-80 rounded-2xl overflow-hidden border border-slate-200/60 p-3 sm:p-5 flex flex-col justify-end cursor-pointer bg-white transition-all duration-300 shadow-sm"
              >
                {/* Backdrop image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Dark premium gradient overlay mask */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />
                </div>

                {/* Card details */}
                <div className="relative z-20 space-y-1.5 sm:space-y-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 text-[8px] font-mono tracking-widest uppercase">
                    {cat.count} AVAILABLE
                  </span>

                  <h3 className="font-sans text-xs sm:text-base font-black tracking-tight text-white group-hover:text-rose-200 transition-colors uppercase leading-snug">
                    {cat.name}
                  </h3>

                  <p className="text-[9px] sm:text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* MoveRight inline icon indicator */}
                  <div className="pt-1.5 flex items-center text-rose-200 text-[9px] font-mono tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                    <span className="uppercase text-[8px] font-bold mr-1 sm:inline hidden">Shop Category</span>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>

                {/* Accent line effect */}
                <div className="absolute left-0 bottom-0 top-0 w-1 bg-gradient-to-b from-[#A61B1B] to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

        </div>

      </div>

    </section>
  );
}
