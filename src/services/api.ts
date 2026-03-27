import {apiRequest} from './http'

import {
    type Transaction,
  type User,
  type Streamer,
  type Donation,
  type StreamerSession,
  type AlertSettings,
  type PassiveIncomeSettings,
} from '../types'

/**
 * User API
*@see https://dev.api.tipbot.qu1nqqy.ru/user
*/

export const userApi = {
  async getProfile(): Promise<User> {
    return apiRequest<User>({
      method: 'GET',
      url: '/user/profile',
    })
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiRequest<User>({
      method: 'PATCH',
      url: '/user/profile',
      data,
    })
  },
  
  async updateBalance(amount: number): Promise<{balance: number}> {
    return apiRequest<{balance: number}> ({
        method: 'POST',
        url: '/user/balance',
        data: {amount},
    })
  },
}

/**
 * Streamer API
 * @see https://dev.api.tipbot.qu1nqqy.ru/streamers
 */
export const streamerApi = {
    async getAll(): Promise<Streamer[]> {
        return apiRequest<Streamer[]>({
            method: 'GET',
            url: '/streamers',
        })
    },

    async getById(id:string): Promise<Streamer> {
        return apiRequest<Streamer> ({
            method: 'GET',
            url: `/streamers/${id}`,
        })
    },

    async search(query:string): Promise<Streamer[]> {
        return apiRequest<Streamer[]>({
            method: 'GET',
            url: '/streamer/search',
            params: {q: query},
        })
    },

    async updateSettings(
        id: string,
        settings: Partial<Pick<Streamer, 'alertSettings' | 'stopWords' | 'passiveIncome'>>
    ) : Promise<Streamer> {
        return apiRequest<Streamer>({
            method: "PATCH",
            url: `/streamers/${id}/settings`,
            data:settings,
        })
    },
}

/**
 * Donation API
 * @see https://dev.api.tipbot.qu1nqqy.ru/donations
 */

export const donationApi = {
    async send(
        donation: Omit<Donation,'id' | 'timestamp' | 'status'>
    ): Promise<Donation> {
        return apiRequest<Donation> ({
            method: 'POST',
            url: '/donations',
            data: {
                ...donation,
                timestamp:new Date().toISOString(),
            },
        })
    },

    async getHistory(userId: string): Promise<Donation[]> {
        return apiRequest<Donation[]>({
            method: 'GET',
            url: `/users/${userId}/donations`
        })
    },

    async getByStreamer(streamerId: string): Promise<Donation[]> {
        return apiRequest<Donation[]>({
            method: 'GET',
            url: `/streamer/${streamerId}/donation`,
        })
    },
}

/**
 * Stream Session API
 * @see https://dev.api.tipbot.qu1nqqy.ru/sessions
 */
export const sessionApi = {
    async start(streamerId: string): Promise<StreamerSession> {
      return apiRequest<StreamerSession>({
        method: 'POST',
        url: `/streamers/${streamerId}/sessions`,
      })
    },
  
    async end(sessionId: string): Promise<StreamerSession> {
      return apiRequest<StreamerSession>({
        method: 'PATCH',
        url: `/sessions/${sessionId}/end`,
      })
    },

    async getCurrent(streamerId: string): Promise<StreamerSession | null> {
        return apiRequest<StreamerSession | null>({
            method: 'GET',
            url: `/streamers/${streamerId}/sessions/current`,
            validateStatus: (status) => status < 500,
        }).catch((error) => {
            if (error?.response?.status === 404) return null
            throw error
        })
    },

    async getStatus(sessionId: string): Promise<{
        totalEarned: number
        donationCount: number
        topDonor?: {name: string; amount: number}
    }> {
        return apiRequest({
            method: 'GET',
            url: `/sessions/${sessionId}/status`,
        })
    },
}

/**
 * Transaction API
 * @see https://dev.api.tipbot.qu1nqqy.ru/transactions
 */

export const transactionApi ={
    async getHistory(userId: string): Promise<Transaction[]> {
        return apiRequest<Transaction[]>({
            method: 'GET',
            url: `/users/${userId}/transactions`,
        })
    },
    
    async deposit(userId: string, amount:number, paymentMethod?: string): Promise<Transaction> {
        return apiRequest<Transaction>({
            method: 'POST',
            url: `/users/${userId}/deposit`,
            data: {
                amount,
                payment_method: paymentMethod,
            },
        })
    },
}

/**
 * Alert Settings API
 * @see https://dev.api.tipbot.qu1nqqy.ru/alerts
 */

export const alertApi = {
    async getSettings(streamerId: string): Promise<AlertSettings> {
        return apiRequest<AlertSettings> ({
            method: 'GET',
            url: `/streamers/${streamerId}/alerts`,
        })
    },

    async updateSettings(
        streamerId: string,
        settings: Partial<AlertSettings>
    ): Promise<AlertSettings> {
        return apiRequest<AlertSettings> ({
            method: 'PATCH',
            url: `/streamers/${streamerId}/alerts`,
            data: settings,
        })
    },
}

/**
 * Stop Words API
 * @see https://dev.api.tipbot.qu1nqqy.ru/stop-words
 */

export const stopWordsApi = {
    async getAll(streamerId: string): Promise<string[]> {
        return apiRequest<string[]>({
            method: 'GET',
            url: `/streamers/${streamerId}/stop-words`
        })
    },

    async add(streamerId: string, word:string): Promise<string[]> {
        return apiRequest<string[]>({
            method: 'POST',
            url: `/streamers/${streamerId}/stop-words`,
            data: {word},
        })
    },

    async remove(streamerId: string, word:string): Promise<void>{
        return apiRequest<void>({
            method: 'DELETE',
            url: `/streamers/${streamerId}/stop-word/${encodeURIComponent(word)}`,
        })
    },
}

/**
 *  Passive Income API
 * @see https://dev.api.tipbot.qu1nqqy.ru/passive-income
 */

export const passiveIncomeAPI = {
    async getSettings(streamerId: string): Promise<PassiveIncomeSettings> {
        return apiRequest<PassiveIncomeSettings>({
            method: 'GET',
            url: `/streamer/${streamerId}/passive-income`,
        })
    },

    async updateSetting(
        streamerId: string,
        settings: Partial<PassiveIncomeSettings>
    ): Promise<PassiveIncomeSettings>{
        return apiRequest<PassiveIncomeSettings>({
            method: 'PATCH',
            url: `/streamer/${streamerId}/passive-income`,
            data: settings,
        })
    },
}