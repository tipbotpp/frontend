// Контракт для Widget микро-приложения

export interface WidgetConfig {
  stream_token: string;
  streamer: {
    username: string;
    display_name: string;
  };
  alert_style: {
    bg_color: string;
    text_color?: string;
    font: string;
    duration_sec: number;
  };
  ws_url: string;
}

export interface WidgetProps {
  streamToken: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface WidgetAPI {
  mount: (container: HTMLElement, props: WidgetProps) => void;
  unmount: () => void;
  version: string;
}