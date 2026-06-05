/** Публичный URL виджета: #/widget/{token} или /widget/{token} */
export function isWidgetRoute(): boolean {
  return getWidgetStreamToken() !== null;
}

export function getWidgetStreamToken(): string | null {
  const hashMatch = window.location.hash.match(/^#\/?widget\/([^/?#]+)/);
  if (hashMatch?.[1]) {
    return decodeURIComponent(hashMatch[1]);
  }

  const pathMatch = window.location.pathname.match(/^\/widget\/([^/?#]+)/);
  if (pathMatch?.[1]) {
    return decodeURIComponent(pathMatch[1]);
  }

  return null;
}

/** Hash-router: /widget/... без # → #/widget/... */
export function ensureWidgetHashRoute(): void {
  const token = window.location.pathname.match(/^\/widget\/([^/?#]+)/)?.[1];
  if (!token || window.location.hash.match(/^#\/?widget\//)) return;
  window.location.replace(`${window.location.origin}${window.location.pathname}#/widget/${token}`);
}
