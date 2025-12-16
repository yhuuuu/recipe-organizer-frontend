/**
 * Video platform detection and metadata extraction
 * Supports YouTube, Bilibili, Instagram, and Xiaohongshu
 */

export type VideoPlatform = 'youtube' | 'bilibili' | 'instagram' | 'xiaohongshu' | 'unknown';

export interface VideoMetadata {
  platform: VideoPlatform;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

/**
 * Detects the video platform from URL
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    }
    if (hostname.includes('bilibili.com')) {
      return 'bilibili';
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    }
    if (hostname.includes('xiaohongshu.com') || hostname.includes('xhslink.com')) {
      return 'xiaohongshu';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Extracts video ID from URL
 */
export function extractVideoId(url: string, platform: VideoPlatform): string {
  try {
    const urlObj = new URL(url);

    switch (platform) {
      case 'youtube':
        if (urlObj.hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1);
        }
        return urlObj.searchParams.get('v') || '';
      
      case 'bilibili':
        // Bilibili URL format: https://www.bilibili.com/video/BVxxxxx
        const match = urlObj.pathname.match(/\/video\/(BV\w+)/);
        return match ? match[1] : '';
      
      case 'instagram':
        // Instagram URL format: https://www.instagram.com/p/xxxxx/
        const instaMatch = urlObj.pathname.match(/\/p\/([^\/]+)/);
        return instaMatch ? instaMatch[1] : '';
      
      case 'xiaohongshu':
        // Xiaohongshu URL format varies, extract from path
        const xhsMatch = urlObj.pathname.match(/\/([^\/]+)$/);
        return xhsMatch ? xhsMatch[1] : '';
      
      default:
        return '';
    }
  } catch {
    return '';
  }
}

/**
 * Fetches video metadata using oEmbed or platform APIs
 * Note: This requires a backend proxy for CORS and API keys
 * For Xiaohongshu, we'll try to extract content directly if possible
 */
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata | null> {
  const platform = detectVideoPlatform(url);
  const videoId = extractVideoId(url, platform);

  if (!videoId) {
    return null;
  }

  // For Xiaohongshu, try to fetch page content via backend or use a proxy
  if (platform === 'xiaohongshu') {
    try {
      // Try to fetch via backend API if available
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (backendUrl) {
        const response = await fetch(`${backendUrl}/api/xiaohongshu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (response.ok) {
          const data = await response.json();
          return {
            platform,
            videoId,
            title: data.title || '小红书食谱',
            description: data.description || data.content || '',
            thumbnail: data.thumbnail || getDefaultThumbnail(platform, videoId),
            url,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Xiaohongshu content via backend:', error);
    }
  }

  // For production, you would call your backend API here
  // Backend would handle:
  // - YouTube Data API v3
  // - Bilibili API
  // - Instagram Graph API
  // - Xiaohongshu scraping (if possible)
  
  // For now, return metadata with placeholder description
  // The actual content will be extracted from the page if user provides it
  return {
    platform,
    videoId,
    title: `${platform === 'xiaohongshu' ? '小红书' : '视频'}食谱`,
    description: '请确保已配置后端 API 以提取完整内容，或手动输入食谱信息。',
    thumbnail: getDefaultThumbnail(platform, videoId),
    url,
  };
}

/**
 * Gets default thumbnail URL based on platform
 */
function getDefaultThumbnail(platform: VideoPlatform, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    case 'bilibili':
      return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
    case 'instagram':
      return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
    case 'xiaohongshu':
      return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
    default:
      return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
  }
}

/**
 * Fetches video captions/subtitles
 * This MUST be done via backend due to CORS and API requirements
 */
export async function fetchVideoCaptions(
  _platform: VideoPlatform,
  _videoId: string
): Promise<string> {
  // In production, call your backend API:
  // POST /api/video/captions
  // { platform, videoId }
  
  // Backend would:
  // - YouTube: Use YouTube Data API to get captions
  // - Bilibili: Extract from video page or use API
  // - Instagram: Extract from video metadata
  // - Xiaohongshu: Extract from post content
  
  return 'Video captions will be extracted here. This requires backend implementation.';
}

