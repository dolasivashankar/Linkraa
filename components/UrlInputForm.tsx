'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, ArrowRight, X, Sparkles, PlusCircle } from 'lucide-react';
import { useToast } from './Toast';
import { parseMediaUrl } from '@/lib/urlParser';

interface UrlInputFormProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInputForm({ onAnalyze, isLoading }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus input on slash or Ctrl+L
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Clear on Escape when focused
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setUrl('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        showToast('Pasted from clipboard!', 'success');
        inputRef.current?.focus();
      } else {
        showToast('Clipboard is empty', 'info');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually.', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = url.trim();
    if (!trimmed) {
      showToast('Please paste or enter a URL first', 'info');
      return;
    }

    const parseResult = parseMediaUrl(trimmed);
    if (!parseResult.isValid) {
      showToast('Please enter a valid HTTP/HTTPS URL', 'error');
      return;
    }

    onAnalyze(parseResult.cleanUrl);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      showToast('Please drop links instead of raw local files.', 'info');
      return;
    }

    const droppedUrl = e.dataTransfer.getData('text');
    if (droppedUrl) {
      const parseResult = parseMediaUrl(droppedUrl);
      if (parseResult.isValid) {
        setUrl(parseResult.cleanUrl);
        showToast('Link dropped successfully!', 'success');
        onAnalyze(parseResult.cleanUrl);
      } else {
        showToast('Invalid URL dropped', 'error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel"
      style={{
        padding: '24px',
        width: '100%',
        marginBottom: '24px',
        position: 'relative',
        boxShadow: isFocused ? '0 8px 30px var(--accent-glow)' : 'var(--shadow-md)',
        borderColor: isFocused ? 'var(--brand-primary)' : 'var(--border-glass)',
        overflow: 'hidden',
      }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Glow effect on focus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header row in form */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Analyze Media URL
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Press <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-glass)', fontFamily: 'monospace' }}>/</kbd> to focus
            </span>
          </div>

          {/* URL Input Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '14px',
              padding: '6px 12px',
              gap: '8px',
              transition: 'border-color 0.2s',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste media link (e.g. YouTube, direct mp4/mp3)..."
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              style={{
                flexGrow: 1,
                padding: '8px 0',
                color: 'var(--text-primary)',
                fontSize: '14px',
                width: '100%',
              }}
            />

            {/* Clear Button */}
            <AnimatePresence>
              {url && (
                <motion.button
                  type="button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => setUrl('')}
                  style={{
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '50%',
                    background: 'var(--border-glass)',
                  }}
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="touch-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Clipboard size={14} />
              <span>Paste</span>
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary touch-target"
            style={{
              width: '100%',
              opacity: isLoading || !url.trim() ? 0.65 : 1,
              cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
              height: '48px',
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Analyzing Link...</span>
              </div>
            ) : (
              <>
                <span>Analyze Link</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Drag & Drop Visual overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(99, 102, 241, 0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#FFFFFF',
              zIndex: 10,
            }}
          >
            <PlusCircle size={40} className="animate-pulse" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Drop your Link here</h3>
            <p style={{ fontSize: '13px', opacity: 0.8 }}>We'll automatically extract metadata</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
}
