import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, User, Settings, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { userApi } from '../../services/api';
import type { User as UserType } from '../types';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user for navigation:', error);
    }
  };

  const isStreamer = user?.role === 'streamer';

  const viewerTabs = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/profile', icon: User, label: 'Профиль' }
  ];

  const streamerTabs = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/dashboard', icon: TrendingUp, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
    { path: '/profile', icon: User, label: 'Профиль' }
  ];

  const tabs = isStreamer ? streamerTabs : viewerTabs;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}