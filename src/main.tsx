import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/index.css'
import App from "./app/App"

// 🔥 React Query с агрессивным кэшем для Telegram Mini App
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 минута — данные считаются свежими
      gcTime: 10 * 60 * 1000,      // 10 минут — хранить в кэше после unmount
      retry: 1,                     // только 1 повтор при ошибке
      refetchOnWindowFocus: false,  // в Mini App нет окон
      refetchOnReconnect: true,     // обновить при переподключении
      structuralSharing: true,      // умное сравнение объектов
    },
    mutations: {
      retry: 1,                     // повтор мутаций 1 раз
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-center"
        richColors
        expand={false}
        duration={3000}
      />
    </QueryClientProvider>
  </StrictMode>,
)