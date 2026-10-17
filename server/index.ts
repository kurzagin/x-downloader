import express, { Request, Response } from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface DownloadRequest {
  url: string;
}

// Helper to extract tweet ID from various X / Twitter URL formats
export function extractTweetId(inputUrl: string): string | null {
  const cleanUrl = inputUrl.trim();
  if (/^\d{1,25}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  const match = cleanUrl.match(/(?:twitter\.com|x\.com|vxtwitter\.com|fxtwitter\.com|fixupx\.com)\/[^/]+\/status\/(\d+)/i);
  return match ? match[1] : null;
}

// Fetch helper with User-Agent
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse response from ${url}: ${data.substring(0, 100)}`));
          }
        });
      }
    );
    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Fallback to yt-dlp if available
async function fetchViaYtDlp(tweetUrl: string): Promise<any> {
  try {
    const { stdout } = await execAsync(`yt-dlp --dump-json --skip-download "${tweetUrl}"`, {
      timeout: 15000,
    });
    const info = JSON.parse(stdout);
    return info;
  } catch (err: any) {
    console.error('yt-dlp fallback error:', err.message || err);
    return null;
  }
}

// 1. Fetch metadata endpoint
app.post('/api/fetch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body as DownloadRequest;

    if (!url) {
      res.status(400).json({ error: 'Please provide an X or Twitter post URL' });
      return;
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      res.status(400).json({ error: 'Invalid X / Twitter post URL. Please enter a valid status link.' });
      return;
    }

    let rawData: any = null;

    // Strategy 1: FxTwitter API v2
    try {
      const fxData = await fetchJson(`https://api.fxtwitter.com/2/status/${tweetId}`);
      if (fxData && (fxData.code === 200 || fxData.status)) {
        rawData = { source: 'fxtwitter_v2', data: fxData.status };
      }
    } catch (e: any) {
      console.warn('Strategy 1 (fxtwitter v2) failed:', e.message);
    }

    // Strategy 2: vxTwitter API
    if (!rawData) {
      try {
        const vxData = await fetchJson(`https://api.vxtwitter.com/Twitter/status/${tweetId}`);
        if (vxData && vxData.tweetID) {
          rawData = { source: 'vxtwitter', data: vxData };
        }
      } catch (e: any) {
        console.warn('Strategy 2 (vxtwitter) failed:', e.message);
      }
    }

    // Strategy 3: yt-dlp
    if (!rawData) {
      const ytData = await fetchViaYtDlp(`https://x.com/i/status/${tweetId}`);
      if (ytData) {
        rawData = { source: 'ytdlp', data: ytData };
      }
    }

    if (!rawData) {
      res.status(404).json({
        error: 'Unable to retrieve tweet data. The post might be private, deleted, or age-restricted.',
      });
      return;
    }

    // Normalize result
    let normalizedTweet: any = null;

    if (rawData.source === 'fxtwitter_v2') {
      const s = rawData.data;
      const mediaList: any[] = [];

      // Photos
      if (s.media?.photos && Array.isArray(s.media.photos)) {
        s.media.photos.forEach((p: any, idx: number) => {
          mediaList.push({
            id: p.id || `photo-${idx + 1}`,
            type: 'photo',
            url: p.url,
            thumbnailUrl: p.url,
            width: p.width,
            height: p.height,
          });
        });
      }

      // Videos
      if (s.media?.videos && Array.isArray(s.media.videos)) {
        s.media.videos.forEach((v: any, idx: number) => {
          const formats = (v.formats || [])
            .filter((f: any) => f.container === 'mp4' || f.url?.includes('.mp4'))
            .map((f: any) => ({
              url: f.url,
              container: f.container || 'mp4',
              quality: f.height ? `${f.height}p` : `${f.width}x${f.height}`,
              width: f.width,
              height: f.height,
              bitrate: f.bitrate,
            }))
            .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

          const bestFormat = formats[0];

          mediaList.push({
            id: v.id || `video-${idx + 1}`,
            type: v.type || 'video',
            url: bestFormat?.url || v.url,
            thumbnailUrl: v.thumbnail_url,
            width: v.width,
            height: v.height,
            duration: v.duration,
            formats: formats.length > 0 ? formats : [{ url: v.url, container: 'mp4', quality: 'Original' }],
          });
        });
      }

      // Mosaic if multiple photos and individual wasn't populated
      if (mediaList.length === 0 && s.media?.mosaic?.formats?.jpeg) {
        mediaList.push({
          id: `mosaic-1`,
          type: 'photo',
          url: s.media.mosaic.formats.jpeg,
          thumbnailUrl: s.media.mosaic.formats.webp || s.media.mosaic.formats.jpeg,
          width: s.media.mosaic.width,
          height: s.media.mosaic.height,
        });
      }

      // Fallback external video
      if (s.media?.external?.url) {
        mediaList.push({
          id: 'external-video',
          type: 'video',
          url: s.media.external.url,
          thumbnailUrl: s.media.external.thumbnail_url,
          width: s.media.external.width,
          height: s.media.external.height,
          formats: [{ url: s.media.external.url, container: 'mp4', quality: 'Default' }],
        });
      }

      normalizedTweet = {
        id: s.id,
        url: s.url || `https://x.com/i/status/${s.id}`,
        text: s.text || '',
        createdAt: s.created_at || new Date((s.created_timestamp || 0) * 1000).toUTCString(),
        likes: s.likes || 0,
        reposts: s.reposts || 0,
        replies: s.replies || 0,
        author: {
          name: s.author?.name || 'X User',
          screenName: s.author?.screen_name || '',
          avatarUrl: s.author?.avatar_url || '',
          verified: s.author?.verification?.verified || false,
        },
        media: mediaList,
      };
    } else if (rawData.source === 'vxtwitter') {
      const v = rawData.data;
      const mediaList: any[] = [];

      if (v.media_extended && Array.isArray(v.media_extended)) {
        v.media_extended.forEach((m: any, idx: number) => {
          if (m.type === 'video' || m.type === 'gif') {
            mediaList.push({
              id: `video-${idx + 1}`,
              type: m.type,
              url: m.url,
              thumbnailUrl: m.thumbnail_url,
              duration: m.duration_millis ? m.duration_millis / 1000 : undefined,
              formats: [{ url: m.url, container: 'mp4', quality: 'Best' }],
            });
          } else {
            mediaList.push({
              id: `photo-${idx + 1}`,
              type: 'photo',
              url: m.url,
              thumbnailUrl: m.url,
            });
          }
        });
      } else if (v.mediaURLs && Array.isArray(v.mediaURLs)) {
        v.mediaURLs.forEach((urlStr: string, idx: number) => {
          const isVideo = urlStr.includes('.mp4');
          mediaList.push({
            id: `media-${idx + 1}`,
            type: isVideo ? 'video' : 'photo',
            url: urlStr,
            thumbnailUrl: urlStr,
          });
        });
      }

      normalizedTweet = {
        id: v.tweetID,
        url: v.tweetURL,
        text: v.text || '',
        createdAt: v.date || '',
        likes: v.likes || 0,
        reposts: v.retweets || 0,
        replies: v.replies || 0,
        author: {
          name: v.user_name || 'X User',
          screenName: v.user_screen_name || '',
          avatarUrl: v.user_profile_image_url || '',
        },
        media: mediaList,
      };
    } else if (rawData.source === 'ytdlp') {
      const y = rawData.data;
      const formats = (y.formats || [])
        .filter((f: any) => f.ext === 'mp4' && f.url)
        .map((f: any) => ({
          url: f.url,
          container: f.ext,
          quality: f.format_note || (f.height ? `${f.height}p` : 'MP4'),
          width: f.width,
          height: f.height,
          bitrate: f.tbr,
        }))
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

      normalizedTweet = {
        id: y.id,
        url: y.webpage_url || `https://x.com/i/status/${y.id}`,
        text: y.description || y.title || '',
        createdAt: y.upload_date || '',
        likes: y.like_count || 0,
        reposts: y.repost_count || 0,
        replies: y.comment_count || 0,
        author: {
          name: y.uploader || 'X User',
          screenName: y.uploader_id || '',
          avatarUrl: '',
        },
        media: [
          {
            id: 'video-1',
            type: 'video',
            url: formats[0]?.url || y.url,
            thumbnailUrl: y.thumbnail,
            duration: y.duration,
            formats: formats.length > 0 ? formats : [{ url: y.url, container: 'mp4', quality: 'Original' }],
          },
        ],
      };
    }

    res.json({ success: true, tweet: normalizedTweet });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message || 'Internal server error while retrieving tweet' });
  }
});

