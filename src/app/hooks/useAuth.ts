import { useState, useEffect, useCallback } from 'react'
import { useTelegram } from './useTelegram'
import { authApi, userApi } from '@/services/api'
import { MOCK_TOKEN, canUseMockAuth } from '@/services/http'
import type { User } from '@/app/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const telegram = useTelegram()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const userData = await userApi.getMe()
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

      const tgInitData = telegram.initData?.trim() ?? ''
      const useMock = canUseMockAuth() && !tgInitData

      if (!useMock && !tgInitData) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: telegram.isReady
            ? 'Откройте приложение в Telegram Mini App'
            : 'Ожидание Telegram...',
        })
        return
      }

      const authData = useMock ? MOCK_TOKEN : tgInitData
      console.log(`[Auth] ${useMock ? 'Local dev' : 'Mini App'}: authenticating`)

      await authApi.login(authData)
      const userData = await userApi.getMe()

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
  }, [telegram.initData, telegram.isReady])

  const logout = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {})
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    }
  }, [])

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
