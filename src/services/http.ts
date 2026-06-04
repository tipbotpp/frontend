// src/services/http.ts

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev.api.tipbot.qu1nqqy.ru'
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development'

if (ENVIRONMENT === 'development') {
  console.log(`[HTTP] Environment: ${ENVIRONMENT}`)
  console.log(`[HTTP] API URL: ${API_BASE_URL}`)
  console.log(`[HTTP] Frontend URL: ${FRONTEND_URL}`)
}

/** Mock-авторизация только при `vite` dev (`npm run dev`), никогда в build. */
export const canUseMockAuth = () => import.meta.env.DEV

export const isLocalMode = () => {
  if (!canUseMockAuth()) return false
  const tgInitData = window.Telegram?.WebApp?.initData
  return !tgInitData || tgInitData === ''
}

export const MOCK_TOKEN = canUseMockAuth()
  ? import.meta.env.VITE_MOCK_TOKEN || 'mock_token_q9830md893sn9msdmafo'
  : ''

// Типы для ответа с ошибкой
interface ApiError {
  response: {
    status: number
    data: {
      message?: string
    }
  }
  message: string
  config?: {
    url?: string
  }
}

// Базовая функция запроса
async function baseRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  const response = await fetch(fullUrl, {
    ...options,
    credentials: 'include', // Куки
    headers: {
      'Content-Type': 'application/json',
      'X-App-Origin': FRONTEND_URL,
      'X-Environment': ENVIRONMENT,
      ...options.headers,
    },
  })

  // Успешный ответ — возвращаем данные
  if (response.ok) {
    // Если ответ пустой (204 No Content)
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    return undefined as T
  }

  // Ошибка — формируем ApiError совместимый с axios
  let data: { message?: string } = {}
  try {
    data = await response.json()
  } catch {
    // Ответ не JSON
  }

  const message = data?.message ?? `HTTP ${response.status}`

  if (ENVIRONMENT === 'development') {
    console.error(`[API Error ${response.status}]`, message)
  }

  if (response.status === 401) {
    console.warn('Unauthorized: session expired or not authenticated')
  }
  if (response.status === 403) {
    console.warn('Forbidden: insufficient permissions')
  }
  if (response.status === 404) {
    console.warn('Not Found:', url)
  }
  if (response.status === 429) {
    console.warn('Too Many Requests: rate limit exceeded')
  }
  if (response.status >= 500) {
    console.error('Server Error:', response.status)
  }

  const error = new Error(message) as Error & ApiError
  error.response = {
    status: response.status,
    data,
  }
  error.config = { url }
  error.message = message

  throw error
}

// Публичное API — полная совместимость с axios (response.data из коробки)
export const http = {
  get: <T = any>(url: string) => baseRequest<T>(url),

  post: <T = any>(url: string, data?: any) =>
    baseRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(url: string, data?: any) =>
    baseRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any) =>
    baseRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string) =>
    baseRequest<T>(url, { method: 'DELETE' }),

  request: async <T = any>(config: {
    url: string
    method?: string
    data?: any
    headers?: Record<string, string>
  }): Promise<T> => {
    return baseRequest<T>(config.url, {
      method: config.method || 'GET',
      body: config.data ? JSON.stringify(config.data) : undefined,
      headers: config.headers,
    })
  },
}

// Вспомогательные функции (обратная совместимость)
export const apiRequest = http.request
export const get = http.get
export const post = http.post
export const put = http.put
export const del = http.delete

export const isDev = () => import.meta.env.DEV
export const isProd = () => import.meta.env.PROD