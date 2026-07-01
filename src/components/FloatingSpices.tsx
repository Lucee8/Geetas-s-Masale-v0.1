/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface Particle {
  id: number;
  label: string;
  emoji: string;
  top: number;
  left: number;
  scale: number;
  speed: number;
  rotateDir: number;
}

const SPICE_EMOJIS = [
  { emoji: '🌶️', label: 'red-chilli' },
  { emoji: '🌱', label: 'cardamom' },
  { emoji: '🍂', label: 'cinnamon-bark' },
  { emoji: '🌾', label: 'cumin-seeds' },
  { emoji: '🌟', label: 'star-anise' },
  { emoji: '🧄', label: 'garlic-clove' },
  { emoji: '🧅', label: 'onion' },
  { emoji: '🌰', label: 'cashew-kaju' },
];

export default function FloatingSpices() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { scrollY } = useScroll();

  // Gentle parallax factor
  const yTransform = useTransform(scrollY, [0, 5000], [0, -350]);

  useEffect(() => {
    // Generate floating points across columns
    const initialParticles: Particle[] = Array.from({ length: 18 }).map((_, i) => {
      const idx = i % SPICE_EMOJIS.length;
      return {
        id: i,
        label: SPICE_EMOJIS[idx].label,
        emoji: SPICE_EMOJIS[idx].emoji,
        top: Math.round(10 + Math.random() * 80), // percentage-based
        left: Math.round(5 + Math.random() * 90), // percentage-based
        scale: parseFloat((0.8 + Math.random() * 0.9).toFixed(2)),
        speed: parseFloat((15 + Math.random() * 25).toFixed(1)), // animation duration
        rotateDir: Math.random() > 0.5 ? 360 : -360,
      };
    });
    setParticles(initialParticles);
  }, []);

  return (
    <div className="absolute inset-0 max-w-full overflow-hidden pointer-events-none z-10 select-none">
      <motion.div style={{ y: yTransform }} className="relative w-full h-[350vh]">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute text-2xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: 0.14,
            }}
            animate={{
              y: [0, -15, 15, 0],
              x: [0, 10, -10, 0],
              rotate: [0, p.rotateDir / 4, p.rotateDir / 2, p.rotateDir],
            }}
            transition={{
              duration: p.speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          >
            <span style={{ fontSize: `${p.scale * 1.5}rem` }}>{p.emoji}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
