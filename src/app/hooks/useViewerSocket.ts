import { useEffect, useRef, useState } from 'react';
import { buildViewerWsUrl } from '@/shared/ws/buildWsUrl';

const PONG_DEADLINE_MS = 15_000;
const NO_RECONNECT_CODES = new Set([4000, 4001, 4004]);

export type ViewerSocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'stream_ended';

export function useViewerSocket(
  streamToken: string | null | undefined,
  enabled: boolean,
) {
  const [status, setStatus] = useState<ViewerSocketStatus>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const pongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !streamToken) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const clearPongTimer = () => {
      if (pongTimerRef.current) {
        clearTimeout(pongTimerRef.current);
        pongTimerRef.current = null;
      }
    };

    const connect = () => {
      if (cancelled) return;

      setStatus('connecting');
      const ws = new WebSocket(buildViewerWsUrl(streamToken));
      wsRef.current = ws;

      ws.onopen = () => {
        // Ждём { type: "connected" } от бэка
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type?: string };

          switch (data.type) {
            case 'connected':
              setStatus('connected');
              break;

            case 'ping':
              clearPongTimer();
              pongTimerRef.current = setTimeout(() => {
                console.warn('[Viewer] pong not sent in time');
                ws.close();
              }, PONG_DEADLINE_MS);
              ws.send(JSON.stringify({ type: 'pong' }));
              clearPongTimer();
              break;

            case 'pong':
              break;

            default:
              break;
          }
        } catch (error) {
          console.error('[Viewer] Parse error:', error);
        }
      };

      ws.onerror = () => {
        if (!cancelled) setStatus('error');
      };

      ws.onclose = (event) => {
        clearPongTimer();
        wsRef.current = null;

        if (cancelled) return;

        if (event.code === 4004) {
          setStatus('stream_ended');
          return;
        }

        if (event.code === 4001) {
          setStatus('error');
          return;
        }

        if (NO_RECONNECT_CODES.has(event.code)) {
          setStatus('error');
          return;
        }

        setStatus('connecting');
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearPongTimer();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
      setStatus('idle');
    };
  }, [streamToken, enabled]);

  return {
    status,
    isWatching: status === 'connected',
  };
}
