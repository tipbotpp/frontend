import React, { useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './hooks/useAuth';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  // Показываем welcome экран пока загружается
  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  // Если авторизация в процессе или не успешна - показываем экран авторизации
  if (isLoading || !isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toaster />
      </>
    );
  }

  // Если авторизованы - показываем основное приложение
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}