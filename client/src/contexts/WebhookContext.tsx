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

// Mengubah default URL ke port 5100 dan menambahkan production URL
const BACKEND_URL = process.env.REACT_APP_SERVER_URL || 'http://193.219.97.148:5100';

export const WebhookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: false,
      transports: ['polling'], // Start with polling only
      timeout: 20000,
      forceNew: true,
      path: '/socket.io',
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully to:', BACKEND_URL);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial webhooks
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const fetchWebhooks = async () => {
      try {
        console.log('Fetching webhooks from:', BACKEND_URL);
        const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWebhooks(data);
        console.log('Webhooks fetched successfully:', data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching webhooks:', error.message);
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
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      console.log('Creating new webhook at:', BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal
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
        console.error('Error creating webhook:', error.message);
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
