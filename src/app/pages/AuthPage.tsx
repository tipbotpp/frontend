import { Lock, AlertCircle, RefreshCw, Monitor } from 'lucide-react';
import { isLocalMode } from '@/services/http';

interface AuthPageProps {
  error?: string | null;
  isTelegramReady?: boolean;
  telegramUser?: any;
  onRetry?: () => void;
}

export function AuthPage({
  error,
  isTelegramReady,
  telegramUser,
  onRetry,
}: AuthPageProps) {
  const localDev = isLocalMode();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="tipbot-fade-up text-center max-w-md w-full">
        <div className="tipbot-logo-spin inline-flex items-center justify-center w-32 h-32 bg-white/50 backdrop-blur-sm rounded-full mb-6 overflow-hidden shadow-lg">
          <img
            src="/snack.webp"
            alt="Логотип"
            className="w-32 h-32 rounded-full object-cover object-[50%_100%]"
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-gray-800">TipBot</h1>
        <p className="text-gray-600 mb-8">Донаты для стримеров</p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {localDev ? (
            <>
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Локальный режим</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Используется mock токен для разработки
              </p>
              {error && (
                <div className="bg-red-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {error && onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Повторить попытку</span>
                </button>
              )}
            </>
          ) : isTelegramReady && telegramUser ? (
            <>
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Lock className="w-5 h-5" />
                <span className="font-medium">Авторизация через Telegram</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                {telegramUser.photo_url && (
                  <img
                    src={telegramUser.photo_url}
                    alt={telegramUser.first_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">
                    {telegramUser.first_name} {telegramUser.last_name || ''}
                  </p>
                  {telegramUser.username && (
                    <p className="text-sm text-gray-500">@{telegramUser.username}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">Выполняется вход...</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {!isTelegramReady ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Ожидание Telegram...</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Откройте приложение в Telegram
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Ошибка авторизации</span>
                  </div>
                  {error && (
                    <div className="w-full bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Повторить попытку</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>
            {localDev
              ? '🛠️ Режим разработки'
              : '🔐 Безопасная авторизация через Telegram'}
          </p>
        </div>
      </div>
    </div>
  );
}
