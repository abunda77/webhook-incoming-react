import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface WebhookPayload {
  timestamp: Date;
  headers: Record<string, string>;
  body: any;
  query: Record<string, string>;
}

interface WebhookData {
  id: string;
  url: string;
  payloads: WebhookPayload[];
}

// Environment variables
const SERVER_PORT = parseInt(process.env.PORT || '5000', 10);

const allowedOrigins = [
  'http://localhost:3100',
  'http://193.219.97.148:3100',
  'http://webhook.produkmastah.com', 
  'https://webhook.produkmastah.com',  
  'http://localhost:5100',
  'http://193.219.97.148:5100',
  'https://webhook-server.produkmastah.com',
  'http://webhook-server.produkmastah.com',
  'http://localhost:5000',   
  'http://192.168.100.247:3000',
  'http://192.168.100.247:5000',
  'http://localhost:3000',
  'http://localhost:5000'
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      console.log('Socket.IO Incoming Origin:', origin);
      
      const isAllowed = !origin || 
        allowedOrigins.some(o => 
          origin.startsWith(o)
        );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Socket.IO Rejected Origin:', origin);
        callback(new Error('Socket.IO: Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Configure CORS
app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Incoming Origin:', origin);
    
    const isAllowed = !origin || 
      allowedOrigins.some(o => 
        origin.startsWith(o)
      );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Rejected Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Store webhooks in memory with a max limit
const MAX_WEBHOOKS = 1000;
const webhooks = new Map<string, WebhookData>();

// API rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100;

function isRateLimited(clientIp: string | undefined): boolean {
  if (!clientIp) return true;
  
  const now = Date.now();
  const clientRequests = requestCounts.get(clientIp);

  if (!clientRequests) {
    requestCounts.set(clientIp, { count: 1, timestamp: now });
    return false;
  }

  if (now - clientRequests.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIp, { count: 1, timestamp: now });
    return false;
  }

  if (clientRequests.count >= MAX_REQUESTS) {
    return true;
  }

  clientRequests.count++;
  return false;
}

// Cleanup old rate limiting data periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Generate new webhook URL
app.post('/api/webhooks', (req: Request, res: Response) => {
  const clientIp = req.ip;
  
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  if (webhooks.size >= MAX_WEBHOOKS) {
    res.status(507).json({ error: 'Maximum webhook limit reached' });
    return;
  }

  const newId = uuidv4();
  const url = `/webhook/${newId}`;
  
  const newWebhook: WebhookData = {
    id: newId,
    url,
    payloads: []
  };
  
  webhooks.set(newId, newWebhook);
  res.json(newWebhook);
});

// List all webhooks
app.get('/api/webhooks', (_req: Request, res: Response) => {
  const webhookList = Array.from(webhooks.values());
  res.json(webhookList);
});

// Get webhook by ID
app.get('/api/webhooks/:id', (req: Request, res: Response) => {
  const webhook = webhooks.get(req.params.id);
  if (!webhook) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }
  res.json(webhook);
});

// Handle incoming webhook requests
app.post('/webhook/:id', (req: Request, res: Response) => {
  const webhook = webhooks.get(req.params.id);
  
  if (!webhook) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }

  const payload: WebhookPayload = {
    timestamp: new Date(),
    headers: req.headers as Record<string, string>,
    body: req.body,
    query: req.query as Record<string, string>
  };

  // Limit stored payloads to prevent memory issues
  webhook.payloads.unshift(payload);
  if (webhook.payloads.length > 100) {
    webhook.payloads.pop();
  }
  
  // Emit the new payload to connected clients
  io.emit(`webhook:${webhook.id}`, payload);
  res.status(200).json({ status: 'success' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
