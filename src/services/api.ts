import { http } from './http'
import type {
  User,
  StreamerItem,
  StreamerProfile,
  StreamerListResponse,
  StreamerFilters,
  AlertSettings,
  AlertSettingsBody,
  StopWord,
  StopWordBody,
  PassiveIncomeSettings,
  PassiveIncomeBody,
  BalanceResponse,
  TopupResponse,
  DonationBody,
  DonationCreateResponse,
  DonationHistoryResponse,
  SessionStats,
  StreamStartBody,
  StreamStartResponse,
  StreamStopResponse,
  StreamStatusResponse,
  AuthResponse,
  UserRoleBody,
  UserUpdateBody,
  GoalBody,
} from '../app/types'

/**
 * Auth API
 */
export const authApi = {
  async login(initData: string): Promise<AuthResponse> {
    return http.post('/auth/telegram', { init_data: initData })
  },
}

/**
 * User API
 */
export const userApi = {
  async getMe(): Promise<User> {
    return http.get('/users/me')
  },

  async updateProfile(data: UserUpdateBody): Promise<User> {
    return http.patch('/users/me', data)
  },

  async setRole(role: 'streamer' | 'viewer'): Promise<User> {
    return http.patch('/users/me/role', { role })
  },

  async getStreamers(filters?: StreamerFilters): Promise<StreamerListResponse> {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.offset) params.append('offset', String(filters.offset))
    if (filters?.search) params.append('search', filters.search)
    
    const query = params.toString() ? `?${params}` : ''
    return http.get(`/users/streamers${query}`)
  },

  async getUserById(userId: number): Promise<StreamerProfile> {
    return http.get(`/users/${userId}`)
  },
}

/**
 * Balance API
 */
export const balanceApi = {
  async get(): Promise<BalanceResponse> {
    return http.get('/balance')
  },

  async topup(amount: number): Promise<TopupResponse> {
    return http.post('/balance/topup', { amount })
  },
}

/**
 * Donation API
 */
export const donationApi = {
  async send(donation: DonationBody): Promise<DonationCreateResponse> {
    return http.post('/donations', donation)
  },

  async getHistory(params?: { 
    limit?: number
    offset?: number
    type?: 'sent' | 'received'
  }): Promise<DonationHistoryResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.offset) searchParams.append('offset', String(params.offset))
    if (params?.type) searchParams.append('type', params.type)
    
    const query = searchParams.toString() ? `?${searchParams}` : ''
    return http.get(`/donations/history${query}`)
  },

  async getSessionStats(): Promise<SessionStats> {
    return http.get('/donations/session')
  },
}

/**
 * Stream API
 */
export const streamApi = {
  async start(body?: StreamStartBody): Promise<StreamStartResponse> {
    return http.post('/stream/start', body || {})
  },

  async stop(): Promise<StreamStopResponse> {
    return http.post('/stream/stop')
  },

  async getStatus(): Promise<StreamStatusResponse> {
    return http.get('/stream/status')
  },
}

/**
 * Alert Settings API
 */
export const alertApi = {
  async getSettings(): Promise<AlertSettings> {
    return http.get('/settings/alert')
  },

  async updateSettings(settings: AlertSettingsBody): Promise<AlertSettings> {
    return http.patch('/settings/alert', settings)
  },

  async sendTest(): Promise<{ status: string; message: string }> {
    return http.post('/settings/alert/test')
  },
}

/**
 * Goal Settings API
 */
export const goalApi = {
  async get(): Promise<{ title: string | null; target_amount: number; current_amount: number }> {
    return http.get('/settings/goal')
  },

  async update(goal: GoalBody): Promise<{ title: string | null; target_amount: number; current_amount: number }> {
    return http.patch('/settings/goal', goal)
  },
}

/**
 * Stop Words API
 */
export const stopWordsApi = {
  async getAll(): Promise<StopWord[]> {
    const response = await http.get<{ items: StopWord[] }>('/settings/stopwords')
    return (response as unknown as { items: StopWord[] }).items
  },

  async add(word: string): Promise<StopWord> {
    return http.post('/settings/stopwords', { word })
  },

  async remove(wordId: number): Promise<void> {
    return http.delete(`/settings/stopwords/${wordId}`)
  },
}

/**
 * Passive Income API
 */
export const passiveIncomeApi = {
  async getSettings(): Promise<PassiveIncomeSettings> {
    return http.get('/settings/passive-income')
  },

  async updateSettings(settings: PassiveIncomeBody): Promise<PassiveIncomeSettings> {
    return http.patch('/settings/passive-income', settings)
  },
}

/**
 * Widget API (публичный, без авторизации)
 */
export const widgetApi = {
  async getConfig(streamToken: string): Promise<{
    stream_token: string
    streamer: { username: string; display_name: string }
    alert_style: { bg_color: string; font: string; duration_sec: number }
    ws_url: string
  }> {
    return http.get(`/widget/${streamToken}`)
  },
}

/**
 * Health API (публичный)
 */
export const healthApi = {
  async check(): Promise<{ status: string }> {
    return http.get('/health')
  },
}