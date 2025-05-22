import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

interface WebhookData {
  id: string;
  url: string;
  payloads: any[];
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store webhooks in memory
const webhooks = new Map<string, WebhookData>();

// Generate new webhook URL
app.post('/api/webhooks', (req, res) => {
  const id = uuidv4();
  const url = `/webhook/${id}`;
  
  webhooks.set(id, {
    id,
    url,
    payloads: []
  });

  res.json({ id, url });
});

// List all webhooks
app.get('/api/webhooks', (req, res) => {
  const webhookList = Array.from(webhooks.values());
  res.json(webhookList);
});

// Get webhook by ID
app.get('/api/webhooks/:id', (req, res) => {
  const webhook = webhooks.get(req.params.id);
  if (!webhook) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }
  res.json(webhook);
});

// Handle incoming webhook requests
app.post('/webhook/:id', (req, res) => {
  const { id } = req.params;
  const webhook = webhooks.get(id);
  
  if (!webhook) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }

  const payload = {
    timestamp: new Date(),
    headers: req.headers,
    body: req.body,
    query: req.query
  };

  webhook.payloads.unshift(payload);
  
  // Emit the new payload to connected clients
  io.emit(`webhook:${id}`, payload);
  
  res.status(200).json({ status: 'success' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
