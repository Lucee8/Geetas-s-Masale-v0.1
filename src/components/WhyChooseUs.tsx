/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Sparkles, Sprout, Award, Star, Truck, RefreshCw } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      id: 1,
      title: 'Traditional Malvani Recipes',
      description: 'Our recipes have been preserved across multiple generations, replicating the iconic hand-milled, wood-roasted stove flavors of true Konkan mothers.',
      icon: RefreshCw,
      color: '#FFFFFF'
    },
    {
      id: 2,
      title: 'Premium Sourced Ingredients',
      description: 'We source coriander, fresh garlic, sweet regional peanuts, premium basmati rice, and dry chilies strictly from highly rated local crops in Malvan and Satara.',
      icon: Sprout,
      color: '#FFD2D2'
    },
    {
      id: 3,
      title: 'Authentic Flavor Profiles',
      description: 'Our slow low-temperature griddle roasting prevents spices from burning, locking in natural essential oils for massive aromatic releases during cooking.',
      icon: Sparkles,
      color: '#FFFFFF'
    },
    {
      id: 4,
      title: 'Freshly Packed Products',
      description: 'No massive warehouse backlogs. We blend in short boutique batches weekly and pack immediately in aroma-lock gas flushed pouches.',
      icon: ShieldCheck,
      color: '#FFD2D2'
    },
    {
      id: 5,
      title: 'No Artificial Enhancers',
      description: 'Absolutely NO artificial food colorant additions, NO chemical preservatives, and NO monosodium glutamate (MSG) or heavy synthetic starches.',
      icon: Heart,
      color: '#FFFFFF'
    },
    {
      id: 6,
      title: 'Highly Trusted by Families',
      description: 'Supported by over 15,000+ local coastal families and global food enthusiasts. Proudly displaying 5-star ratings across our regional retail branches.',
      icon: Star,
      color: '#FFD2D2'
    },
    {
      id: 7,
      title: 'Wholesale Supply Options',
      description: 'Equipped to handle contract retail orders for boutique coastal hotels, wedding banquets, city restaurants, and authentic seafood joints.',
      icon: Truck,
      color: '#FFFFFF'
    }
  ];

  return (
    <section id="why" className="py-24 bg-white text-slate-800 relative overflow-hidden border-t border-slate-100 snap-start scroll-mt-20">
      {/* Soft warm spotlight glows in background */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-[#A61B1B]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#A61B1B]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        
         {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/20 text-[#A61B1B] text-xs font-mono tracking-widest uppercase"
          >
            <Award className="w-4 h-4 text-[#A61B1B]" />
            <span>THE GOLD STANDARDS OF QUALITY</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase text-slate-900"
          >
            Why Choose <span className="text-[#A61B1B]">Geeta's Masale?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-600 text-sm sm:text-base font-light font-sans max-w-xl mx-auto block"
          >
            We are not just a local spice shop. We are keepers of ancestral coastal kitchen stories and food heritage.
          </motion.p>
        </div>

        {/* Bento/Grid style display for the features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {points.map((pt, idx) => {
            const IconComponent = pt.icon;
            
            return (
              <motion.div
                key={pt.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  borderColor: 'rgba(166,27,27,0.2)',
                  boxShadow: '0 15px 30px rgba(166,27,27,0.06)'
                }}
                className="p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon rounded shell */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border bg-[#A61B1B]/10 border-[#A61B1B]/20 text-[#A61B1B] shadow-sm cursor-help"
                    title={pt.title}
                  >
                    <IconComponent className="w-6 h-6 animate-pulse" />
                  </div>

                  <h3 className="font-sans text-lg font-bold tracking-tight text-slate-800 uppercase">
                    {pt.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    {pt.description}
                  </p>
                </div>

                {/* Decorative bottom lining indicators */}
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 uppercase">Tested Guarantee</span>
                  <span className="text-emerald-600">✔ VERIFIED</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
