import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import { userApi } from '../../services/api';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const telegram = useTelegram();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Если мы в Telegram и есть initData - пробуем авторизоваться
      if (telegram.isReady && telegram.user) {
        const userData = await userApi.getProfile();
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        // Если не в Telegram или нет initData
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: telegram.isReady
            ? 'Не удалось получить данные Telegram'
            : 'Приложение должно быть открыто в Telegram',
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error?.response?.data?.message || 'Ошибка авторизации',
      });
    }
  }, [telegram.isReady, telegram.user]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    checkAuth,
    logout,
    telegramUser: telegram.user,
    isTelegramReady: telegram.isReady,
  };
}