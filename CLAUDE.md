# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start the entire application:**
```bash
npm start
```
This runs both server and client concurrently using the custom start.js script.

**Individual development:**
```bash
# Server (Express + TypeScript)
cd server && npm start  # Uses nodemon for auto-reload

# Client (React + TypeScript)  
cd client && npm start  # Standard React development server

# Build server for production
cd server && npm run build && npm run serve
```

**Installation:**
```bash
npm run install-all  # Installs dependencies for both server and client
```

## Architecture Overview

This is a webhook receiver application similar to webhook.site with a client-server architecture:

**Server (`/server/src/index.ts`):**
- Express.js backend with TypeScript running on port 5000 (dev) or 5100 (prod)
- In-memory storage for webhooks and payloads (Map-based, max 1000 webhooks)
- Socket.IO for real-time webhook payload notifications
- Rate limiting (100 requests/minute per IP)
- UUID-based webhook endpoint generation
- CORS configured for multiple environments (localhost, IP addresses, production domains)

**Client (`/client/src/`):**
- React 18 with TypeScript
- Material-UI (MUI) for components and theming
- Socket.IO client for real-time updates
- Context-based state management (`WebhookContext.tsx`)
- Dark/light theme with localStorage persistence
- Environment-aware backend URL detection

**Key Components:**
- `WebhookContext.tsx`: Main state management, Socket.IO connection, and API calls
- `WebhookList.tsx`: Displays webhook list and handles creation
- `WebhookDetails.tsx`: Shows individual webhook payloads
- `ThemeToggle.tsx`: Theme switching component

**Data Flow:**
1. Client creates webhook → Server generates UUID and stores webhook
2. External service POSTs to `/webhook/{id}` → Server stores payload and emits Socket.IO event
3. Client receives real-time payload via Socket.IO and updates UI

**Environment Configuration:**
- Uses dynamic backend URL detection based on hostname
- Supports localhost, IP addresses (193.219.97.148), and production domains
- Socket.IO configured with polling fallback for connection reliability
- CORS allows all origins in current configuration

**Memory Management:**
- Webhooks limited to 1000 total
- Each webhook stores max 100 payloads (FIFO)
- Rate limiting data automatically cleaned up