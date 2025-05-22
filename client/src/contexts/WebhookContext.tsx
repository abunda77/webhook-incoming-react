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

const BACKEND_URL = 'http://localhost:5000';
const socket = io(BACKEND_URL);

export const WebhookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  useEffect(() => {
    // Fetch existing webhooks
    fetch(`${BACKEND_URL}/api/webhooks`)
      .then(res => res.json())
      .then(data => setWebhooks(data))
      .catch(console.error);

    // Socket.io event handlers
    webhooks.forEach(webhook => {
      socket.on(`webhook:${webhook.id}`, (payload: WebhookPayload) => {
        setWebhooks(prevWebhooks =>
          prevWebhooks.map(w =>
            w.id === webhook.id
              ? { ...w, payloads: [payload, ...w.payloads] }
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
  }, [webhooks]);

  const createWebhook = async () => {
    const response = await fetch(`${BACKEND_URL}/api/webhooks`, {
      method: 'POST',
    });
    const webhook = await response.json();
    setWebhooks(prev => [...prev, { ...webhook, payloads: [] }]);
    return webhook;
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
