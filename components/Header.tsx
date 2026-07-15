'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeType } from '@/types';

export default function Header() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: ThemeType; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={14} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
    { value: 'system', icon: <Laptop size={14} />, label: 'System' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '32px',
        padding: '8px 0',
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h1
          className="brand-gradient-text"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Linkraa
        </h1>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--text-secondary)',
          }}
        >
          Paste • Preview • Save
        </p>
      </div>

      {/* Floating Theme Switcher Pill */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '99px',
          padding: '3px',
          gap: '2px',
          position: 'relative',
        }}
      >
        {themeOptions.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              aria-label={`Switch to ${opt.label} theme`}
              className="touch-target"
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '99px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                zIndex: 2,
                position: 'relative',
                transition: 'color 0.2s ease',
              }}
            >
              {opt.icon}
              
              {isActive && (
                <motion.div
                  layoutId="activeThemeBg"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--brand-primary)',
                    borderRadius: '99px',
                    zIndex: -1,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.header>
  );
}
