'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AuroraBackground() {
  return (
    <div className="aurora-bg-container">
      {/* Subtle Dot Grid pattern */}
      <div className="dots-grid" />

      {/* Floating Blobs with Framer Motion for premium smoothness */}
      <motion.div
        className="aurora-blob blob-1"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="aurora-blob blob-2"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, -50, -80, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <motion.div
        className="aurora-blob blob-3"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
    </div>
  );
}
