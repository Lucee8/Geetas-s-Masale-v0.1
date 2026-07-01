/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, X, Camera, Sparkles } from 'lucide-react';
import { GALLERY_PHOTOS } from '../data/storeData';

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('All');

  const categories = ['All', 'Store', 'Interior', 'Products', 'Kaju', 'Cooking'];

  const filteredPhotos = selectedFolder === 'All'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(p => p.category.toLowerCase() === selectedFolder.toLowerCase());

  return (
    <section id="gallery" className="py-24 bg-white text-slate-800 relative overflow-hidden border-t border-slate-100 snap-start scroll-mt-20">
      {/* Decorative vectors */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-[#A61B1B]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#A61B1B]/3 to-transparent rounded-tr-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#A61B1B]/10 border border-[#A61B1B]/15 text-[#A61B1B] text-xs font-mono tracking-widest uppercase"
          >
            <Camera className="w-4 h-4 text-[#A61B1B]" />
            <span>EXQUISITE VISUAL BOUTIQUE</span>
          </motion.div>
          <h2 className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase text-slate-900">
            Geeta’s <span className="text-[#A61B1B]">Photo Gallery</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-light font-sans max-w-xl mx-auto">
            Take a visual tour of our original store in Kasal, the meticulously arranged wood-finished shelves, and mouth-watering culinary preparations.
          </p>
        </div>

        {/* Gallery category filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
          {categories.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-4.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                selectedFolder.toLowerCase() === folder.toLowerCase()
                  ? 'bg-[#A61B1B] text-white border-[#A61B1B] shadow-md font-extrabold'
                  : 'bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        {/* Masonry image layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedPhoto(photo.image)}
                className="group relative rounded-2xl overflow-hidden h-72 border border-slate-200/60 cursor-pointer shadow-lg"
              >
                {/* Image */}
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter saturate-[0.85] group-hover:saturate-[1.1]"
                  referrerPolicy="no-referrer"
                />

                {/* Dark bottom gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Info Text overlays */}
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-[#A61B1B] bg-white px-2 py-0.5 rounded uppercase font-bold">
                      {photo.category}
                    </span>
                    <h3 className="text-sm font-bold uppercase text-white tracking-wide mt-2.5 line-clamp-1">
                      {photo.title}
                    </h3>
                  </div>

                  {/* Zoom Badge icon */}
                  <div className="p-2 rounded-xl bg-[#A61B1B] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 shadow-lg">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Glowing borders highlight */}
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-[#A61B1B]/45 rounded-2xl transition-all duration-300" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Full-width expand modal drawer */}
      <AnimatePresence>
        {selectedPhoto && (
          <div id="gallery-zoom-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop cover glass */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Expanded high-resolution photo card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm z-30 transition-colors cursor-pointer"
                aria-label="Close zoomed image"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={selectedPhoto}
                alt="Enlarged Geeta's Spice gallery photo"
                className="w-full h-auto max-h-[80vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
