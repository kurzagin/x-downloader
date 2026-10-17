# X / Twitter Media Downloader

A full-stack TypeScript application to download images, videos, and GIFs from X (formerly Twitter) with an interactive modern web UI.

## Features

- **Both Images and Videos**: Supports single photos, multiple image galleries/mosaics, MP4 videos, and animated GIFs.
- **Multiple Video Resolutions**: Inspect and choose resolutions (e.g., 1080p, 720p, 480p) before downloading.
- **Direct Save / Download Proxy**: Automatically streams through an internal endpoint to avoid CORS issues and trigger direct native file download dialogs.
- **Multi-Strategy Scraping Engine**:
  1. Primary: FxTwitter API v2
  2. Secondary: vxTwitter API
  3. Tertiary: Local `yt-dlp` fallback
- **Interactive Web UI**: Modern responsive interface built with React, Vite, Lucide icons, and Tailwind CSS.
- **Full TypeScript**: End-to-end typed frontend and backend.

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
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:3001`

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
  - Proxies media stream directly with `Content-Disposition: attachment` to prompt the browser to save the file.
