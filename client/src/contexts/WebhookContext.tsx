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

const BACKEND_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export const WebhookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: false, // Change to false since we're using '*' for CORS
      transports: ['websocket', 'polling'], // Explicitly set transports
      timeout: 60000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Attempt to reconnect with polling if websocket fails
      if ((newSocket.io.opts.transports as string[])?.includes('websocket')) {
        console.log('Falling back to polling transport');
        newSocket.io.opts.transports = ['polling'];
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Remove credentials since we're using '*' for CORS
        });
        if (!response.ok) {
          throw new Error('Failed to fetch webhooks');
        }
        const data = await response.json();
        setWebhooks(data);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      }
    };

    fetchWebhooks();
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Remove credentials since we're using '*' for CORS
      });
      
      if (!response.ok) {
        throw new Error('Failed to create webhook');
      }

      const webhook = await response.json();
      const newWebhook = { ...webhook, payloads: [] };
      setWebhooks(prev => [...prev, newWebhook]);
      return newWebhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
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
