import { useEffect, useRef, useState, useCallback } from 'react';

export interface WidgetAlertStyle {
  bg_color: string;
  text_color: string;
  font: string;
  duration_sec: number;
}

export interface WidgetDonation {
  donation_id: number;
  donor_name: string;
  amount: number;
  message: string | null;
  audio_url: string | null;
  image_url: string | null;
  style: WidgetAlertStyle;
}

export interface WidgetGoal {
  title: string;
  target_amount: number;
  current_amount: number;
  percent: number;
}

const NO_RECONNECT_CODES = new Set([4000, 4001, 4004]);

function parseAlertPayload(data: Record<string, unknown>): WidgetDonation | null {
  const donationId = data.donation_id;
  if (typeof donationId !== 'number') return null;

  const style = (data.style as WidgetAlertStyle | undefined) ?? {
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
  };

  return {
    donation_id: donationId,
    donor_name: String(data.donor_name ?? 'Аноним'),
    amount: Number(data.amount ?? 0),
    message: (data.message as string | null) ?? null,
    audio_url: (data.audio_url as string | null) ?? null,
    image_url: (data.image_url as string | null) ?? null,
    style,
  };
}

export function useWidgetSocket(wsUrl: string | null) {
  const [donations, setDonations] = useState<WidgetDonation[]>([]);
  const [goal, setGoal] = useState<WidgetGoal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamStopped, setStreamStopped] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamStoppedRef = useRef(false);

  const send = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const acknowledgeAlert = useCallback(
    (donationId: number) => {
      send({ type: 'alert_displayed', donation_id: donationId });
    },
    [send],
  );

  const removeDonation = useCallback((donationId: number) => {
    setDonations((prev) => prev.filter((d) => d.donation_id !== donationId));
  }, []);

  useEffect(() => {
    if (!wsUrl) return;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'ready' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>;

            switch (data.type) {
              case 'connected':
                setIsConnected(true);
                setStreamStopped(false);
                break;

              case 'pong':
                break;

              case 'new_alert':
              case 'test_alert': {
                const alert = parseAlertPayload(data);
                if (alert) {
                  if (alert.audio_url) {
                    console.log('[Widget] Alert with audio:', alert.audio_url);
                  } else if (alert.message) {
                    console.warn('[Widget] Alert without audio_url — check TTS on backend');
                  }
                  setDonations((prev) => [...prev, alert]);
                }
                break;
              }

              case 'goal_updated':
                setGoal({
                  title: String(data.title ?? ''),
                  target_amount: Number(data.target_amount ?? 0),
                  current_amount: Number(data.current_amount ?? 0),
                  percent: Number(data.percent ?? 0),
                });
                break;

              case 'stream_stopped':
                setIsConnected(false);
                setStreamStopped(true);
                streamStoppedRef.current = true;
                ws.close(1000, 'stream_stopped');
                break;

              default:
                break;
            }
          } catch (error) {
            console.error('[Widget] Parse error:', error);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          setIsConnected(false);
          wsRef.current = null;

          if (
            cancelled ||
            NO_RECONNECT_CODES.has(event.code) ||
            streamStoppedRef.current
          ) {
            return;
          }

          reconnectRef.current = setTimeout(connect, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('[Widget] Connection failed:', error);
        reconnectRef.current = setTimeout(connect, 5000);
      }
    };

    streamStoppedRef.current = false;
    setStreamStopped(false);
    connect();

    return () => {
      cancelled = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [wsUrl]);

  return {
    donations,
    goal,
    isConnected,
    streamStopped,
    removeDonation,
    acknowledgeAlert,
  };
}
