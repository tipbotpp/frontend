import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useTelegram } from './hooks/useTelegram';
import { WelcomeScreen } from './components/WelcomeScreen';

export default function App() {
  const telegram = useTelegram();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Инициализация Telegram Web App при загрузке
    if (telegram.isReady) {
      console.log('Telegram Web App initialized');
      console.log('User:', telegram.user);
      console.log('Platform:', telegram.platform);
    }
  }, [telegram.isReady]);

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}