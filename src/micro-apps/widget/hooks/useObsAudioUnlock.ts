import { useEffect } from 'react';

/** OBS Browser Source блокирует autoplay — пробуем разблокировать при старте. */
export function useObsAudioUnlock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const unlock = () => {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==',
      );
      audio.volume = 0.01;
      audio.play().catch(() => {});
    };

    unlock();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [enabled]);
}
