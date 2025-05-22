# Webhook Receiver

A simple webhook receiver application similar to webhook.site, built with React and Express.

## Features

- Generate unique webhook URLs
- Receive and store webhook payloads
- Real-time updates using WebSocket
- Copy webhook URLs to clipboard
- View detailed payload information
- Dark/Light theme support with persistent preference
- Modern UI with smooth theme transitions

## Project Structure

- `/client` - React frontend
- `/server` - Express backend

## Getting Started

1. Start the backend server:
```bash
cd server
npm install
npm start
```

2. Start the frontend application:
```bash
cd client
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Testing Webhooks

To test a webhook, send a POST request to the generated webhook URL. Example using curl:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"hello":"world"}' http://localhost:5000/webhook/{webhook-id}
```

## Technologies Used

- Frontend:
  - React with TypeScript
  - Material-UI (MUI) with icons
  - Socket.IO Client
  - Emotion (for styled components and theme transitions)
  - LocalStorage for theme persistence
  
- Backend:
  - Express with TypeScript
  - Socket.IO for real-time updates
  - UUID for generating unique endpoints
  - CORS for cross-origin support
