import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { useLocalCache } from './hooks/useLocalCache';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';

const WELCOME_SEEN_KEY = 'tipbot_welcome_seen';

export default function App() {
  const telegram = useTelegram();
  const { isAuthenticated, isLoading, error, checkAuth } = useAuth();
  const { isOnline } = useLocalCache();
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SEEN_KEY) !== 'true';
  });

  useEffect(() => {
    if (telegram.isReady) {
      console.log('[App] Telegram SDK ready');
      console.log('[App] Platform:', telegram.platform);
      console.log('[App] User:', telegram.user?.username);
    }
  }, [telegram.isReady]);

  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcome(false);
  };

  // Приветственный экран
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  // Загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Не авторизован
  if (!isAuthenticated) {
    return (
      <AuthPage 
        error={error}
        isTelegramReady={telegram.isReady}
        telegramUser={telegram.user}
        onRetry={checkAuth}
      />
    );
  }

  // Авторизован — основное приложение
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        richColors
        expand={false}
        duration={3000}
      />
    </>
  );
}