// 2. Direct Proxy Download Stream endpoint to bypass CORS and force file attachment download
app.get('/api/download', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileUrl = req.query.url as string;
    const customFilename = req.query.filename as string;

    if (!fileUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    const client = fileUrl.startsWith('https') ? https : http;

    client.get(
      fileUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://x.com/',
        },
      },
      (upstreamRes) => {
        // Handle redirect
        if (upstreamRes.statusCode && upstreamRes.statusCode >= 300 && upstreamRes.statusCode < 400 && upstreamRes.headers.location) {
          res.redirect(`/api/download?url=${encodeURIComponent(upstreamRes.headers.location)}&filename=${encodeURIComponent(customFilename || 'download')}`);
          return;
        }

        const contentType = upstreamRes.headers['content-type'] || 'application/octet-stream';
        let filename = customFilename || 'x-download';

        // Auto determine extension if missing
        if (!filename.includes('.')) {
          if (contentType.includes('video/mp4') || fileUrl.includes('.mp4')) {
            filename += '.mp4';
          } else if (contentType.includes('image/jpeg') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg')) {
            filename += '.jpg';
          } else if (contentType.includes('image/png') || fileUrl.includes('.png')) {
            filename += '.png';
          } else if (contentType.includes('image/webp') || fileUrl.includes('.webp')) {
            filename += '.webp';
          } else if (contentType.includes('image/gif') || fileUrl.includes('.gif')) {
            filename += '.gif';
          } else {
            filename += '.bin';
          }
        }

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);

        if (upstreamRes.headers['content-length']) {
          res.setHeader('Content-Length', upstreamRes.headers['content-length']);
        }

        upstreamRes.pipe(res);
      }
    ).on('error', (err) => {
      console.error('Download stream error:', err);
      res.status(500).send('Error streaming media file');
    });
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).send(error.message || 'Download failed');
  }
});

// Serve frontend in production if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
