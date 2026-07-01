/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Anchor, Compass, Heart } from 'lucide-react';
import konkanCoastImage from '../assets/images/konkan_coast_1780594634904.png';

export default function Heritage() {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Calculate parallax factor for image translation
  const yBg = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  return (
    <section
      id="heritage"
      ref={containerRef}
      className="relative h-[650px] flex items-center justify-center overflow-hidden bg-white text-slate-800 border-t border-slate-100 snap-start scroll-mt-20"
    >
      {/* Background Parallax Coast Card */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-x-0 -top-40 -bottom-40 z-0 opacity-40"
      >
        <img
          src={konkanCoastImage}
          alt="Malvan Coastline Heritage view"
          className="w-full h-full object-cover filter saturate-[1.1] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        {/* Soft shadow gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-white/90" />
      </motion.div>

      {/* Decorative center grid elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-[#A61B1B]/10" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-[#A61B1B]/10" />

      {/* Core emotional writing overlay card */}
      <div className="relative z-25 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="inline-flex p-4 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/20 text-[#A61B1B] shadow-md mb-2"
        >
          <Anchor className="w-8 h-8 animate-pulse" />
        </motion.div>

        <div className="space-y-4">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs sm:text-sm tracking-[0.3em] font-bold text-[#A61B1B] uppercase"
          >
            THE TASTE OF KONKAN HERITAGE
          </motion.h3>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-slate-900 leading-none"
          >
            Celebrate the <br />
            <span className="text-[#A61B1B]">
              Culinary Spirit of Malvan
            </span>
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed font-sans"
        >
          Deep in the heart of Maharashtra’s stunning Konkan coastline lies Malvan: a historic, wave-washed kingdom famed for its sweeping sea forts, pristine palm forests, and an unforgettable culinary legacy. The local cuisine is a celebration of fire and coconut—of red Sankeshwari chillies hand-roasted in earthenware griddles, blended with rich ground coconut paste, and sharpened by Kokum fruit rinds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.45 }}
          className="pt-4 flex flex-wrap justify-center gap-6 text-xs text-slate-600 font-mono tracking-wider uppercase"
        >
          <span className="flex items-center space-x-1.5 bg-[#A61B1B]/5 px-3.5 py-2 rounded-full border border-[#A61B1B]/15">
            <Heart className="w-4 h-4 text-[#A61B1B] fill-current" />
            <span>Spicy Sea Breezes</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-[#A61B1B]/5 px-3.5 py-2 rounded-full border border-[#A61B1B]/15">
            <Compass className="w-4 h-4 text-[#A61B1B]" />
            <span>Time-Tested Coastal Sourcing</span>
          </span>
        </motion.div>

      </div>
    </section>
  );
}
