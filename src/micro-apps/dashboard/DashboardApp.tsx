import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { streamApi, donationApi } from './services/streamApi';
import { useLiveChart } from './hooks/useLiveChart';
import { useSound } from './hooks/useSound';
import { LiveChart } from './components/LiveChart';
import type { SessionStats, StreamStartResponse, StreamStatusResponse } from '@/app/types';
import type { DashboardProps } from '@/shared/contracts/dashboard.contract';
import { Power, Copy, Check, ExternalLink, Volume2, VolumeX, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export function DashboardApp({ onStreamToggle }: DashboardProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<StreamStatusResponse | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [widgetUrl, setWidgetUrl] = useState('');
  const [recentDonations, setRecentDonations] = useState<RealtimeDonation[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const isStreamingRef = useRef(false);

  const { data: chartData, flashType, setInitialData } = useLiveChart();
  const { init: initSound } = useSound();

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    initSound();
    loadInitialData();
    return () => wsRef.current?.close();
  }, []);

  const loadInitialData = async () => {
    try {
      const status = await streamApi.getStatus();
      setStreamStatus(status);
      setIsStreaming(status.is_live);
      if (status.widget_url) setWidgetUrl(status.widget_url);

      if (status.is_live) {
        const stats = await donationApi.getSessionStats();
        setSessionStats(stats);
        if (stats.timeline?.length) {
          setInitialData(stats.timeline);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
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
        wsRef.current?.close();
      } else {
        const response: StreamStartResponse = await streamApi.start();
        setWidgetUrl(response.widget_url);
        setStreamStatus({
          is_live: true,
          session_id: response.session_id,
          started_at: response.started_at,
          widget_url: response.widget_url,
          ws_url: response.ws_url,
        });
        toast.success('Стрим запущен!');
        setIsStreaming(true);
        setTimeout(() => loadInitialData(), 1000);
      }
      onStreamToggle?.(!isStreaming);
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при управлении стримом');
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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.info(soundEnabled ? 'Звук выключен' : 'Звук включен');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
          <p className="text-gray-400">Загрузка Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800/50">
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
  );
}