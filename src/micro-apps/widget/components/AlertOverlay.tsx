import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { WidgetDonation } from '../hooks/useWidgetSocket';

interface AlertOverlayProps {
  donation: WidgetDonation;
  onComplete: () => void;
}

export function AlertOverlay({ donation, onComplete }: AlertOverlayProps) {
  const { style } = donation;
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(true);

    const timer = setTimeout(() => {
      setIsPlaying(false);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500);
    }, style.duration_sec * 1000);

    if (donation.audio_url) {
      const audio = new Audio(donation.audio_url);
      audio.volume = 0.9;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } else if (donation.message && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(donation.message);
      utterance.lang = 'ru-RU';
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }

    return () => {
      clearTimeout(timer);
      audioRef.current?.pause();
      speechSynthesis.cancel();
    };
  }, [donation, style.duration_sec, onComplete]);

  if (!isVisible) return null;

  const donorInitial =
    donation.donor_name.trim()[0]?.toUpperCase() || '?';

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
              backgroundColor: style.bg_color + 'E6',
              color: style.text_color,
              fontFamily: style.font,
              padding: '3rem 4rem',
              borderRadius: '2rem',
              minWidth: '400px',
              maxWidth: '600px',
              textAlign: 'center',
              boxShadow: `
                0 0 100px ${style.bg_color}80,
                0 0 200px ${style.bg_color}40,
                0 30px 60px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              border: `1px solid ${style.text_color}20`,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: `radial-gradient(circle at center, ${style.text_color}40, transparent 70%)`,
              }}
            />

            <div className="relative">
              {(donation.image_url || donation.donor_name) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30 overflow-hidden"
                >
                  {donation.image_url ? (
                    <img
                      src={donation.image_url}
                      alt={donation.donor_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    donorInitial
                  )}
                </motion.div>
              )}

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold mb-3 opacity-90"
              >
                {donation.donor_name}
              </motion.p>

              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                className="text-7xl font-bold mb-4"
                style={{ textShadow: `0 0 30px ${style.text_color}60` }}
              >
                {donation.amount}
                <span className="text-2xl ml-2 opacity-80">coins</span>
              </motion.p>

              {donation.message && (
                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl opacity-90"
                >
                  &ldquo;{donation.message}&rdquo;
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
