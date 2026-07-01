/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Users, Flame, BookOpen, ChevronRight, X, Sparkles } from 'lucide-react';
import { Recipe } from '../types';
import { RECIPES } from '../data/storeData';

export default function RecipeSection() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <section id="recipes" className="py-24 bg-white text-slate-800 relative snap-start scroll-mt-20">
      {/* Wave bottom decoration */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#A61B1B]/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/30 text-[#A61B1B] text-xs font-mono tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4 text-[#A61B1B]" />
            <span>CULINARY ACADEMY INSPIRATIONS</span>
          </motion.div>
          
          <h2 className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase">
            Malvani <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A61B1B] to-[#D21F1F]">Recipe Guides</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-light font-sans max-w-xl mx-auto">
            Recreate coastal magic at home! Learn how our exact spice packets elevate daily dinners into premium gourmet events.
          </p>
        </div>

        {/* Recipe Grid cards display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RECIPES.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              onClick={() => setSelectedRecipe(recipe)}
              className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 flex flex-col justify-between cursor-pointer h-[460px] transform transition-transform"
            >
              {/* Photo top section with hover preview reveal */}
              <div className="relative h-60 overflow-hidden shrink-0">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />

                {/* Difficulty level badge */}
                <div className={`absolute top-4 left-4 text-[10px] font-mono tracking-widest font-black uppercase px-2.5 py-1 rounded-full text-white shadow-sm ${
                  recipe.difficulty === 'Easy' ? 'bg-emerald-600' : recipe.difficulty === 'Medium' ? 'bg-amber-600' : 'bg-rose-700'
                }`}>
                  {recipe.difficulty} Level
                </div>

                 {/* Active hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#A61B1B]/95 via-[#A61B1B]/70 to-transparent opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-xs text-rose-100 line-clamp-3 leading-relaxed font-sans">
                    {recipe.description}
                  </p>
                </div>
              </div>

              {/* Text info and details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Preparation time / serving guides */}
                  <div className="flex items-center space-x-4 text-xs font-mono text-gray-400 uppercase">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{recipe.prepTime} Prep</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Serves {recipe.servings}</span>
                    </span>
                  </div>

                  <h3 className="font-sans text-xl font-bold tracking-tight text-slate-800 group-hover:text-[#A61B1B] transition-colors leading-tight uppercase line-clamp-2">
                    {recipe.title}
                  </h3>
                </div>

                {/* Bottom read more guideline */}
                <div className="pt-4 border-t border-gray-100 mt-6 flex items-center justify-between text-xs font-mono tracking-wider font-bold text-[#A61B1B] uppercase group-hover:text-red-700">
                  <span className="flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Show Cook Prep Instruction</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

      {/* Advanced Recipe Instruction Pop-up overlay drawer */}
      <AnimatePresence>
        {selectedRecipe && (
          <div id="recipe-drawer-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Soft dark glass overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-[#A61B1B]/40 backdrop-blur-sm"
            />

            {/* Popup instruction container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              
              {/* Close helper button outside */}
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-slate-800 z-30 cursor-pointer"
                aria-label="Close recipes"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Card top branding image */}
              <div className="relative h-48 bg-[#A61B1B] flex items-end p-6 md:p-8">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                
                <div className="relative z-10 text-white">
                  <span className="text-[10px] font-mono tracking-widest text-[#FFF5E6]/90 uppercase">Traditional Recipe Collection</span>
                  <h3 className="font-sans text-2xl md:text-3xl font-black uppercase text-white mt-1 leading-tight">
                    {selectedRecipe.title}
                  </h3>
                </div>
              </div>

              {/* Sub header credentials detail */}
              <div className="bg-[#FAF9F6] px-6 md:px-8 py-3 flex flex-wrap gap-6 border-b border-rose-100 text-xs font-mono text-slate-600">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#A61B1B]" />
                  <span>Prep: {selectedRecipe.prepTime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-[#A61B1B]" />
                  <span>Cook: {selectedRecipe.cookTime}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-[#A61B1B]" />
                  <span>Servings: {selectedRecipe.servings} people</span>
                </span>
                <span className="ml-auto flex items-center space-x-1 text-emerald-700 font-bold">
                  <span>Difficulty: {selectedRecipe.difficulty}</span>
                </span>
              </div>

              {/* Ingredients & Steps columns split */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-y-auto max-h-[50vh]">
                
                {/* Ingredients box */}
                <div className="md:col-span-4 space-y-4">
                  <h4 className="text-xs font-mono tracking-wider font-extrabold uppercase text-[#A61B1B] border-b border-red-100 pb-2">
                    Ingredients Checklist
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600 font-sans list-disc pl-4 leading-relaxed">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="hover:text-black transition-colors">
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step guide details list */}
                <div className="md:col-span-8 space-y-4">
                  <h4 className="text-xs font-mono tracking-wider font-extrabold uppercase text-[#A61B1B] border-b border-rose-100 pb-2">
                    Preparation Steps
                  </h4>
                  <ol className="space-y-3">
                    {selectedRecipe.steps.map((step, idx) => (
                      <li key={idx} className="flex space-x-3 text-xs text-gray-700 leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-slate-100">
                        <span className="font-extrabold text-sm text-[#A61B1B] font-mono shrink-0">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

              {/* Bottom footer bar with order inquiry CTA triggers */}
              <div className="bg-gray-50 px-6 md:px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-sans tracking-wide">
                  Have everything ready to cook? Order premium Geeta's Masale today!
                </span>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#A61B1B] text-white hover:bg-red-800 text-xs font-bold uppercase transition-all shadow-md cursor-pointer"
                >
                  Close Recipe Guide
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
