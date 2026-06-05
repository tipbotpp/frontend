import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router';
import { Home, User, Settings, TrendingUp } from 'lucide-react';
import { userApi } from '@/services/api';
import type { User as UserType } from '@/app/types';

export function Layout() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    userApi.getMe().then(setUser).catch(console.error);
  }, []);

  const isStreamer = user?.role === 'streamer';

  const viewerTabs = [
    { path: '/', icon: Home, label: 'Главная', end: true },
    { path: '/profile', icon: User, label: 'Профиль', end: true },
  ];

  const streamerTabs = [
    { path: '/', icon: Home, label: 'Главная', end: true },
    { path: '/dashboard', icon: TrendingUp, label: 'Dashboard', end: true },
    { path: '/settings', icon: Settings, label: 'Настройки', end: true },
    { path: '/profile', icon: User, label: 'Профиль', end: true },
  ];

  const tabs = isStreamer ? streamerTabs : viewerTabs;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
