import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTelegram } from './useTelegram'
import { authApi, userApi } from '@/services/api'
import { MOCK_TOKEN, canUseMockAuth } from '@/services/http'
import {
  getTelegramInitDataRaw,
  isTelegramMiniApp,
} from '@/shared/telegram/initData'
import type { User } from '@/app/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

function resolveInitData(sdkInitData: string): string {
  return sdkInitData.trim() || getTelegramInitDataRaw()
}

export function useAuth() {
  const telegram = useTelegram()
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const inTelegram = isTelegramMiniApp()

      if (inTelegram && !telegram.isReady) {
        return
      }

      const tgInitData = resolveInitData(telegram.initData)

      // В Telegram всегда логинимся по свежему initData (не используем чужую cookie)
      if (tgInitData) {
        console.log('[Auth] Mini App: login with Telegram initData')
        await authApi.login(tgInitData)
        const userData = await userApi.getMe()
        queryClient.setQueryData(['user', 'me'], userData)
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
        return
      }

      if (inTelegram) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Не удалось получить данные Telegram. Закройте и откройте Mini App снова.',
        })
        return
      }

      // Браузер без Telegram: существующая сессия
      try {
        const userData = await userApi.getMe()
        queryClient.setQueryData(['user', 'me'], userData)
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
        return
      } catch (error: any) {
        if (error.response?.status !== 401) {
          throw error
        }
      }

      const useMock = canUseMockAuth()

      if (!useMock) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Откройте приложение в Telegram Mini App',
        })
        return
      }

      console.log('[Auth] Local dev: login with mock token')
      await authApi.login(MOCK_TOKEN)
      const userData = await userApi.getMe()
      queryClient.setQueryData(['user', 'me'], userData)
      setState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    } catch (error: any) {
      console.error('Auth error:', error)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error?.message || 'Ошибка авторизации',
      })
    }
  }, [telegram.initData, telegram.isReady, queryClient])

  const logout = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {})
    } finally {
      queryClient.removeQueries({ queryKey: ['user', 'me'] })
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    }
  }, [queryClient])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...state,
    checkAuth,
    logout,
    telegramUser: telegram.user,
    isTelegramReady: telegram.isReady,
  }
}
