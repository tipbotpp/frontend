
interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface Window {
  Telegram?: {
    WebApp?: {
      initData?: string
      initDataUnsafe?: {
        user?: TelegramWebAppUser
      }
      ready: () => void
      platform?: string
      version?: string
      colorScheme?: string
    }
  }
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}