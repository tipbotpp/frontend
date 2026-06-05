import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/index.css'
import AuthenticatedApp from './app/App'
import { PublicWidgetPage } from './app/PublicWidgetPage'
import {
  ensureWidgetHashRoute,
  isWidgetRoute,
} from '@/shared/routing/widgetRoute'

ensureWidgetHashRoute()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

function RootApp() {
  if (isWidgetRoute()) {
    return <PublicWidgetPage />
  }
  return <AuthenticatedApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootApp />
      <Toaster
        position="top-center"
        richColors
        expand={false}
        duration={3000}
      />
    </QueryClientProvider>
  </StrictMode>,
)
