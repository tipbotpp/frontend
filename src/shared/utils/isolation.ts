
let styleCounter = 0;

export function createIsolatedContainer(parentId: string): {
  container: HTMLElement;
  cleanup: () => void;
} {
  const id = `micro-app-${parentId}-${++styleCounter}`;
  const container = document.createElement('div');
  container.id = id;
  
  // CSS Containment для производительности
  container.setAttribute('data-micro-app', parentId);
  container.style.cssText = 'contain: content; isolation: isolate;';
  
  return {
    container,
    cleanup: () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    },
  };
}

// Базовый сброс стилей для микро-приложения
export const microAppStyles = `
  [data-micro-app] {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
  }
  [data-micro-app] *,
  [data-micro-app] *::before,
  [data-micro-app] *::after {
    box-sizing: border-box;
  }
`;