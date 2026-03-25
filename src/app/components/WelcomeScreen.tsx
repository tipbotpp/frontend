import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white"
      >
        <motion.div
          animate={{
            rotate: 720,
          }}
          transition={{
            duration: 2,
            ease: 'linear',
          }}
          className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mb-6 overflow-hidden"
        >
          <img
            src="/snack.webp"
            alt="Логотип"
            className="w-32 h-32 rounded-full object-cover object-[50%_100%]"
          />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-2"
        >
          Донаты
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-white/80"
        >
          для стримеров
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
