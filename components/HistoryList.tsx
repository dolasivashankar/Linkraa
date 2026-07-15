'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Star, Search, Trash2, ChevronRight, 
  Video, Music, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';
import { MediaItem } from '@/types';

interface HistoryListProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onToggleFavorite: (id: string) => void;
}

export default function HistoryList({ 
  items, 
  onSelect, 
  onRemove, 
  onClearAll, 
  onToggleFavorite 
}: HistoryListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items
    .filter((item) => {
      // Tab filter
      if (activeTab === 'favorites' && !item.isFavorite) return false;
      
      // Search query filter
      if (searchQuery.trim()) {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               item.url.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

  const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'video':
        return <Video size={14} color="var(--brand-primary)" />;
      case 'audio':
        return <Music size={14} color="var(--brand-primary)" />;
      case 'image':
        return <ImageIcon size={14} color="var(--brand-primary)" />;
      default:
        return <LinkIcon size={14} color="var(--brand-primary)" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel"
      style={{
        padding: '20px',
        width: '100%',
      }}
    >
      {/* Title & Clear Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="var(--brand-primary)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--brand-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Trash2 size={12} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Tabs Filter Pill */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-glass)',
          borderRadius: '10px',
          padding: '2px',
          gap: '2px',
          marginBottom: '14px',
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            flexGrow: 1,
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: activeTab === 'all' ? 'var(--bg-glass)' : 'transparent',
            color: activeTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'all' ? '1px solid var(--border-glass)' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            flexGrow: 1,
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: activeTab === 'favorites' ? 'var(--bg-glass)' : 'transparent',
            color: activeTab === 'favorites' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'favorites' ? '1px solid var(--border-glass)' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          Favorites ({items.filter(i => i.isFavorite).length})
        </button>
      </div>

      {/* Search Filter Input */}
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '4px 10px',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              width: '100%',
              padding: '4px 0',
            }}
          />
        </div>
      )}

      {/* History Items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  gap: '10px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-glass-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                onClick={() => onSelect(item)}
              >
                {/* Small Thumbnail Preview */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: 'var(--bg-primary)',
                    flexShrink: 0,
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-media.svg';
                    }}
                  />
                </div>

                {/* Description details */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                    }}
                  >
                    {getMediaIcon(item.type)}
                    <span style={{ textTransform: 'capitalize' }}>
                      {item.source}
                    </span>
                  </p>
                </div>

                {/* Right side Actions */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      color: item.isFavorite ? 'var(--brand-danger)' : 'var(--text-muted)',
                      transition: 'color 0.2s',
                    }}
                  >
                    <Star size={13} fill={item.isFavorite ? 'var(--brand-danger)' : 'none'} />
                  </button>

                  <button
                    onClick={() => onRemove(item.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--text-muted)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={13} />
                  </button>

                  <ChevronRight size={14} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty States */}
        {filteredItems.length === 0 && (
          <div
            style={{
              padding: '24px 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <History size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {activeTab === 'favorites' ? 'No favorites saved yet' : 'No recent items found'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '180px' }}>
              {activeTab === 'favorites' 
                ? 'Heart items in the media preview cards to add them here' 
                : 'Analyze media URLs to create an automatic offline activity trail'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
