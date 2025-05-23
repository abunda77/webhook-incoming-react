import React, { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface Webhook {
  id: string;
  url: string;
  payloads: WebhookPayload[];
}

interface WebhookPayload {
  timestamp: string;
  headers: Record<string, string>;
  body: any;
  query: Record<string, string>;
}

interface WebhookContextType {
  webhooks: Webhook[];
  createWebhook: () => Promise<Webhook>;
  selectedWebhook: Webhook | null;
  setSelectedWebhook: (webhook: Webhook | null) => void;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

// Mengubah default URL dan menambahkan port yang benar
const BACKEND_URL = (() => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_SERVER_URL || 'https://webhook-server.produkmastah.com';
  }
  
  // For development, try to use the same hostname as the client
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5100';
  } else if (hostname === '193.219.97.148') {
    return 'http://193.219.97.148:5100';
  } else if (hostname.includes('produkmastah.com')) {
    return 'https://webhook-server.produkmastah.com';
  }
  
  // Default fallback
  return 'https://webhook-server.produkmastah.com';
})();

export const WebhookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    console.log('Connecting to backend URL:', BACKEND_URL);
    
    const newSocket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: false,
      transports: ['polling', 'websocket'],
      timeout: 60000,
      forceNew: true,
      path: '/socket.io',
      // Add additional Socket.IO options for secure connections
      secure: BACKEND_URL.startsWith('https'),
      rejectUnauthorized: false // Helps with self-signed certificates if you're using any
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully to:', BACKEND_URL);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      console.log('Current transport:', newSocket.io.engine.transport.name);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    };
  }, []);

  // Fetch initial webhooks
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const fetchWebhooks = async () => {
      try {
        console.log('Fetching webhooks from:', BACKEND_URL);
        const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal,
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          referrerPolicy: 'no-referrer-when-downgrade'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWebhooks(data);
        console.log('Webhooks fetched successfully:', data);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted due to timeout');
          } else {
            console.error('Error fetching webhooks:', error.message);
          }
        }
      }
    };

    fetchWebhooks();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Set up webhook event listeners
  useEffect(() => {
    if (!socket) return;

    webhooks.forEach(webhook => {
      socket.on(`webhook:${webhook.id}`, (payload: WebhookPayload) => {
        setWebhooks(prevWebhooks =>
          prevWebhooks.map(w =>
            w.id === webhook.id
              ? { ...w, payloads: [payload, ...w.payloads].slice(0, 100) }
              : w
          )
        );
      });
    });

    return () => {
      webhooks.forEach(webhook => {
        socket.off(`webhook:${webhook.id}`);
      });
    };
  }, [webhooks, socket]);

  const createWebhook = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      console.log('Creating new webhook at:', BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        referrerPolicy: 'no-referrer-when-downgrade'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const webhook = await response.json();
      const newWebhook = { ...webhook, payloads: [] };
      setWebhooks(prev => [...prev, newWebhook]);
      console.log('Webhook created successfully:', newWebhook);
      return newWebhook;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Create webhook aborted due to timeout');
        } else {
          console.error('Error creating webhook:', error.message);
        }
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <WebhookContext.Provider
      value={{
        webhooks,
        createWebhook,
        selectedWebhook,
        setSelectedWebhook,
      }}
    >
      {children}
    </WebhookContext.Provider>
  );
};

export const useWebhook = () => {
  const context = useContext(WebhookContext);
  if (context === undefined) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
};
