import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';
import { router } from './routes';

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

function AuthenticatedApp() {
  const telegram = useTelegram();
  const { isAuthenticated, isLoading, error, checkAuth } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(WELCOME_SEEN_KEY) !== 'true';
  });

  useEffect(() => {
    if (telegram.isReady) {
      console.log('[App] Telegram SDK ready');
      console.log('[App] Platform:', telegram.platform);
      console.log('[App] User:', telegram.user?.username);
    }
  }, [telegram.isReady, telegram.platform, telegram.user?.username]);

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

  return <RouterProvider router={router} />;
}

export default AuthenticatedApp;
