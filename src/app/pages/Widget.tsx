import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useWidgetSocket } from '../hooks/useWidgetSocket';
import { AlertQueue } from '../components/AlertQueue';
import { alertApi } from '../../services/api';
import type { AlertSettings } from '../types';

export function Widget() {
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState<AlertSettings>({
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
    image_enabled: true,
    tts_enabled: false,
    tts_voice: 'default',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Получаем параметры из URL
  const wsUrl = searchParams.get('ws') || null;
  searchParams.get('token');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const alertSettings = await alertApi.getSettings();
      if (alertSettings) {
        setSettings(alertSettings);
      }
    } catch (error) {
      console.warn('[Widget] Using default settings');
    } finally {
      setIsLoading(false);
    }
  };

  const { donations, isConnected, removeDonation } = useWidgetSocket(wsUrl);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Загрузка виджета...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      {/* Прозрачный фон для OBS */}
      
      {/* Статус подключения */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs">Disconnected</span>
          </>
        )}
      </motion.div>

      {/* Очередь алертов */}
      <AlertQueue
        donations={donations}
        settings={settings}
        onRemove={removeDonation}
      />

      {/* Тестовая кнопка (только для разработки) */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            const testDonation = {
              id: Date.now(),
              amount: Math.floor(Math.random() * 2000) + 100,
              message: 'Тестовый донат! 🎉',
              from_user: {
                id: 1,
                username: 'test_user',
                avatar_url: null,
              },
              created_at: new Date().toISOString(),
            };
            removeDonation(testDonation.id);
            window.dispatchEvent(new CustomEvent('test-donation', { detail: testDonation }));
          }}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          Тестовый донат
        </button>
      )}
    </div>
  );
}