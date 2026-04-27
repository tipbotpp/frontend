import { useEffect, useRef, useState, useCallback } from 'react';

export interface WidgetDonation {
  id: number;
  amount: number;
  message: string | null;
  from_user: {
    id: number;
    username: string | null;
    avatar_url: string | null;
  };
  created_at: string;
}

export function useWidgetSocket(wsUrl: string | null) {
  const [donations, setDonations] = useState<WidgetDonation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsUrl) return;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('[Widget] WebSocket connected');
          setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'donation' && data.donation) {
              setDonations(prev => [...prev, data.donation]);
            } else if (data.amount) {
              setDonations(prev => [...prev, data]);
            }
          } catch (error) {
            console.error('[Widget] Parse error:', error);
          }
        };
        
        ws.onerror = () => setIsConnected(false);
        
        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connect, 3000);
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.error('[Widget] Connection failed:', error);
        setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [wsUrl]);

  const removeDonation = useCallback((id: number) => {
    setDonations(prev => prev.filter(d => d.id !== id));
  }, []);

  return {
    donations,
    isConnected,
    removeDonation,
  };
}