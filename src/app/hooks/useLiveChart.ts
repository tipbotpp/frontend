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
  largeDonationThreshold = 500 
}: UseLiveChartProps = {}) {
  const [data, setData] = useState<LiveChartPoint[]>(initialData);
  const [maxDonation, setMaxDonation] = useState(0);
  const [flashType, setFlashType] = useState<'none' | 'large' | 'record'>('none');

  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addDonation = useCallback((donation: {
    id: number;
    amount: number;
    username: string;
    timestamp: string;
  }) => {
    setData(prevData => {
      const lastPoint = prevData[prevData.length - 1];
      const accumulatedAmount = (lastPoint?.amount || 0) + donation.amount;
      
      const isLarge = donation.amount >= largeDonationThreshold;
      const isRecord = donation.amount > maxDonation;
      
      if (isRecord) {
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
          second: '2-digit'
        }),
        amount: accumulatedAmount,
        donation: donation.amount,
        isNew: true,
        isLarge,
        isRecord,
        username: donation.username,
        id: donation.id
      };
      
      const updatedData = [...prevData, newPoint];
      
      setTimeout(() => {
        setData(current => 
          current.map(point => 
            point.id === donation.id 
              ? { ...point, isNew: false, isLarge: false, isRecord: false }
              : point
          )
        );
      }, 3000);
      
      return updatedData;
    });
  }, [maxDonation, largeDonationThreshold]);

  const triggerFlash = useCallback((type: 'large' | 'record') => {
    setFlashType(type);
    
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    
    flashTimeoutRef.current = setTimeout(() => {
      setFlashType('none');
    }, 1000);
  }, []);

  const setInitialData = useCallback((timeline: Array<{ time: string; amount: number }>) => {
    const converted = timeline.map((point, index) => ({
      time: new Date(point.time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      amount: point.amount,
      donation: index === 0 ? point.amount : point.amount - (timeline[index - 1]?.amount || 0),
      isNew: false,
      isLarge: false,
      isRecord: false,
      username: '',
      id: index
    }));
    
    setData(converted);
    const maxDon = Math.max(...converted.map(p => p.donation));
    setMaxDonation(maxDon);
  }, []);

  return {
    data,
    maxDonation,
    flashType,
    addDonation,
    setInitialData
  };
}