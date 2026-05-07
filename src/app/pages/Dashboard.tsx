import { useState, useEffect, useRef } from 'react';
import { Power, Copy, Check, ExternalLink, Volume2, VolumeX, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

  // 🔥 Рефы для актуальных значений в замыканиях
  const isStreamingRef = useRef(false);
  const streamStatusRef = useRef<ExtendedStreamStatusResponse | null>(null);

  const { data: chartData, flashType, addDonation, setInitialData } = useLiveChart();
  const { init: initSound, play: playSound } = useSound();

  // 🔥 Синхронизация рефов
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    streamStatusRef.current = streamStatus;
  }, [streamStatus]);

  useEffect(() => {
    initSound();
  }, []);

  useEffect(() => {
    loadStreamStatus();
    loadSessionStats();
  }, []);

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
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setIsConnected(true);
        toast.success('Real-time график активирован');
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 🔥 Исправление №2: правильный тип сообщений — new_alert
          if (data.type === 'new_alert') {
            handleNewDonation({
              id: data.donation_id,
              amount: data.amount,
              message: data.message || null,
              from_user: {
                id: 0,
                username: data.donor_name || 'Аноним',
              },
              created_at: new Date().toISOString(),
            });
          } else if (data.type === 'donation' && data.donation) {
            // Обратная совместимость
            handleNewDonation(data.donation);
          } else if (data.amount) {
            handleNewDonation(data);
          }
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => {
        setIsConnected(false);
        // 🔥 Исправление №1: используем рефы для актуальных значений
        if (isStreamingRef.current) {
          setTimeout(() => {
            if (isStreamingRef.current && streamStatusRef.current?.ws_url) {
              connectWebSocket(streamStatusRef.current.ws_url);
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
    addDonation({
      id: donation.id,
      amount: donation.amount,
      username: donation.from_user.username || 'Аноним',
      timestamp: donation.created_at,
    });

    // 🔥 Исправление №4: локальное обновление статистики вместо API-запроса
    setSessionStats(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        total_collected: prev.total_collected + donation.amount,
        donations_count: prev.donations_count + 1,
        top_donator: (() => {
          // Проверяем, стал ли этот донатер топом
          if (prev.top_donator && prev.top_donator.total_amount < donation.amount) {
            return {
              username: donation.from_user.username || 'Аноним',
              total_amount: donation.amount,
            };
          }
          return prev.top_donator;
        })(),
      };
    });

    if (soundEnabled) {
      if (donation.amount >= 1000) playSound('record');
      else if (donation.amount >= 500) playSound('large');
      else playSound('regular');
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
  };

  const loadStreamStatus = async () => {
    try {
      const status = await streamApi.getStatus() as ExtendedStreamStatusResponse;
      setStreamStatus(status);
      setIsStreaming(status.is_live);
      if (status.widget_url) setWidgetUrl(status.widget_url);

      // 🔥 Исправление №3: восстанавливаем ws_url если его нет
      if (status.is_live && !status.ws_url && status.widget_url) {
        const token = status.widget_url.split('/').pop();
        if (token) {
          const wsUrl = `wss://api.tipbot.qu1nqqy.ru/ws/viewer/${token}`;
          setStreamStatus(prev => ({ ...prev!, ws_url: wsUrl }));
        }
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
        // 🔥 Исправление №5: ws_url теперь есть в типе
        setStreamStatus({
          is_live: true,
          session_id: response.session_id,
          started_at: response.started_at,
          widget_url: response.widget_url,
          ws_url: response.ws_url || null,
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] pb-6">
      <motion.div
        className="bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-900 text-white px-4 sm:px-6 py-5 sm:py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-teal-300/80 text-xs sm:text-sm">Управление стримом</p>
      </motion.div>

      <div className="px-4 sm:px-6 mt-4 space-y-4">
        <Card className="shadow-lg border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {isStreaming ? 'В эфире' : 'Офлайн'}
                  </p>
                  {isStreaming && (
                    <p className="text-xs text-teal-400/70">{formatDuration()}</p>
                  )}
                </div>
                {isStreaming && (
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] text-gray-500">{isConnected ? 'Live' : 'Off'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {isStreaming && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSound}
                    className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isStreaming ? 'destructive' : 'default'}
                  onClick={handleToggleStream}
                  className={`gap-1.5 h-9 text-sm ${!isStreaming ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                >
                  <Power className="w-4 h-4" />
                  {isStreaming ? 'Завершить' : 'Начать'}
                </Button>
              </div>
            </div>

            {widgetUrl && isStreaming && (
              <div className="mt-3 pt-3 border-t border-gray-800/50">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={widgetUrl}
                    readOnly
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 truncate"
                  />
                  <Button variant="ghost" size="icon" onClick={handleCopyWidget} className="h-8 w-8 text-gray-400 hover:text-white">
                    {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => window.open(widgetUrl, '_blank')} className="h-8 w-8 text-gray-400">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-900/80 border-gray-800/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 mb-0.5">Собрано</p>
              <p className="text-lg font-bold text-teal-400">
                {sessionStats?.total_collected || 0}
                <span className="text-[10px] text-teal-500/70 ml-0.5">coins</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-800/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 mb-0.5">Донатов</p>
              <p className="text-lg font-bold text-blue-400">
                {sessionStats?.donations_count || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-800/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 mb-0.5">Топ</p>
              <p className="text-sm font-semibold text-white truncate">
                {sessionStats?.top_donator?.username || '—'}
              </p>
              <p className="text-xs font-bold text-purple-400">
                {sessionStats?.top_donator?.total_amount || 0}
                <span className="text-[10px] text-purple-500/70 ml-0.5">coins</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gray-900/80 border-gray-800/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <TrendingUpIcon className="w-4 h-4 text-teal-400" />
                  График
                  {isConnected && (
                    <span className="text-[10px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full">LIVE</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LiveChart
                  data={chartData}
                  flashType={flashType}
                  className="bg-gray-950/50 rounded-lg p-2"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isStreaming && recentDonations.length > 0 && (
          <Card className="bg-gray-900/80 border-gray-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Последние донаты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {recentDonations.map((donation) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2.5 bg-gray-800/40 rounded-lg border border-gray-700/30"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(donation.from_user.username?.[0] || 'A').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {donation.from_user.username || 'Аноним'}
                          </p>
                          <p className="text-sm font-bold text-teal-400 ml-2">+{donation.amount}</p>
                        </div>
                        {donation.message && (
                          <p className="text-xs text-gray-500 truncate">{donation.message}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {!isStreaming && (
          <Card className="bg-gray-900/80 border-gray-800/50">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="text-3xl mb-3">🚀</div>
                <p className="text-gray-400 text-sm">Готовы начать стрим?</p>
                <p className="text-gray-500 text-xs mt-1">Нажмите "Начать" для активации</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}