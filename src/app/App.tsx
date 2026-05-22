import { useState, useEffect } from 'react';
import { RouterProvider, type Router } from 'react-router';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';

const WELCOME_SEEN_KEY = 'tipbot_welcome_seen';

function AppLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}

export default function App() {
  const telegram = useTelegram();
  const { isAuthenticated, isLoading, error, checkAuth } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SEEN_KEY) !== 'true';
  });
  const [appRouter, setAppRouter] = useState<Router | null>(null);

  useEffect(() => {
    if (telegram.isReady) {
      console.log('[App] Telegram SDK ready');
      console.log('[App] Platform:', telegram.platform);
      console.log('[App] User:', telegram.user?.username);
    }
  }, [telegram.isReady, telegram.platform, telegram.user?.username]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAppRouter(null);
      return;
    }

    let cancelled = false;
    import('./routes').then(({ router }) => {
      if (!cancelled) {
        setAppRouter(router);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (isLoading) {
    return <AppLoader />;
  }

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

  if (!appRouter) {
    return <AppLoader />;
  }

  return <RouterProvider router={appRouter} />;
}
