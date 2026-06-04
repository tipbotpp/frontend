/** Mini App открыт внутри Telegram (не обычный браузер). */
export function isTelegramMiniApp(): boolean {
  return Boolean(window.Telegram?.WebApp);
}

/** Сырой initData для POST /auth/telegram — SDK + legacy WebApp API. */
export function getTelegramInitDataRaw(): string {
  const fromWebApp = window.Telegram?.WebApp?.initData?.trim();
  if (fromWebApp) return fromWebApp;
  return '';
}

export interface TelegramUserSnapshot {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

/** Пользователь из initDataUnsafe, если SDK ещё не распарсил. */
export function getTelegramUserFromWebApp(): TelegramUserSnapshot | null {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user?.id) return null;

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url,
  };
}
