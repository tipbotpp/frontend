// Контракт для Dashboard микро-приложения

export interface DashboardProps {
  userRole: 'streamer' | 'viewer';
  onStreamToggle?: (isStreaming: boolean) => void;
}

export interface DashboardAPI {
  mount: (container: HTMLElement, props: DashboardProps) => void;
  unmount: () => void;
  version: string;
}