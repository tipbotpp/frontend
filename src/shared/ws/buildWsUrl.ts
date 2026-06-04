/** Строит wss/ws URL на том же хосте, что и REST API (куки авторизации). */
export function buildWsUrl(path: string): string {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || 'https://dev.api.tipbot.qu1nqqy.ru';
  const url = new URL(apiBase);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = path.startsWith('/') ? path : `/${path}`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function buildViewerWsUrl(streamToken: string): string {
  return buildWsUrl(`/ws/viewer/${encodeURIComponent(streamToken)}`);
}
