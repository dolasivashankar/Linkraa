export interface MediaFormat {
  id: string;
  quality: string;
  ext: string;
  size?: number; // size in bytes
  type: 'video' | 'audio' | 'image';
  downloadUrl?: string; // custom download URL if available
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration?: string; // formatting: "MM:SS" or "HH:MM:SS"
  size?: number; // size in bytes of default format
  source: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'soundcloud' | 'direct' | 'unknown';
  type: 'video' | 'audio' | 'image' | 'unknown';
  formats: MediaFormat[];
  isFavorite?: boolean;
  createdAt: number;
}

export type ThemeType = 'dark' | 'light' | 'system';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
