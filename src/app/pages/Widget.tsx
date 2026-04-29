import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { widgetApi } from '../../services/api';

interface WidgetConfig {
  stream_token: string;
  streamer: {
    username: string;
    display_name: string;
  };
  alert_style: {
    bg_color: string;
    text_color?: string;  
    font: string;
    duration_sec: number;
  };
  ws_url: string;
}

interface AlertEvent {
  type: 'new_alert';
  donation_id: number;
  donor_name: string;
  amount: number;
  message: string | null;
  audio_url: string | null;
  image_url: string | null;
  style: {
    bg_color: string;
    text_color: string;
    font: string;
    duration_sec: number;
  };
}

interface ConnectedEvent {
  type: 'connected';
  viewer_id: number;
  session_id: number;
}

interface PingEvent {
  type: 'ping';
}

type WsMessage = ConnectedEvent | PingEvent | AlertEvent | { type: 'pong' } | { type: 'stream_stopped' };

interface AlertItem {
  id: number;
  event: AlertEvent;
  timestamp: number;
}

export function Widget() {
  const { streamToken } = useParams();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [alertQueue, setAlertQueue] = useState<AlertItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // 1. Загружаем конфиг виджета
  useEffect(() => {
    if (!streamToken) return;
    
    loadConfig();
    
    return () => {
      cleanup();
    };
  }, [streamToken]);

  // 2. Обработка очереди алертов
  useEffect(() => {
    if (!activeAlert && alertQueue.length > 0) {
      const next = alertQueue[0];
      setActiveAlert(next);
      setAlertQueue(prev => prev.slice(1));
    }
  }, [activeAlert, alertQueue]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await widgetApi.getConfig(streamToken!);
      setConfig(data);
      
      // Подключаемся к WebSocket
      connectWebSocket(data.ws_url);
    } catch (error) {
      console.error('[Widget] Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (wsUrl: string) => {
    try {
      console.log('[Widget] Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[Widget] WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onmessage = (event) => {
        try {
          const data: WsMessage = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('[Widget] Failed to parse message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('[Widget] WebSocket error:', error);
      };
      
      ws.onclose = (event) => {
        console.log('[Widget] WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        clearPingTimer();
        
        // Обработка кодов закрытия
        switch (event.code) {
          case 4000:
            console.log('[Widget] Ping timeout');
            break;
          case 4001:
            console.log('[Widget] Auth error');
            break;
          case 4004:
            console.log('[Widget] Stream not found or ended');
            return; // Не переподключаемся
          default:
            break;
        }
        
        // Автоматическое переподключение
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`[Widget] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket(wsUrl);
          }, delay);
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('[Widget] Connection failed:', error);
    }
  };

  const handleMessage = (data: WsMessage) => {
    switch (data.type) {
      case 'connected':
        console.log('[Widget] Authorized:', data);
        break;
        
      case 'ping':
        sendPong();
        break;
        
      case 'new_alert':
        handleNewAlert(data);
        break;
        
      case 'stream_stopped':
        console.log('[Widget] Stream ended');
        cleanup();
        break;
        
      default:
        console.log('[Widget] Unknown message type:', data);
    }
  };

  const handleNewAlert = (alert: AlertEvent) => {
    const alertItem: AlertItem = {
      id: alert.donation_id,
      event: alert,
      timestamp: Date.now(),
    };
    
    setAlertQueue(prev => [...prev, alertItem]);
  };

  const sendPong = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pong' }));
      
      // Устанавливаем таймер на следующий ping
      clearPingTimer();
      pingTimeoutRef.current = setTimeout(() => {
        console.warn('[Widget] Ping timeout - no ping received in 45s');
        // Сервер сам закроет соединение по таймауту
      }, 45000);
    }
  }, []);

  const clearPingTimer = () => {
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
  };

  const handleAlertComplete = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const cleanup = () => {
    clearPingTimer();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  // Воспроизведение звука при новом алерте
  useEffect(() => {
    if (activeAlert?.event.audio_url) {
      const audio = new Audio(activeAlert.event.audio_url);
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('[Widget] Audio play failed:', e));
    }
  }, [activeAlert]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Загрузка виджета...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-gray-500 text-sm">Не удалось загрузить виджет</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden pointer-events-none">
      {/* Индикатор подключения (для отладки, можно скрыть) */}
      <div className="fixed top-2 left-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-white/50 text-[10px]">
          {isConnected ? 'LIVE' : 'OFF'}
        </span>
      </div>

      {/* Текущий алерт */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            key={activeAlert.id}
            className="fixed inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 5, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              style={{
                backgroundColor: (activeAlert.event.style?.bg_color || config.alert_style.bg_color) + 'E6',
                color: activeAlert.event.style?.text_color || config.alert_style.text_color,
                fontFamily: activeAlert.event.style?.font || config.alert_style.font,
                padding: '3rem 4rem',
                borderRadius: '2rem',
                minWidth: '400px',
                maxWidth: '600px',
                textAlign: 'center',
                boxShadow: `
                  0 0 100px ${(activeAlert.event.style?.bg_color || config.alert_style.bg_color)}80,
                  0 0 200px ${(activeAlert.event.style?.bg_color || config.alert_style.bg_color)}40,
                  0 30px 60px rgba(0,0,0,0.5),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
                border: `1px solid ${(activeAlert.event.style?.text_color || config.alert_style.text_color)}20`,
              }}
              onAnimationComplete={() => {
                // Автоматически скрываем через duration_sec
                const duration = (activeAlert.event.style?.duration_sec || config.alert_style.duration_sec) * 1000;
                setTimeout(handleAlertComplete, duration);
              }}
            >
              {/* Вспышка */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `radial-gradient(circle at center, ${activeAlert.event.style?.text_color || config.alert_style.text_color}40, transparent 70%)`,
                }}
              />

              <div className="relative">
                {/* Картинка (если есть) */}
                {activeAlert.event.image_url && (
                  <motion.img
                    src={activeAlert.event.image_url}
                    alt=""
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-2 border-white/30"
                  />
                )}

                {/* Имя донатера */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-semibold mb-3 opacity-90"
                >
                  {activeAlert.event.donor_name}
                </motion.p>

                {/* Сумма */}
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  className="text-7xl font-bold mb-4"
                  style={{ textShadow: `0 0 30px ${activeAlert.event.style?.text_color || config.alert_style.text_color}60` }}
                >
                  {activeAlert.event.amount}
                  <span className="text-2xl ml-2 opacity-80">coins</span>
                </motion.p>

                {/* Сообщение */}
                {activeAlert.event.message && (
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl opacity-90"
                  >
                    "{activeAlert.event.message}"
                  </motion.p>
                )}

                {/* Частицы */}
                <motion.div
                  className="absolute -top-8 -left-8 w-4 h-4 rounded-full"
                  animate={{ y: [-20, -100], x: [-20, 20], opacity: [1, 0], scale: [1, 0] }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ backgroundColor: activeAlert.event.style?.text_color || config.alert_style.text_color }}
                />
                <motion.div
                  className="absolute -top-4 right-0 w-3 h-3 rounded-full"
                  animate={{ y: [-10, -80], x: [10, -30], opacity: [1, 0], scale: [1, 0] }}
                  transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
                  style={{ backgroundColor: activeAlert.event.style?.text_color || config.alert_style.text_color }}
                />
                <motion.div
                  className="absolute top-8 -right-8 w-5 h-5 rounded-full"
                  animate={{ y: [-30, -120], x: [0, 40], opacity: [1, 0], scale: [1, 0] }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  style={{ backgroundColor: activeAlert.event.style?.text_color || config.alert_style.text_color }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}