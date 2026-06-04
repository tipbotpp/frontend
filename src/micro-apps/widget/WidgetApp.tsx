import { useState, useEffect } from 'react';
import { widgetApi } from './services/widgetApi';
import { useWidgetSocket } from './hooks/useWidgetSocket';
import { AlertQueue } from './components/AlertQueue';
import type { WidgetConfig } from '@/shared/contracts/widget.contract';

interface WidgetAppProps {
  streamToken: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export function WidgetApp({ streamToken, onReady, onError }: WidgetAppProps) {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    donations,
    goal,
    isConnected,
    streamStopped,
    removeDonation,
    acknowledgeAlert,
  } = useWidgetSocket(config?.ws_url || null);

  useEffect(() => {
    loadConfig();
  }, [streamToken]);

  const loadConfig = async () => {
    try {
      const data = await widgetApi.getConfig(streamToken);
      setConfig(data);
      onReady?.();
    } catch (error) {
      console.error('[Widget] Failed to load config:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="fixed top-2 left-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            streamStopped
              ? 'bg-gray-400'
              : isConnected
                ? 'bg-green-400 animate-pulse'
                : 'bg-red-400'
          }`}
        />
        <span className="text-white/50 text-[10px]">
          {streamStopped ? 'OFFLINE' : isConnected ? 'LIVE' : 'CONNECTING'}
        </span>
      </div>

      {goal && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
            <div className="flex justify-between text-white text-sm mb-2">
              <span className="font-medium truncate">🎯 {goal.title}</span>
              <span className="text-purple-300 shrink-0 ml-2">{goal.percent}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(goal.percent, 100)}%` }}
              />
            </div>
            <p className="text-white/50 text-xs mt-1 text-right">
              {goal.current_amount} / {goal.target_amount} coins
            </p>
          </div>
        </div>
      )}

      <AlertQueue
        donations={donations}
        onRemove={removeDonation}
        onDisplayed={acknowledgeAlert}
      />
    </div>
  );
}
