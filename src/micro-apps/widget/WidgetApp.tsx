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
  const { donations, isConnected, removeDonation } = useWidgetSocket(
    config?.ws_url || null
  );

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
      {/* Индикатор подключения */}
      <div className="fixed top-2 left-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-white/50 text-[10px]">
          {isConnected ? 'LIVE' : 'OFF'}
        </span>
      </div>

      {/* Очередь алертов */}
      <AlertQueue
        donations={donations}
        settings={{
          bg_color: config.alert_style.bg_color,
          text_color: config.alert_style.text_color || '#ffffff',
          font: config.alert_style.font,
          duration_sec: config.alert_style.duration_sec,
          image_enabled: false,
          tts_enabled: false,
          tts_voice: 'default',
        }}
        onRemove={removeDonation}
      />
    </div>
  );
}