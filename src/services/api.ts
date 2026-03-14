import {http, apiRequest} from './http'

import type {
  User,
  Streamer,
  Donation,
  StreamSession,
  Transaction,
  AlertSettings,
  PassiveIncomeSettings,
} from '../types'

/**
*@see https://api.tipbot.app/v1/user
*/

export const userApi = {
  async getProfile(): Promise<User> {
    return apiRequest<User>({
      method: 'GET',
      url: '/user/prfile',
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
 * @see https://api.tipbot.app/v1/streamers
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
            url: `/stremers/${10}`,
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
        return apiRequest<Stream>({
            method: "PATCH",
            url: `/streamers/${id}/settings`,
            data:settings,
        })
    },
}

/**
 * Donation API
 * @see https://api.tipbot.app/v1/donations
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

