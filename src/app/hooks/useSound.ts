import { useRef, useCallback } from 'react';

type SoundType = 'regular' | 'large' | 'record';

export function useSound() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    regular: null,
    large: null,
    record: null
  });

  // Инициализация звуков
  const init = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Создаём аудио элементы
    audioRefs.current.regular = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'); // Короткий звук
    audioRefs.current.large = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'); // Более длинный
    audioRefs.current.record = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'); // Фанфары

    // Настраиваем громкость
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = 0.3;
      }
    });
  }, []);

  const play = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.warn('Sound play failed:', err));
    }
  }, []);

  return { init, play };
}