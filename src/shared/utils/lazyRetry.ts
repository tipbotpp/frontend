import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Lazy import с автоперезагрузкой при 404 чанка (после деплоя старый кэш index.html).
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const retryKey = 'tipbot:chunk-reload';

    try {
      return await factory();
    } catch (error) {
      if (!sessionStorage.getItem(retryKey)) {
        sessionStorage.setItem(retryKey, '1');
        window.location.reload();
        await new Promise<void>(() => {});
      }
      sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
}

export function lazyNamedWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<Record<string, T>>,
  exportName: string,
): LazyExoticComponent<T> {
  return lazyWithRetry(() =>
    factory().then((module) => {
      const component = module[exportName];
      if (!component) {
        throw new Error(`Export "${exportName}" not found`);
      }
      return { default: component };
    }),
  );
}
