import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { AlertOverlay } from './AlertOverlay';
import type { WidgetDonation } from '../hooks/useWidgetSocket';

interface AlertQueueProps {
  donations: WidgetDonation[];
  onRemove: (donationId: number) => void;
  onDisplayed: (donationId: number) => void;
}

export function AlertQueue({ donations, onRemove, onDisplayed }: AlertQueueProps) {
  const [currentDonation, setCurrentDonation] = useState<WidgetDonation | null>(null);
  const [queue, setQueue] = useState<WidgetDonation[]>([]);

  useEffect(() => {
    if (donations.length > 0) {
      setQueue((prev) => [...prev, ...donations]);
      donations.forEach((d) => onRemove(d.donation_id));
    }
  }, [donations, onRemove]);

  useEffect(() => {
    if (!currentDonation && queue.length > 0) {
      const next = queue[0];
      setCurrentDonation(next);
      setQueue((prev) => prev.slice(1));
    }
  }, [currentDonation, queue]);

  const handleComplete = useCallback(() => {
    if (currentDonation) {
      onDisplayed(currentDonation.donation_id);
    }
    setCurrentDonation(null);
  }, [currentDonation, onDisplayed]);

  return (
    <>
      {queue.length > 0 && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
          Очередь: {queue.length}
        </div>
      )}

      <AnimatePresence>
        {currentDonation && (
          <AlertOverlay
            key={currentDonation.donation_id}
            donation={currentDonation}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
