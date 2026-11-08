import React, { useState } from 'react';
import { TweetInfo, MediaItem } from './types';
import { 
  Badge,
  BottomBar,
  BracketCard,
  Breadcrumbs,
  Button,
  CornerFrame,
  CyberSwitch,
  Dot,
  HudModal,
  HudToast,
  Input,
  KeyValGrid,
  Logo,
  SegmentedControl,
  SpoilerGate,
  StickyNote,
  TacticalDrawer,
  TechLabel,
  TelemetryBar,
  TerminalWindow,
  Tooltip,
  Vinyl,
  formatRelativeTime
} from '@krpkg/ui';
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
  Film,
  Settings,
  HelpCircle,
  Sparkles,
  Terminal,
  Layers,
  Radio,
  FileCode,
  Music2
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweet, setTweet] = useState<TweetInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<{ [key: string]: string }>({});

  // Cyber / UI Component states to consume the full library
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'specs' | 'terminal' | 'vinyl'>('media');
  const [highQualityOnly, setHighQualityOnly] = useState(true);
  const [proxyDirect, setProxyDirect] = useState(true);
  const [bottomNavId, setBottomNavId] = useState('home');
  const [vinylPlaying, setVinylPlaying] = useState(false);

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
      setToastMessage(`Parsed ${data.tweet.media?.length || 0} media asset(s) successfully.`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching media.');
      setToastMessage(`Error: ${err.message || 'Failed to extract'}`);
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
      setToastMessage('Tweet URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleTweets = [
    { label: 'Jack (First Tweet)', url: 'https://x.com/jack/status/20' },
    { label: 'Sample Video Post', url: 'https://x.com/Twitter/status/1603831888195436544' },
    { label: 'SpaceX Launch', url: 'https://x.com/SpaceX/status/1768262299868770747' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10 pb-20">
      {/* Toast Notification from @krpkg/ui */}
      {toastMessage && (
        <HudToast
          isOpen={!!toastMessage}
          onClose={() => setToastMessage(null)}
          title="SYSTEM TELEMETRY"
          description={toastMessage}
          variant={error ? 'alert' : 'teal'}
          coord="0x7F"
        />
      )}

      {/* Top Bar with Breadcrumbs & TechLabel */}
      <header className="sticky top-0 z-50 h-14 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-[#2a2a30] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={24} variant="accent" />
          <Breadcrumbs
            prefix="SYS//"
            items={[
              { label: 'KRPKG', onClick: () => {} },
              { label: 'X-EXTRACTOR', active: true }
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <TechLabel label="NODE" jp="稼働中" coord="JP-NRT-01" className="hidden sm:flex" />
          <Dot color="green" pulse />
          <Badge variant="accent">ONLINE</Badge>
          <Tooltip content="System Parameters & Controls" position="bottom">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CONFIG</span>
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Hero Section with CornerFrame */}
        <CornerFrame showCorners className="p-6 bg-[#111114]/90 border border-[#2a2a30]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="teal">V1.0.0-PROXIED</Badge>
                <Badge variant="outline">CYBER-MINIMALIST</Badge>
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-light text-[#e2ded6] tracking-tight leading-tight">
                X <span className="text-[#c49368] font-normal">/</span> Twitter High-Fidelity Downloader
              </h1>
              <p className="mt-1 text-[#706c66] font-mono text-xs sm:text-sm tracking-wide">
                Extract uncompressed MP4 videos, multi-frame galleries & telemetry data directly without loss.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#c49368]" />
                <span>SPECIFICATIONS</span>
              </Button>
            </div>
          </div>

          {/* Telemetry buffer bar */}
          <div className="mt-6 pt-4 border-t border-[#1e1e24]">
            <TelemetryBar
              value={tweet ? 100 : (loading ? 65 : 20)}
              max={100}
              label="BUFFER SATURATION"
              coord="EXT_CH1"
              variant="accent"
              segmented
              segmentsCount={12}
              showReadout
            />
          </div>
        </CornerFrame>

        {/* Input Terminal Card using BracketCard */}
        <BracketCard active={loading} className="p-4 sm:p-6 bg-[#111114] border border-[#2a2a30]">
          <form onSubmit={handleFetch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="TARGET RESOURCE IDENTIFIER"
                  sublabel="Post URL / Status link"
                  placeholder="https://x.com/username/status/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  fullWidth
                  prefixSymbol={<span className="text-[#c49368] font-mono text-xs">URL&gt;</span>}
                  suffixSymbol={
                    url ? (
                      <button
                        type="button"
                        onClick={() => setUrl('')}
                        className="text-[0.65rem] font-mono text-[#706c66] hover:text-[#e2ded6]"
                      >
                        CLEAR
                      </button>
                    ) : null
                  }
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || !url.trim()}
                className="w-full sm:w-auto h-[42px] px-6 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ANALYZING</span>
                  </>
                ) : (
                  <>
                    <span>EXTRACT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Quick link presets and controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[0.68rem] text-[#706c66]">
                <span className="text-[#4a4844]">PRESETS:</span>
                {sampleTweets.map((s, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUrl(s.url);
                      setTimeout(() => handleFetch(), 50);
                    }}
                    className="h-6 text-[0.68rem] px-2 py-0 border border-[#2a2a30]"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <CyberSwitch
                  size="sm"
                  checked={highQualityOnly}
                  onChange={setHighQualityOnly}
                  label="HQ Priority"
                  variant="default"
                />
                <CyberSwitch
                  size="sm"
                  checked={proxyDirect}
                  onChange={setProxyDirect}
                  label="Stream Proxy"
                  variant="teal"
                />
              </div>
            </div>
          </form>
        </BracketCard>

        {/* Error Alert with StickyNote */}
        {error && (
          <StickyNote colorVariant={4} title="ERROR OCCURRED" tape className="w-full">
            <div className="font-mono text-xs text-[#e2ded6] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#b05050]" />
              <span>{error}</span>
            </div>
          </StickyNote>
        )}

        {/* Result Area */}
        {tweet && (
          <div className="space-y-6">
            {/* View switcher tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SegmentedControl
                variant="accent"
                value={activeTab}
                onChange={(val) => setActiveTab(val as any)}
                options={[
                  { value: 'media', label: 'Media Stream', badge: tweet.media.length },
                  { value: 'specs', label: 'Telemetry & Specs' },
                  { value: 'terminal', label: 'Raw Payload' },
                  { value: 'vinyl', label: 'Audio / Vinyl Mode' },
                ]}
              />

              <div className="flex items-center gap-2 font-mono text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUrl}
                  className="flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#6a9a6a]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'SHARE'}</span>
                </Button>
                <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 border border-[#2a2a30]">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ORIGINAL</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Author summary card */}
            <CornerFrame showCorners className="p-5 bg-[#111114] border border-[#2a2a30]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {tweet.author.avatarUrl ? (
                    <img
                      src={tweet.author.avatarUrl}
                      alt={tweet.author.name}
                      className="w-12 h-12 border border-[#2a2a30] object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#18181c] border border-[#2a2a30] flex items-center justify-center font-mono text-sm text-[#c49368]">
                      {tweet.author.name[0] || 'X'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-[#e2ded6] text-sm">
                      {tweet.author.name}
                      {tweet.author.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#c49368]" />
                      )}
                      <Badge variant="teal">VERIFIED</Badge>
                    </div>
                    <div className="font-mono text-[0.75rem] text-[#706c66]">
                      @{tweet.author.screenName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs text-[#706c66]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-[#b05050]" />
                    {tweet.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 text-[#6a9e9e]" />
                    {tweet.reposts.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-[#c49368]" />
                    {tweet.replies.toLocaleString()}
                  </span>
                </div>
              </div>

              {tweet.text && (
                <div className="mt-4 text-[#b0aca4] text-xs leading-relaxed whitespace-pre-wrap font-sans border-t border-[#1e1e24] pt-3">
                  {tweet.text}
                </div>
              )}
            </CornerFrame>

            {/* Tab 1: Media Items View */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                {tweet.media.length === 0 ? (
                  <div className="p-8 text-center bg-[#111114] border border-[#1e1e24] text-[#706c66] font-mono text-xs">
                    NO DIRECT MEDIA ATTACHMENTS DETECTED
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {tweet.media.map((media, index) => {
                      const isVideo = media.type === 'video' || media.type === 'gif';
                      return (
                        <BracketCard
                          key={media.id || index}
                          active
                          className="bg-[#111114] border border-[#2a2a30] flex flex-col justify-between"
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
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <Badge variant={isVideo ? 'accent' : 'teal'}>
                                {isVideo ? (media.type === 'gif' ? 'GIF' : 'VIDEO') : 'PHOTO'}
                              </Badge>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="p-4 space-y-3 bg-[#111114]">
                            {isVideo && media.formats && media.formats.length > 1 && (
                              <div>
                                <label className="font-mono text-[0.65rem] text-[#706c66] block mb-1">
                                  STREAM RESOLUTION:
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
                              <a href={getDownloadUrl(media)} className="flex-1">
                                <Button
                                  variant="primary"
                                  size="md"
                                  className="w-full flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>DOWNLOAD ASSET</span>
                                </Button>
                              </a>

                              <Tooltip content="Open in new window" position="top">
                                <a
                                  href={selectedFormat[media.id] || media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="md" className="border border-[#2a2a30]">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </a>
                              </Tooltip>
                            </div>
                          </div>
                        </BracketCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Specs & KeyValGrid */}
            {activeTab === 'specs' && (
              <CornerFrame showCorners className="p-6 bg-[#111114] border border-[#2a2a30]">
                <KeyValGrid
                  title="RESOURCE METRIC INSPECTION"
                  coord="CH-09"
                  columns={2}
                  leaderDots
                  items={[
                    { key: 'POST IDENTIFIER', value: tweet.id, status: 'default' },
                    { key: 'AUTHOR HANDLE', value: `@${tweet.author.screenName}`, status: 'success' },
                    { key: 'CREATION TIME', value: tweet.createdAt || 'N/A', status: 'default' },
                    { key: 'RELATIVE STAMP', value: formatRelativeTime(Date.now() - 3600000), status: 'purple' },
                    { key: 'MEDIA COUNT', value: `${tweet.media.length} streams`, status: 'purple' },
                    { key: 'LIKES TELEMETRY', value: tweet.likes.toLocaleString(), status: 'alert' },
                    { key: 'REPOST SPREAD', value: tweet.reposts.toLocaleString(), status: 'default' },
                    { key: 'EXTRACTION ENGINE', value: 'FxTwitter / vxTwitter Proxy', status: 'success' },
                  ]}
                />
              </CornerFrame>
            )}

            {/* Tab 3: Terminal Raw Output with TerminalWindow */}
            {activeTab === 'terminal' && (
              <TerminalWindow
                title="payload_dump.json"
                badge="LIVE STREAM"
                showLineNumbers
                copyable
                code={JSON.stringify(tweet, null, 2)}
              />
            )}

            {/* Tab 4: Vinyl Audio Player Showcase */}
            {activeTab === 'vinyl' && (
              <div className="p-6 bg-[#111114] border border-[#2a2a30] flex flex-col items-center justify-center space-y-4">
                <Vinyl
                  variant="gold"
                  size="md"
                  layout="turntable"
                  playing={vinylPlaying}
                  title={tweet.author.name}
                  artist={`@${tweet.author.screenName}`}
                  album="X Media Stream"
                  rpm="33"
                  coverUrl={tweet.author.avatarUrl || tweet.media[0]?.thumbnailUrl || tweet.media[0]?.url}
                  controls={
                    <Button
                      variant={vinylPlaying ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setVinylPlaying(!vinylPlaying)}
                    >
                      {vinylPlaying ? 'PAUSE ROTATION' : 'START ROTATION'}
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights with SpoilerGate */}
        <SpoilerGate
          title="ADVANCED PROTOCOL ARCHITECTURE"
          description="Click clearance to inspect internal proxy topology and stream routing parameters."
          clearanceText="SECURITY CLEARANCE: LEVEL 2"
          buttonText="ACCESS TECHNICAL DATA"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <StickyNote colorVariant={1} title="01 / FIDELITY" tape>
              <div className="text-xs text-[#b0aca4]">
                Extracts uncompressed 1080p, 720p, or maximum bitrate MP4 streams directly.
              </div>
            </StickyNote>

            <StickyNote colorVariant={2} title="02 / CROS-PROXY" tape>
              <div className="text-xs text-[#b0aca4]">
                Native Node streaming pipe bypasses CORS barriers & triggers instant save dialogs.
              </div>
            </StickyNote>

            <StickyNote colorVariant={3} title="03 / MONOREPO UI" tape>
              <div className="text-xs text-[#b0aca4]">
                100% powered by the official <code>@krpkg/ui</code> design system library.
              </div>
            </StickyNote>
          </div>
        </SpoilerGate>
      </main>

      {/* Tactical Drawer from @krpkg/ui */}
      <TacticalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="ENGINE CONFIGURATION"
        coord="CFG_01"
        sublabel="Global proxy settings"
        position="right"
      >
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <CyberSwitch
              checked={highQualityOnly}
              onChange={setHighQualityOnly}
              label="Automatic Highest Quality Selection"
              sublabel="Select 1080p stream over lower bitrate alternatives"
            />
            <CyberSwitch
              checked={proxyDirect}
              onChange={setProxyDirect}
              label="Bypass Browser CORS Protection"
              sublabel="Route video bytechunks through internal Express pipe"
              variant="teal"
            />
          </div>

          <div className="border-t border-[#2a2a30] pt-4 space-y-2">
            <TechLabel label="UI CORE" jp="パッケージ" coord="@krpkg/ui" />
            <p className="text-xs text-[#706c66] font-mono leading-relaxed">
              Cyber-minimalist design system with precision typography, telemetry meters, and tactical HUD controls.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => setIsDrawerOpen(false)}
          >
            DISMISS
          </Button>
        </div>
      </TacticalDrawer>

      {/* HudModal from @krpkg/ui */}
      <HudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="SYSTEM SPECIFICATIONS"
        jp="システム仕様"
        coord="DOCS-01"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
            CONFIRM & CLOSE
          </Button>
        }
      >
        <div className="space-y-3 font-mono text-xs text-[#b0aca4]">
          <p>
            This application is constructed using the cyber-minimalist design language from{' '}
            <strong className="text-[#c49368]">@krpkg/ui</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#706c66]">
            <li>Terminal Window & Code Inspection</li>
            <li>Tactical HUD Modals & Sliding Drawers</li>
            <li>Telemetry Audio Vinyl Player</li>
            <li>Key-Value Data Grids & Precision Badges</li>
          </ul>
        </div>
      </HudModal>

      {/* BottomBar navigation from @krpkg/ui */}
      <BottomBar
        fixed
        variant="default"
        activeId={bottomNavId}
        onSelect={(id) => {
          setBottomNavId(id);
          if (id === 'settings') setIsDrawerOpen(true);
          if (id === 'specs') setIsModalOpen(true);
        }}
        items={[
          { id: 'home', label: 'EXTRACTOR', icon: <Radio className="w-4 h-4" /> },
          { id: 'specs', label: 'METRICS', icon: <Layers className="w-4 h-4" />, badge: 'SPEC' },
          { id: 'settings', label: 'SETTINGS', icon: <Settings className="w-4 h-4" /> },
        ]}
      />
    </div>
  );
}
