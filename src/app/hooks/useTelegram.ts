import { useEffect, useState } from 'react';
import {
  init,
  retrieveLaunchParams,
  miniApp,
  hapticFeedback,
  mainButton,
  backButton,
  cloudStorage,
  openLink,
} from '@telegram-apps/sdk';
import {
  getTelegramInitDataRaw,
  getTelegramUserFromWebApp,
  isTelegramMiniApp,
} from '@/shared/telegram/initData';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState('');
  const [platform, setPlatform] = useState('unknown');
  const [version, setVersion] = useState('0.0');
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    let cancelled = false;

    const initTelegram = async () => {
      try {
        if (isTelegramMiniApp()) {
          window.Telegram!.WebApp!.ready();
        }

        await init();

        const launchParams = retrieveLaunchParams();
        const initDataObj = launchParams.initData;

        if (initDataObj?.user) {
          setUser({
            id: initDataObj.user.id,
            first_name: initDataObj.user.firstName,
            last_name: initDataObj.user.lastName,
            username: initDataObj.user.username,
            photo_url: initDataObj.user.photoUrl,
          });
        } else {
          const webAppUser = getTelegramUserFromWebApp();
          if (webAppUser) setUser(webAppUser);
        }

        const raw =
          launchParams.initDataRaw?.trim() || getTelegramInitDataRaw();
        if (raw) setInitData(raw);

        await miniApp.ready();
        miniApp.setHeaderColor('#6366f1');
        miniApp.setBackgroundColor('#f9fafb');

        setPlatform(miniApp.platform);
        setVersion(miniApp.version);
        setColorScheme(miniApp.colorScheme);
      } catch (error) {
        console.error('[Telegram] SDK init error:', error);

        const raw = getTelegramInitDataRaw();
        if (raw) setInitData(raw);

        const webAppUser = getTelegramUserFromWebApp();
        if (webAppUser) setUser(webAppUser);

        if (isTelegramMiniApp()) {
          const webApp = window.Telegram!.WebApp!;
          setPlatform(webApp.platform || 'unknown');
          setVersion(webApp.version || '0.0');
          setColorScheme(webApp.colorScheme || 'light');
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    initTelegram();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    isReady,
    user,
    initData,
    platform,
    version,
    colorScheme,

    ready: () => miniApp.ready(),
    close: () => close(),

    haptic: {
      impactLight: () => hapticFeedback.impactOccurred('light'),
      impactMedium: () => hapticFeedback.impactOccurred('medium'),
      impactHeavy: () => hapticFeedback.impactOccurred('heavy'),
      notificationSuccess: () => hapticFeedback.notificationOccurred('success'),
      notificationError: () => hapticFeedback.notificationOccurred('error'),
      selection: () => hapticFeedback.selectionChanged(),
    },

    mainButton: {
      show: () => mainButton.show(),
      hide: () => mainButton.hide(),
      setText: (text: string) => mainButton.setText(text),
      enable: () => mainButton.enable(),
      disable: () => mainButton.disable(),
      showLoader: () => mainButton.showLoader(),
      hideLoader: () => mainButton.hideLoader(),
      onClick: (fn: () => void) => mainButton.onClick(fn),
    },

    backButton: {
      show: () => backButton.show(),
      hide: () => backButton.hide(),
      onClick: (fn: () => void) => backButton.onClick(fn),
    },

    cloudStorage: {
      set: (key: string, value: string) => cloudStorage.setItem(key, value),
      get: (key: string) => cloudStorage.getItem(key),
      remove: (key: string) => cloudStorage.removeItem(key),
    },

    openLink: (url: string) => openLink(url),
  };
}
