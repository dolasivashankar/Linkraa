export type MediaSource = 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'soundcloud' | 'direct' | 'unknown';

export interface ParsedUrlInfo {
  isValid: boolean;
  source: MediaSource;
  cleanUrl: string;
  isDirectFile: boolean;
  fileExtension?: string;
}

export function parseMediaUrl(urlStr: string): ParsedUrlInfo {
  let trimmed = urlStr.trim();
  if (!trimmed) {
    return { isValid: false, source: 'unknown', cleanUrl: '', isDirectFile: false };
  }

  // Extract URL if the string contains text mixed with a URL (e.g., from mobile "Share -> Copy Link")
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    trimmed = urlMatch[0];
  } else if (!/^https?:\/\//i.test(trimmed)) {
    // If no http/https found anywhere, assume the whole thing is a domain/path and prepend https://
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // Check direct file extensions
    const directFileExtensions = ['mp4', 'webm', 'ogg', 'mp3', 'wav', 'm4a', 'aac', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const fileExtMatch = lastSegment.match(/\.([a-z0-9]+)(?:$|\?)/i);
    const ext = fileExtMatch ? fileExtMatch[1].toLowerCase() : undefined;

    const isDirectFile = ext ? directFileExtensions.includes(ext) : false;

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { isValid: true, source: 'youtube', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }
    if (host.includes('tiktok.com')) {
      return { isValid: true, source: 'tiktok', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }
    if (host.includes('instagram.com')) {
      return { isValid: true, source: 'instagram', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }
    if (host.includes('vimeo.com')) {
      return { isValid: true, source: 'vimeo', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }
    if (host.includes('soundcloud.com')) {
      return { isValid: true, source: 'soundcloud', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }

    if (isDirectFile) {
      return { isValid: true, source: 'direct', cleanUrl: parsed.toString(), isDirectFile, fileExtension: ext };
    }

    // Default to unknown, but could still be a valid web page URL
    return { isValid: true, source: 'unknown', cleanUrl: parsed.toString(), isDirectFile };
  } catch (err) {
    console.error('URL Parsing Error:', err, 'for URL:', trimmed);
    return { isValid: false, source: 'unknown', cleanUrl: '', isDirectFile: false };
  }
}
