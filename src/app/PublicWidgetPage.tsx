import { Suspense } from 'react';
import { getWidgetStreamToken } from '@/shared/routing/widgetRoute';
import { lazyNamedWithRetry } from '@/shared/utils/lazyRetry';

const WidgetMicroApp = lazyNamedWithRetry(
  () => import('@/micro-apps/widget'),
  'WidgetApp',
);

function WidgetLoader() {
  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
    </div>
  );
}

/** Публичный экран виджета — без auth и welcome (OBS Browser Source). */
export function PublicWidgetPage() {
  const streamToken = getWidgetStreamToken();

  if (!streamToken) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-red-400 text-sm">Ошибка: stream token не указан в URL</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<WidgetLoader />}>
      <WidgetMicroApp
        streamToken={streamToken}
        onReady={() => console.log('[Widget] Ready')}
        onError={(error) => console.error('[Widget] Error:', error)}
      />
    </Suspense>
  );
}
