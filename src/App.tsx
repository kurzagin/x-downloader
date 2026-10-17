import React, { useState } from 'react';
import { TweetInfo, MediaItem } from './types';
import { 
  Download, 
  ExternalLink, 
  Image as ImageIcon, 
  Video, 
  Heart, 
  Repeat, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  Film
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweet, setTweet] = useState<TweetInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<{ [key: string]: string }>({});

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setTweet(null);

    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch post media');
      }

      setTweet(data.tweet);
      const initialFormats: { [key: string]: string } = {};
      data.tweet.media?.forEach((m: MediaItem) => {
        if (m.formats && m.formats.length > 0) {
          initialFormats[m.id] = m.formats[0].url;
        } else {
          initialFormats[m.id] = m.url;
        }
      });
      setSelectedFormat(initialFormats);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching media.');
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = (media: MediaItem) => {
    const downloadMediaUrl = selectedFormat[media.id] || media.url;
    const isVideo = media.type === 'video' || media.type === 'gif';
    const ext = isVideo ? 'mp4' : 'jpg';
    const filename = `x_${tweet?.author?.screenName || 'post'}_${media.id}.${ext}`;
    return `/api/download?url=${encodeURIComponent(downloadMediaUrl)}&filename=${encodeURIComponent(filename)}`;
  };

  const copyUrl = () => {
    if (tweet?.url) {
      navigator.clipboard.writeText(tweet.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleTweets = [
    { label: 'Jack (First Tweet)', url: 'https://x.com/jack/status/20' },
    { label: 'Sample Video Post', url: 'https://x.com/Twitter/status/1603831888195436544' },
    { label: 'SpaceX Launch', url: 'https://x.com/SpaceX/status/1768262299868770747' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10">
      {/* Kurzagin Style Top Nav */}
      <header className="sticky top-0 z-50 h-12 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-[#2a2a30] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 font-mono text-[0.8rem] text-[#e2ded6] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c49368]" />
            <span className="font-medium">X-DOWNLOADER</span>
            <span className="text-[0.65rem] text-[#706c66] font-normal hidden sm:inline">メディア・ダウンローダー</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[0.68rem] text-[#b0aca4]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#1f1f24] border border-[#2a2a30]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6a9a6a]" />
            ONLINE
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        {/* Hero Section */}
        <div className="mb-10 relative">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] text-[#706c66] uppercase tracking-[3px] mb-3">
            <span className="w-4 h-[1px] bg-[#c49368]" />
            <span>MEDIA SCRAPER & PROXY ENGINE</span>
          </div>

          <h1 className="font-mono text-3xl sm:text-4xl font-light text-[#e2ded6] tracking-tight leading-tight">
            X <span className="text-[#c49368] font-normal">/</span> Twitter Media Downloader
          </h1>
          <p className="mt-2 text-[#706c66] font-mono text-[0.8rem] tracking-wide">
            Extract high-fidelity MP4 videos, galleries & uncompressed photos with zero quality loss.
          </p>
        </div>

        {/* Input Terminal Card */}
        <div className="bg-[#111114] border border-[#2a2a30] p-4 sm:p-6 relative shadow-lg">
          {/* Decorative corner markers */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#c49368] opacity-70" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#c49368] opacity-70" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#c49368] opacity-70" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#c49368] opacity-70" />

          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Paste X / Twitter URL (e.g. https://x.com/username/status/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0c] border border-[#2a2a30] text-[#e2ded6] font-mono text-xs placeholder-[#4a4844] focus:outline-none focus:border-[#c49368] transition duration-200"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center font-mono text-[0.65rem] text-[#706c66] hover:text-[#e2ded6]"
                >
                  CLEAR
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-[#c49368] hover:bg-[#d4a478] text-[#0a0a0c] font-mono text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <span>FETCH MEDIA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick link examples */}
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[0.68rem] text-[#706c66]">
            <span className="text-[#4a4844]">PRESETS:</span>
            {sampleTweets.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(s.url);
                  setTimeout(() => handleFetch(), 50);
                }}
                className="px-2 py-0.5 bg-[#18181c] hover:bg-[#1f1f24] hover:text-[#e2ded6] text-[#b0aca4] border border-[#1e1e24] transition duration-150"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-[#111114] border border-[#b05050]/50 text-[#e2ded6] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#b05050]" />
            <div className="font-mono text-xs">
              <span className="text-[#b05050] font-semibold">ERROR:</span> {error}
            </div>
          </div>
        )}

        {/* Result Area */}
        {tweet && (
          <div className="mt-8 space-y-6">
            {/* Tweet Summary Card */}
            <div className="bg-[#111114] border border-[#2a2a30] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {tweet.author.avatarUrl ? (
                    <img
                      src={tweet.author.avatarUrl}
                      alt={tweet.author.name}
                      className="w-10 h-10 border border-[#2a2a30] object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#18181c] border border-[#2a2a30] flex items-center justify-center font-mono text-xs text-[#c49368]">
                      {tweet.author.name[0] || 'X'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-[#e2ded6] text-sm">
                      {tweet.author.name}
                      {tweet.author.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#c49368]" />
                      )}
                    </div>
                    <div className="font-mono text-[0.7rem] text-[#706c66]">
                      @{tweet.author.screenName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyUrl}
                    className="px-2.5 py-1.5 bg-[#18181c] hover:bg-[#1f1f24] text-[#b0aca4] hover:text-[#e2ded6] border border-[#2a2a30] font-mono text-[0.68rem] flex items-center gap-1.5 transition"
                    title="Copy post link"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#6a9a6a]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED' : 'SHARE'}</span>
                  </button>
                  <a
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-[#18181c] hover:bg-[#1f1f24] text-[#b0aca4] hover:text-[#e2ded6] border border-[#2a2a30] font-mono text-[0.68rem] flex items-center gap-1.5 transition"
                    title="Open on X"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>ORIGINAL</span>
                  </a>
                </div>
              </div>

              {/* Tweet Text Content */}
              {tweet.text && (
                <div className="mt-4 text-[#b0aca4] text-xs leading-relaxed whitespace-pre-wrap font-sans border-t border-[#1e1e24] pt-3">
                  {tweet.text}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="mt-4 pt-3 border-t border-[#1e1e24] flex items-center gap-6 font-mono text-[0.65rem] text-[#706c66]">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-[#b05050]" />
                  {tweet.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Repeat className="w-3 h-3 text-[#6a9e9e]" />
                  {tweet.reposts.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-[#c49368]" />
                  {tweet.replies.toLocaleString()}
                </span>
                <span className="ml-auto text-[#4a4844] hidden sm:inline">
                  {tweet.createdAt}
                </span>
              </div>
            </div>

            {/* Media Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e1e24] pb-2">
                <h2 className="font-mono text-xs text-[#e2ded6] uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-[#c49368]" />
                  Detected Media [{tweet.media.length}]
                </h2>
              </div>

              {tweet.media.length === 0 ? (
                <div className="p-8 text-center bg-[#111114] border border-[#1e1e24] text-[#706c66] font-mono text-xs">
                  NO DIRECT MEDIA ATTACHMENTS DETECTED
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tweet.media.map((media, index) => {
                    const isVideo = media.type === 'video' || media.type === 'gif';
                    return (
                      <div
                        key={media.id || index}
                        className="bg-[#111114] border border-[#2a2a30] hover:border-[#c49368]/50 flex flex-col justify-between transition duration-200"
                      >
                        {/* Media Preview Box */}
                        <div className="relative aspect-video bg-[#0a0a0c] flex items-center justify-center overflow-hidden border-b border-[#1e1e24]">
                          {isVideo ? (
                            <video
                              src={selectedFormat[media.id] || media.url}
                              poster={media.thumbnailUrl}
                              controls
                              preload="metadata"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`Post media ${index + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          )}

                          {/* Tag */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-[#0a0a0c]/90 border border-[#2a2a30] font-mono text-[0.62rem] text-[#b0aca4]">
                            {isVideo ? (
                              <>
                                <Video className="w-3 h-3 text-[#c49368]" />
                                <span>{media.type === 'gif' ? 'GIF' : 'VIDEO'}</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3 h-3 text-[#6a9e9e]" />
                                <span>PHOTO</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="p-4 space-y-3 bg-[#111114]">
                          {isVideo && media.formats && media.formats.length > 1 && (
                            <div>
                              <label className="font-mono text-[0.65rem] text-[#706c66] block mb-1">
                                SELECT RESOLUTION:
                              </label>
                              <select
                                value={selectedFormat[media.id] || media.url}
                                onChange={(e) =>
                                  setSelectedFormat((prev) => ({
                                    ...prev,
                                    [media.id]: e.target.value,
                                  }))
                                }
                                className="w-full bg-[#0a0a0c] border border-[#2a2a30] px-3 py-2 font-mono text-xs text-[#e2ded6] focus:outline-none focus:border-[#c49368]"
                              >
                                {media.formats.map((fmt, fIdx) => (
                                  <option key={fIdx} value={fmt.url}>
                                    {fmt.quality || `${fmt.width}x${fmt.height}`}
                                    {fmt.bitrate ? ` (${Math.round(fmt.bitrate / 1000)} kbps)` : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={getDownloadUrl(media)}
                              className="flex-1 py-2.5 px-4 bg-[#1f1f24] hover:bg-[#c49368] text-[#e2ded6] hover:text-[#0a0a0c] border border-[#2a2a30] hover:border-[#c49368] font-mono text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 uppercase tracking-wider"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>DOWNLOAD</span>
                            </a>

                            <a
                              href={selectedFormat[media.id] || media.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-[#18181c] hover:bg-[#1f1f24] text-[#b0aca4] hover:text-[#e2ded6] border border-[#2a2a30] transition"
                              title="Direct Source Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#1e1e24] pt-8">
          <div className="p-4 bg-[#111114] border border-[#1e1e24]">
            <div className="font-mono text-[0.65rem] text-[#c49368] mb-1">01 / RESOLUTION</div>
            <div className="font-mono text-sm text-[#e2ded6] mb-1">High-Fidelity Stream</div>
            <p className="text-xs text-[#706c66] font-sans">
              Extracts 1080p, 720p, or high-bitrate original streams without transcode loss.
            </p>
          </div>

          <div className="p-4 bg-[#111114] border border-[#1e1e24]">
            <div className="font-mono text-[0.65rem] text-[#6a9e9e] mb-1">02 / ARCHITECTURE</div>
            <div className="font-mono text-sm text-[#e2ded6] mb-1">Proxy Streaming</div>
            <p className="text-xs text-[#706c66] font-sans">
              Internal stream proxy avoids CORS roadblocks and forces native browser download dialogs.
            </p>
          </div>

          <div className="p-4 bg-[#111114] border border-[#1e1e24]">
            <div className="font-mono text-[0.65rem] text-[#a08060] mb-1">03 / ZERO LOGIN</div>
            <div className="font-mono text-sm text-[#e2ded6] mb-1">Direct Extraction</div>
            <p className="text-xs text-[#706c66] font-sans">
              Multi-tiered scraping using FxTwitter, vxTwitter, and local engine fallbacks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e24] py-6 text-center font-mono text-[0.68rem] text-[#706c66] bg-[#0a0a0c]">
        <p>kurzagin-themed architecture · TypeScript · Vite · React</p>
      </footer>
    </div>
  );
}
