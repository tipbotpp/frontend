import { useState, useCallback, useRef } from 'react';

export interface LiveChartPoint {
  time: string;
  amount: number;
  donation: number;
  isNew: boolean;
  isLarge: boolean;
  isRecord: boolean;
  username: string;
  id: number;
}

interface UseLiveChartProps {
  initialData?: LiveChartPoint[];
  largeDonationThreshold?: number;
}

export function useLiveChart({
  initialData = [],
  largeDonationThreshold = 500,
}: UseLiveChartProps = {}) {
  const [data, setData] = useState<LiveChartPoint[]>(initialData);
  const [maxDonation, setMaxDonation] = useState(0);
  const [flashType, setFlashType] = useState<'none' | 'large' | 'record'>('none');

  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 🔥 Реф для актуального maxDonation в замыкании
  const maxDonationRef = useRef(0);

  const triggerFlash = useCallback((type: 'large' | 'record') => {
    setFlashType(type);

    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }

    flashTimeoutRef.current = setTimeout(() => {
      setFlashType('none');
    }, 1000);
  }, []);

  const addDonation = useCallback(
    (donation: { id: number; amount: number; username: string; timestamp: string }) => {
      const isLarge = donation.amount >= largeDonationThreshold;
      const isRecord = donation.amount > maxDonationRef.current;

      if (isRecord) {
        maxDonationRef.current = donation.amount;
        setMaxDonation(donation.amount);
      }

      if (isRecord) {
        triggerFlash('record');
      } else if (isLarge) {
        triggerFlash('large');
      }

      const newPoint: LiveChartPoint = {
        time: new Date(donation.timestamp).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        amount: (data.length > 0 ? data[data.length - 1].amount : 0) + donation.amount,
        donation: donation.amount,
        isNew: true,
        isLarge,
        isRecord,
        username: donation.username,
        id: donation.id,
      };

      // 🔥 Исправление №6: setState без setTimeout внутри
      setData((prev) => [...prev, newPoint]);

      // 🔥 setTimeout вынесен из setState
      setTimeout(() => {
        setData((current) =>
          current.map((point) =>
            point.id === donation.id
              ? { ...point, isNew: false, isLarge: false, isRecord: false }
              : point
          )
        );
      }, 3000);
    },
    [largeDonationThreshold, triggerFlash, data]
  );

  const setInitialData = useCallback(
    (timeline: Array<{ time: string; amount: number }>) => {
      const converted = timeline.map((point, index) => {
        // 🔥 Исправление №7: корректный парсинг времени
        const date = parseTimelineTime(point.time);

        return {
          time: date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          amount: point.amount,
          donation:
            index === 0
              ? point.amount
              : point.amount - (timeline[index - 1]?.amount || 0),
          isNew: false,
          isLarge: false,
          isRecord: false,
          username: '',
          id: index,
        };
      });

      setData(converted);
      const maxDon = Math.max(...converted.map((p) => p.donation));
      setMaxDonation(maxDon);
      maxDonationRef.current = maxDon;
    },
    []
  );

  return {
    data,
    maxDonation,
    flashType,
    addDonation,
    setInitialData,
  };
}

/** Парсит время из разных форматов */
function parseTimelineTime(timeStr: string): Date {
  // ISO формат: "2026-03-10T14:30:00"
  if (timeStr.includes('T')) {
    return new Date(timeStr);
  }

  // Формат "HH:MM" или "HH:MM:SS"
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
    return date;
  }

  return new Date();
}