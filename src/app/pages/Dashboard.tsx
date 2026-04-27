import { useState, useEffect, useRef } from 'react';
import { Power, Copy, Check, ExternalLink, Volume2, VolumeX, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { streamApi } from '../../services/api';
import { donationApi } from '../../services/api';
import { useLiveChart } from '../hooks/useLiveChart';
import { useSound } from '../hooks/useSound';
import { LiveChart } from '../components/LiveChart';
import type { SessionStats } from '../types';

interface ExtendedStreamStatusResponse {
  is_live: boolean;
  session_id: number | null;
  started_at: string | null;
  widget_url: string | null;
  ws_url: string | null;
}

interface RealtimeDonation {
  id: number;
  amount: number;
  message: string | null;
  from_user: {
    id: number;
    username: string | null;
  };
  created_at: string;
}

export function Dashboard() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<ExtendedStreamStatusResponse | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [widgetUrl, setWidgetUrl] = useState('');
  
  const [recentDonations, setRecentDonations] = useState<RealtimeDonation[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔥 Хуки для графика и звука
  const { data: chartData, flashType, addDonation, setInitialData } = useLiveChart();
  const { init: initSound, play: playSound } = useSound();

  // Инициализация звука
  useEffect(() => {
    initSound();
  }, []);

  // Загрузка статуса стрима
  useEffect(() => {
    loadStreamStatus();
    loadSessionStats();
  }, []);

  // Подключение WebSocket
  useEffect(() => {
    if (isStreaming && streamStatus?.ws_url) {
      connectWebSocket(streamStatus.ws_url);
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [isStreaming, streamStatus?.ws_url]);

  const connectWebSocket = (wsUrl: string) => {
    try {
      console.log('[WebSocket] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        toast.success('Real-time график активирован');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'donation' && data.donation) {
            handleNewDonation(data.donation);
          } else if (data.amount) {
            handleNewDonation(data);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };
      
      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => {
        setIsConnected(false);
        if (isStreaming) {
          setTimeout(() => {
            if (isStreaming && streamStatus?.ws_url) {
              connectWebSocket(streamStatus.ws_url);
            }
          }, 3000);
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const handleNewDonation = (donation: RealtimeDonation) => {
    setRecentDonations(prev => [donation, ...prev].slice(0, 20));
    
    // 🔥 Добавляем точку на график
    addDonation({
      id: donation.id,
      amount: donation.amount,
      username: donation.from_user.username || 'Аноним',
      timestamp: donation.created_at
    });
    
    // 🔔 Звук
    if (soundEnabled) {
      if (donation.amount >= 1000) {
        playSound('record');
      } else if (donation.amount >= 500) {
        playSound('large');
      } else {
        playSound('regular');
      }
    }
    
    toast.success(
      <div className="flex items-center gap-2">
        <span>🎉</span>
        <span className="font-bold">{donation.from_user.username || 'Аноним'}</span>
        <span>•</span>
        <span className="font-bold text-green-400">+{donation.amount} coins</span>
      </div>,
      { duration: 3000 }
    );
    
    loadSessionStats();
  };

  const loadStreamStatus = async () => {
    try {
      const status = await streamApi.getStatus() as ExtendedStreamStatusResponse;
      setStreamStatus(status);
      setIsStreaming(status.is_live);
      if (status.widget_url) {
        setWidgetUrl(status.widget_url);
      }
    } catch (error) {
      console.error('Failed to load stream status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionStats = async () => {
    try {
      const stats = await donationApi.getSessionStats();
      setSessionStats(stats);
      
      // 🔥 Загружаем исторические данные в график
      if (stats.timeline && stats.timeline.length > 0) {
        setInitialData(stats.timeline);
      }
    } catch (error) {
      console.warn('Session stats not available yet');
    }
  };

  const handleCopyWidget = () => {
    if (widgetUrl) {
      navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStream = async () => {
    try {
      if (isStreaming) {
        const response = await streamApi.stop();
        toast.success(`Стрим завершён! Собрано: ${response.total_collected} coins`);
        setIsStreaming(false);
        setStreamStatus(null);
        setWidgetUrl('');
        setRecentDonations([]);
        disconnectWebSocket();
      } else {
        const response = await streamApi.start();
        setWidgetUrl(response.widget_url);
        setStreamStatus({
          is_live: true,
          session_id: response.session_id,
          started_at: response.started_at,
          widget_url: response.widget_url,
          ws_url: (response as any).ws_url || null,
        });
        toast.success('Стрим запущен!');
        setIsStreaming(true);
        setTimeout(() => loadSessionStats(), 1000);
      }
      await loadSessionStats();
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при управлении стримом');
    }
  };

  const formatDuration = () => {
    if (!streamStatus?.started_at) return '0ч 0м';
    const now = new Date();
    const startTime = new Date(streamStatus.started_at);
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.info(soundEnabled ? 'Звук выключен' : 'Звук включен');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 pb-6">
      {/* Header с анимацией */}
      <motion.div 
        className="bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-900 text-white px-6 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-2">Dashboard Стримера</h1>
        <p className="text-teal-300">Управление стримом в реальном времени</p>
      </motion.div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Stream Control */}
        <Card className="shadow-xl border-gray-800 bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Статус стрима</CardTitle>
              {isStreaming && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-400">
                    {isConnected ? 'Real-time активен' : 'Offline'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-950 to-emerald-950 rounded-xl border border-teal-800/30">
              <div>
                <p className="text-sm text-teal-400 mb-1">Текущий статус</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-600'}`} />
                  <p className="text-xl font-bold text-white">
                    {isStreaming ? 'В ЭФИРЕ' : 'Офлайн'}
                  </p>
                </div>
                {isStreaming && (
                  <p className="text-sm text-teal-400/70 mt-1">
                    Время в эфире: {formatDuration()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isStreaming && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSound}
                    className="border-teal-800/50 hover:bg-teal-950/50"
                    title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                  </Button>
                )}
                <Button
                  size="lg"
                  variant={isStreaming ? 'destructive' : 'default'}
                  onClick={handleToggleStream}
                  className={`gap-2 ${!isStreaming ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                >
                  <Power className="w-5 h-5" />
                  {isStreaming ? 'Завершить' : 'Начать стрим'}
                </Button>
              </div>
            </div>

            {widgetUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ссылка на виджет для OBS</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={widgetUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyWidget} className="border-gray-700">
                    {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(widgetUrl, '_blank')} className="border-gray-700">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-400">Собрано за сессию</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-teal-400">
                  {sessionStats?.total_collected || 0} <span className="text-sm text-teal-500">coins</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-400">Количество донатов</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-400">
                  {sessionStats?.donations_count || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardDescription className="text-gray-400">Топ донатер</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-white truncate">
                  {sessionStats?.top_donator?.username || '—'}
                </p>
                <p className="text-xl font-bold text-purple-400">
                  {sessionStats?.top_donator?.total_amount || 0} <span className="text-sm text-purple-500">coins</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 🔥 LIVE CHART */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-900 border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-teal-400" />
                  График поступлений
                  {isConnected && (
                    <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full font-normal">
                      LIVE
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {isConnected 
                    ? 'Обновляется в реальном времени' 
                    : 'Доходы за текущую сессию'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LiveChart 
                  data={chartData} 
                  flashType={flashType}
                  className="bg-gray-950/50 rounded-lg p-4"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Donations */}
        {isStreaming && recentDonations.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Последние донаты</CardTitle>
              <CardDescription className="text-gray-400">Real-time обновления</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {recentDonations.map((donation) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {(donation.from_user.username?.[0] || 'A').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-white truncate">
                            {donation.from_user.username || 'Аноним'}
                          </p>
                          <p className="font-bold text-teal-400">+{donation.amount} coins</p>
                        </div>
                        {donation.message && (
                          <p className="text-sm text-gray-400 truncate">{donation.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(donation.created_at).toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {!isStreaming && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <p className="text-gray-400 text-lg">Готовы начать стрим?</p>
                <p className="text-gray-500 text-sm mt-1">Нажмите "Начать стрим" для активации real-time графиков</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}