import { createHashRouter, Navigate } from 'react-router';
import { Suspense, lazy } from 'react';
import { Layout } from './components/Layout';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const StreamerPage = lazy(() => import('./pages/StreamerPage').then(m => ({ default: m.StreamerPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Widget = lazy(() => import('./pages/Widget').then(m => ({ default: m.Widget })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  );
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType<any>> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    path: '/',
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
    element: <LazyPage Component={Widget} />,
  },
]);