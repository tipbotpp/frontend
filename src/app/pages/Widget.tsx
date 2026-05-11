// Легковесный роутер для Widget
// Загружает Widget микро-приложение лениво
import { lazy, Suspense } from 'react';
import { useParams } from 'react-router';

const WidgetMicroApp = lazy(() =>
  import('@/micro-apps/widget').then(m => ({ default: m.WidgetApp }))
);

export function Widget() {
  const { streamToken } = useParams<{ streamToken: string }>();

  if (!streamToken) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-red-400">Ошибка: stream token не указан</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Загрузка виджета...</p>
          </div>
        </div>
      }
    >
      <WidgetMicroApp
        streamToken={streamToken}
        onReady={() => console.log('[Widget] Ready')}
        onError={(error) => console.error('[Widget] Error:', error)}
      />
    </Suspense>
  );
}
export default Widget;