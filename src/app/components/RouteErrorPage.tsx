import { useRouteError } from 'react-router';

export function RouteErrorPage() {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : 'Не удалось загрузить страницу';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h1>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
        >
          Обновить приложение
        </button>
      </div>
    </div>
  );
}
