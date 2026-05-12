import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AlertOverlay } from './AlertOverlay';
import type { WidgetDonation } from '../hooks/useWidgetSocket';

interface AlertQueueProps {
  donations: WidgetDonation[];
  settings: {
    bg_color: string;
    text_color: string;
    font: string;
    duration_sec: number;
    image_enabled: boolean;
    tts_enabled: boolean;
    tts_voice: string;
  };
  onRemove: (id: number) => void;
}

export function AlertQueue({ donations, settings, onRemove }: AlertQueueProps) {
  const [currentDonation, setCurrentDonation] = useState<WidgetDonation | null>(null);
  const [queue, setQueue] = useState<WidgetDonation[]>([]);

  useEffect(() => {
    if (donations.length > 0) {
      setQueue(prev => [...prev, ...donations]);
      // Очищаем входящие донаты
      donations.forEach(d => onRemove(d.id));
    }
  }, [donations]);

  useEffect(() => {
    if (!currentDonation && queue.length > 0) {
      // Берём следующий донат из очереди
      const next = queue[0];
      setCurrentDonation(next);
      setQueue(prev => prev.slice(1));
    }
  }, [currentDonation, queue]);

  const handleComplete = () => {
    setCurrentDonation(null);
  };


  return (
    <>
      {/* Индикатор очереди (для отладки) */}
      {queue.length > 0 && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
          Очередь: {queue.length}
        </div>
      )}

      {/* Быстрый скип */}
      <AnimatePresence>
        {currentDonation && (
          <AlertOverlay
            key={currentDonation.id}
            donation={currentDonation}
            settings={settings}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}