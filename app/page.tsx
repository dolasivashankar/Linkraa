'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from '@/components/AuroraBackground';
import Header from '@/components/Header';
import UrlInputForm from '@/components/UrlInputForm';
import MediaPreviewCard from '@/components/MediaPreviewCard';
import HistoryList from '@/components/HistoryList';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MediaItem } from '@/types';
import { useToast } from '@/components/Toast';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedItem, setAnalyzedItem] = useState<MediaItem | null>(null);
  const [history, setHistory] = useLocalStorage<MediaItem[]>('linkraa-history', []);
  const { showToast } = useToast();

  const handleAnalyze = async (targetUrl: string) => {
    setIsLoading(true);
    setAnalyzedItem(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze URL');
      }

      const item: MediaItem = await res.json();
      setAnalyzedItem(item);

      // Save to local storage history list (shifting duplicates to front)
      setHistory((prevHistory) => {
        const cleaned = prevHistory.filter((h) => h.url !== item.url);
        return [item, ...cleaned];
      });

      showToast('Media analyzed successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error processing link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    // Toggle in history list
    setHistory((prevHistory) =>
      prevHistory.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );

    // Toggle in currently analyzed item if matching
    setAnalyzedItem((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, isFavorite: !prev.isFavorite };
      }
      return prev;
    });

    showToast('Preferences updated', 'success');
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    
    // Clear preview if removing the active item
    if (analyzedItem && analyzedItem.id === id) {
      setAnalyzedItem(null);
    }
    showToast('Item removed from history', 'info');
  };

  const handleClearAllHistory = () => {
    if (confirm('Are you sure you want to clear your local history?')) {
      setHistory([]);
      setAnalyzedItem(null);
      showToast('Local history cleared', 'info');
    }
  };

  const handleSelectHistoryItem = (item: MediaItem) => {
    setAnalyzedItem(item);
    // Smooth scroll back to top of the screen on mobile/desktop
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Loaded item from history', 'info');
  };

  const handleDownloadComplete = (item: MediaItem) => {
    // We can update the log in local storage if needed (e.g. increments download counter)
    console.log('Successfully completed saving:', item.title);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Visual Canvas Backgrounds */}
      <AuroraBackground />

      {/* Main Responsive App Container */}
      <div className="app-container">
        
        {/* Brand Header */}
        <Header />

        {/* Hero Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <h2 
            style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.03em',
              lineHeight: '1.2',
              marginBottom: '8px'
            }}
          >
            Media Preview & <span className="brand-gradient-text">Save</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
            Paste any public video, audio, or direct URL to view details, inspect qualities, and download content instantly.
          </p>
        </motion.div>

        {/* Input box */}
        <UrlInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Main Content Area (Loading Skeleton or Preview Panel) */}
        <div style={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            
            {/* Loading shimmer skeleton */}
            {isLoading && (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel"
                style={{ padding: '20px', width: '100%', marginBottom: '24px' }}
              >
                {/* Header skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="shimmer" style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <div className="shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                  </div>
                </div>

                {/* Aspect ratio video box skeleton */}
                <div 
                  className="shimmer" 
                  style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: '12px', marginBottom: '20px' }} 
                />

                {/* Info details skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div className="shimmer" style={{ width: '70%', height: '16px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
                </div>

                {/* Button skeleton */}
                <div className="shimmer" style={{ width: '100%', height: '46px', borderRadius: '12px' }} />
              </motion.div>
            )}

            {/* Active Analyzed Preview Card */}
            {analyzedItem && !isLoading && (
              <MediaPreviewCard
                key={`preview-${analyzedItem.id}`}
                item={analyzedItem}
                onToggleFavorite={handleToggleFavorite}
                onDownloadComplete={handleDownloadComplete}
              />
            )}
          </AnimatePresence>
        </div>

        {/* History database list */}
        <HistoryList
          items={history}
          onSelect={handleSelectHistoryItem}
          onRemove={handleRemoveHistoryItem}
          onClearAll={handleClearAllHistory}
          onToggleFavorite={handleToggleFavorite}
        />

      </div>
    </div>
  );
}
