# X / Twitter Media Downloader

A full-stack TypeScript application to download images, videos, and GIFs from X (formerly Twitter) with a modern Kurzagin-themed, mobile-responsive web UI.

---

## Prerequisites

Before running the application, ensure the following dependencies are installed and available in your environment:

- **Node.js**: `v18.0.0` or higher ([nodejs.org](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- **yt-dlp** *(Recommended for tertiary video extraction fallback)*:
  - Linux: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp` or via package manager (`sudo apt install yt-dlp` / `brew install yt-dlp`)
  - macOS: `brew install yt-dlp`
  - Windows: `winget install yt-dlp` or `choco install yt-dlp`

---

## Features

- **Both Images & Videos**: Supports single photos, multiple image galleries/mosaics, MP4 videos, and animated GIFs.
- **Multiple Video Resolutions**: Inspect and select resolutions (e.g. 1080p, 720p, 480p) before downloading.
- **Direct Save / Download Proxy**: Automatically streams through an internal endpoint to avoid CORS issues and trigger native file download dialogs.
- **Multi-Strategy Scraping Engine**:
  1. Primary: FxTwitter API v2
  2. Secondary: vxTwitter API
  3. Tertiary: Local `yt-dlp` CLI fallback
- **Kurzagin Design Aesthetic**: Dark terminal dot-grid aesthetic with precision accents and typographic balance.
- **Mobile Responsive**: Fully responsive layout optimized for mobile screens, tablets, and desktops (with touch controls and safe viewport areas).
- **Modern Full-Stack TypeScript**: React 19, Vite 8, Express backend, and Tailwind CSS.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Mode
To start both the Vite dev server and backend concurrently:
```bash
npm run dev
```
- **Frontend UI**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`

### 3. Production Build & Start
```bash
npm run build
npm start
```
The server will run on `http://localhost:3001` serving both the API and compiled UI.

---

## API Endpoints

- `POST /api/fetch`
  - Body: `{ "url": "https://x.com/username/status/123456789" }`
  - Returns parsed post info and media array with download options.
- `GET /api/download?url=<ENCODED_URL>&filename=<CUSTOM_NAME>`
  - Proxies media stream directly with `Content-Disposition: attachment` to prompt browser file download.
