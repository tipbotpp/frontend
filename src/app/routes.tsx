import { createHashRouter, Navigate } from 'react-router';
import { Suspense } from 'react';
import { Layout } from './components/Layout';
import { RouteErrorPage } from './components/RouteErrorPage';
import { lazyNamedWithRetry } from '@/shared/utils/lazyRetry';

const Home = lazyNamedWithRetry(() => import('./pages/Home'), 'Home');
const StreamerPage = lazyNamedWithRetry(() => import('./pages/StreamerPage'), 'StreamerPage');
const Dashboard = lazyNamedWithRetry(() => import('./pages/Dashboard'), 'Dashboard');
const Settings = lazyNamedWithRetry(() => import('./pages/Settings'), 'Settings');
const Profile = lazyNamedWithRetry(() => import('./pages/Profile'), 'Profile');
const Widget = lazyNamedWithRetry(() => import('./pages/Widget'), 'Widget');

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  );
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType<unknown>> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    Component: Layout,
    children: [
      { index: true, element: <LazyPage Component={Home} /> },
      { path: 'streamer/:streamerId', element: <LazyPage Component={StreamerPage} /> },
      { path: 'dashboard', element: <LazyPage Component={Dashboard} /> },
      { path: 'settings', element: <LazyPage Component={Settings} /> },
      { path: 'profile', element: <LazyPage Component={Profile} /> },
      { path: 'auth', element: <Navigate to="/" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: 'widget/:streamToken',
    errorElement: <RouteErrorPage />,
    element: <LazyPage Component={Widget} />,
  },
]);
