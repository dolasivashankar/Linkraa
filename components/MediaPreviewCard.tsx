'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Music, Download, CheckCircle, RefreshCw, Copy, 
  Share2, Heart, Clock, HardDrive, AlertTriangle 
} from 'lucide-react';
import { MediaItem, MediaFormat } from '@/types';
import { useToast } from './Toast';

interface MediaPreviewCardProps {
  item: MediaItem;
  onToggleFavorite: (id: string) => void;
  onDownloadComplete: (item: MediaItem) => void;
}

export default function MediaPreviewCard({ item, onToggleFavorite, onDownloadComplete }: MediaPreviewCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<string>('0 KB/s');
  const [eta, setEta] = useState<string>('estimating...');
  const { showToast } = useToast();

  // Reset selected format when item changes
  useEffect(() => {
    if (item.formats && item.formats.length > 0) {
      // Prefer highest video quality, or first format
      const videoFormats = item.formats.filter(f => f.type === 'video');
      if (videoFormats.length > 0) {
        setSelectedFormat(videoFormats[0]);
      } else {
        setSelectedFormat(item.formats[0]);
      }
    } else {
      setSelectedFormat(null);
    }
    setDownloadState('idle');
    setProgress(0);
  }, [item]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    showToast('Source link copied to clipboard!', 'success');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Download ${item.title} using Linkraa!`,
          url: item.url,
        });
      } catch (err) {
        console.warn('Share cancelled or failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?url=${encodeURIComponent(item.url)}`);
      showToast('Share link copied to clipboard!', 'success');
    }
  };

  const startDownload = async () => {
    if (!selectedFormat) {
      showToast('Please select a format', 'info');
      return;
    }

    setDownloadState('downloading');
    setProgress(0);
    setSpeed('0 KB/s');
    setEta('estimating...');

    const downloadUrl = selectedFormat.downloadUrl || `/api/proxy?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(item.title)}`;

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download request failed');

      const reader = response.body?.getReader();
      const contentLengthStr = response.headers.get('Content-Length');
      const totalBytes = contentLengthStr ? parseInt(contentLengthStr, 10) : 0;

      if (!reader) {
        throw new Error('Readable stream not supported by browser');
      }

      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];
      const startTime = Date.now();
      let lastUpdate = startTime;
      let lastBytes = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const currentTime = Date.now();
        
        // Calculate progress percentage
        if (totalBytes > 0) {
          const currentProgress = Math.round((receivedBytes / totalBytes) * 100);
          setProgress(currentProgress);

          // Update speed & ETA every 500ms
          if (currentTime - lastUpdate > 500) {
            const timeDiff = (currentTime - lastUpdate) / 1000; // seconds
            const bytesDiff = receivedBytes - lastBytes;
            const currentSpeedBytes = bytesDiff / timeDiff; // bytes/sec

            // Format speed
            if (currentSpeedBytes > 1024 * 1024) {
              setSpeed(`${(currentSpeedBytes / (1024 * 1024)).toFixed(1)} MB/s`);
            } else {
              setSpeed(`${(currentSpeedBytes / 1024).toFixed(0)} KB/s`);
            }

            // Estimate time remaining (ETA)
            const remainingBytes = totalBytes - receivedBytes;
            const secondsRemaining = currentSpeedBytes > 0 ? Math.round(remainingBytes / currentSpeedBytes) : 0;
            
            if (secondsRemaining > 60) {
              const minutes = Math.floor(secondsRemaining / 60);
              const secs = secondsRemaining % 60;
              setEta(`${minutes}m ${secs}s`);
            } else {
              setEta(`${secondsRemaining}s`);
            }

            lastUpdate = currentTime;
            lastBytes = receivedBytes;
          }
        } else {
          // If content length is unknown, show cumulative downloaded size
          const mbDownloaded = (receivedBytes / (1024 * 1024)).toFixed(1);
          setSpeed(`${mbDownloaded} MB loaded`);
          setEta('unknown');
          setProgress(prev => (prev + 1) % 100); // Pulse effect
        }
      }

      // Convert chunk buffers into a file Blob
      const blob = new Blob(chunks as any, { type: response.headers.get('Content-Type') || undefined });
      const downloadBlobUrl = URL.createObjectURL(blob);

      // Create download trigger element
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadBlobUrl;
      
      const fileExt = selectedFormat.ext || 'mp4';
      let cleanFilename = item.title;
      if (!cleanFilename.endsWith(`.${fileExt}`)) {
        cleanFilename = `${cleanFilename}.${fileExt}`;
      }

      downloadLink.download = cleanFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadBlobUrl);

      setDownloadState('completed');
      setProgress(100);
      showToast('Media downloaded successfully!', 'success');
      onDownloadComplete(item);
    } catch (err) {
      console.error('Download stream error:', err);
      setDownloadState('failed');
      showToast('Download failed. Please try again.', 'error');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="glass-panel"
      style={{
        padding: '20px',
        width: '100%',
        marginBottom: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Action Header (Favorite, Copy, Share) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'var(--brand-primary)',
            color: '#FFFFFF',
            letterSpacing: '0.05em',
          }}
        >
          {item.source === 'direct' ? 'Direct File' : item.source.toUpperCase()}
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="btn-icon touch-target"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
            aria-label="Toggle Favorite"
          >
            <Heart 
              size={15} 
              color={item.isFavorite ? 'var(--brand-danger)' : 'var(--text-secondary)'} 
              fill={item.isFavorite ? 'var(--brand-danger)' : 'none'} 
            />
          </button>
          <button
            onClick={handleCopyLink}
            className="btn-icon touch-target"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
            aria-label="Copy Source Link"
          >
            <Copy size={15} color="var(--text-secondary)" />
          </button>
          <button
            onClick={handleShare}
            className="btn-icon touch-target"
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
            aria-label="Share Link"
          >
            <Share2 size={15} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Main Info (Thumbnail + Info) */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexDirection: 'column' }}>
        {/* Aspect Ratio Video Box */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-media.svg';
            }}
          />
          
          {item.duration && (
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={10} />
              {item.duration}
            </span>
          )}
        </div>

        {/* Title & Metadata Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </h3>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={12} />
              {formatSize(item.size)}
            </span>
          </div>
        </div>
      </div>

      {/* Format Selection (Pill Grid) */}
      {item.formats && item.formats.length > 0 && downloadState === 'idle' && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Select Download Format
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {item.formats.map((fmt) => {
              const isSelected = selectedFormat?.id === fmt.id;
              const isAudio = fmt.type === 'audio';

              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    {isAudio ? <Music size={13} color="var(--brand-primary)" /> : <Video size={13} color="var(--brand-primary)" />}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fmt.quality}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {fmt.ext.toUpperCase()} • {formatSize(fmt.size)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Downloader Interactive View */}
      <div style={{ marginTop: '12px' }}>
        
        {/* Downloading state */}
        {downloadState === 'downloading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Downloading to browser storage...</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
            </div>

            {/* Progress Bar Container */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: '99px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--brand-primary) 0%, #a5b4fc 100%)',
                  borderRadius: '99px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Speed: {speed}</span>
              <span>ETA: {eta}</span>
            </div>
          </div>
        )}

        {/* Completed state */}
        {downloadState === 'completed' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 0',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={36} color="var(--brand-accent)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Download Ready
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Your file was packaged and saved to your system's download folder.
            </p>
            <button
              onClick={() => setDownloadState('idle')}
              className="btn-secondary touch-target"
              style={{ marginTop: '8px', padding: '8px 16px', fontSize: '12px' }}
            >
              <RefreshCw size={12} />
              <span>Download Again</span>
            </button>
          </motion.div>
        )}

        {/* Failed state */}
        {downloadState === 'failed' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 0',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={36} color="var(--brand-danger)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Download Interrupted
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              We encountered an issue proxying the media stream.
            </p>
            <button
              onClick={startDownload}
              className="btn-primary touch-target"
              style={{ marginTop: '8px', padding: '8px 16px', fontSize: '12px' }}
            >
              <RefreshCw size={12} />
              <span>Retry Download</span>
            </button>
          </motion.div>
        )}

        {/* Action Button: Trigger Download */}
        {downloadState === 'idle' && (
          <button
            onClick={startDownload}
            className="btn-primary touch-target"
            style={{
              width: '100%',
              height: '46px',
            }}
          >
            <Download size={16} />
            <span>Save to device</span>
          </button>
        )}

      </div>
    </motion.div>
  );
}
