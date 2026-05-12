import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { WidgetDonation } from '../hooks/useWidgetSocket';

interface AlertOverlayProps {
  donation: WidgetDonation;
  settings: {
    bg_color: string;
    text_color: string;
    font: string;
    duration_sec: number;
    image_enabled: boolean;
    tts_enabled: boolean;
    tts_voice: string;
  };
  onComplete: () => void;
}

export function AlertOverlay({ donation, settings, onComplete }: AlertOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Запускаем анимацию появления
    setIsPlaying(true);

    // Автоматически скрываем через duration_sec
    const timer = setTimeout(() => {
      setIsPlaying(false);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500); // Ждём окончания анимации исчезновения
    }, settings.duration_sec * 1000);

    // TTS озвучка
    if (settings.tts_enabled && donation.message) {
      speakMessage(donation.message, settings.tts_voice);
    }

    // Звук доната
    playDonationSound(donation.amount);

    return () => clearTimeout(timer);
  }, []);

  const speakMessage = (text: string, _voice: string) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Выбор голоса
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0]; // Берём первый доступный
    }
    
    speechSynthesis.speak(utterance);
  };

  const playDonationSound = (amount: number) => {
    try {
      const audio = new Audio();
      
      // Разные звуки в зависимости от суммы
      if (amount >= 1000) {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'; // Фанфары
      } else if (amount >= 500) {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'; // Средний
      } else {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGA...'; // Обычный
      }
      
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch (error) {
      console.warn('Sound play failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.5,
            }}
            style={{
              backgroundColor: settings.bg_color + 'E6', // 90% opacity
              color: settings.text_color,
              fontFamily: settings.font,
              padding: '3rem 4rem',
              borderRadius: '2rem',
              minWidth: '400px',
              maxWidth: '600px',
              textAlign: 'center',
              boxShadow: `
                0 0 100px ${settings.bg_color}80,
                0 0 200px ${settings.bg_color}40,
                0 30px 60px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              border: `1px solid ${settings.text_color}20`,
            }}
          >
            {/* Вспышка при появлении */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: `radial-gradient(circle at center, ${settings.text_color}40, transparent 70%)`,
              }}
            />

            <div className="relative">
              {/* Аватар */}
              {settings.image_enabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30"
                >
                  {donation.from_user.username?.[0]?.toUpperCase() || '?'}
                </motion.div>
              )}

              {/* Имя пользователя */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold mb-3 opacity-90"
              >
                {donation.from_user.username || 'Аноним'}
              </motion.p>

              {/* Сумма */}
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                className="text-7xl font-bold mb-4"
                style={{ textShadow: `0 0 30px ${settings.text_color}60` }}
              >
                {donation.amount}
                <span className="text-2xl ml-2 opacity-80">coins</span>
              </motion.p>

              {/* Сообщение */}
              {donation.message && (
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl opacity-90"
                >
                  "{donation.message}"
                </motion.p>
              )}

              {/* Частицы */}
              <motion.div
                className="absolute -top-10 -left-10 w-4 h-4 rounded-full"
                animate={{
                  y: [-20, -100],
                  x: [-20, 20],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ backgroundColor: settings.text_color }}
              />
              <motion.div
                className="absolute -top-5 right-0 w-3 h-3 rounded-full"
                animate={{
                  y: [-10, -80],
                  x: [10, -30],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
                style={{ backgroundColor: settings.text_color }}
              />
              <motion.div
                className="absolute top-10 -right-10 w-5 h-5 rounded-full"
                animate={{
                  y: [-30, -120],
                  x: [0, 40],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                style={{ backgroundColor: settings.text_color }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}