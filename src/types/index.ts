export interface User{
    id: string
    username:string
    role: 'streamer' | 'viewer'
    balance : number
    avatar?: string
}

export interface Streamer{
    id:string
    username:string
    avatar: string
    isLive: boolean
    description:string
    goal?: {
        description: string
        current: number
        target: number
    }
    alertSettings: AlertSettings
    stopWords: string[]
    passiveIncome: PassiveIncomeSettings
}

export interface AlertSettings{
    backgroundColor:string
    textColor: string
    font:string
    duraction: number
}

export interface PassiveIncomeSettings{
    enabled: boolean
    amount: number
    intervalMinutes: number
}

export interface Donation {
    id: string
    streamerId: string
    streamerName: string
    viewerId: string
    viewerName: string
    amount: number
    message: string
    timestamp: Date
    status: 'success' | 'rejected' | 'pending'
}

export interface StreamerSession{
    id:string
    streamerId: string
    startTime: Date
    endTime?: Date
    totalEarned: number
}