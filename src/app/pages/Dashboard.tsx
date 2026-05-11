// Легковесный роутер для Dashboard
// Загружает Dashboard микро-приложение ТОЛЬКО для стримеров
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/app/hooks/useAuth';

const DashboardMicroApp = lazy(() =>
  import('@/micro-apps/dashboard').then(m => ({ default: m.DashboardApp }))
);

export function Dashboard() {
  const { user, isLoading } = useAuth();

  // Пока загружается юзер — спиннер
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Не стример — редирект на главную
  if (user?.role !== 'streamer') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-6">
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-900 text-white px-4 sm:px-6 py-5 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-teal-300/80 text-xs sm:text-sm">Управление стримом</p>
      </div>

      <div className="px-4 sm:px-6 mt-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
            </div>
          }
        >
          <DashboardMicroApp
            userRole="streamer"
            onStreamToggle={(isStreaming) => {
              console.log('[Dashboard] Stream toggled:', isStreaming);
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
export default Dashboard;