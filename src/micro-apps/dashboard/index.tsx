import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { DashboardApp } from './DashboardApp';
import { microAppStyles, createIsolatedContainer } from '@/shared/utils/isolation';
import type { DashboardAPI, DashboardProps } from '@/shared/contracts/dashboard.contract';

let root: Root | null = null;
let cleanup: (() => void) | null = null;

export const Dashboard: DashboardAPI = {
  version: '1.0.0',

  mount(container: HTMLElement, props: DashboardProps) {
    const styleEl = document.createElement('style');
    styleEl.textContent = microAppStyles;
    document.head.appendChild(styleEl);

    const { container: isolatedContainer, cleanup: containerCleanup } =
      createIsolatedContainer('dashboard');

    container.appendChild(isolatedContainer);
    cleanup = () => {
      containerCleanup();
      styleEl.remove();
    };

    root = createRoot(isolatedContainer);
    root.render(<DashboardApp {...props} />);
  },

  unmount() {
    root?.unmount();
    root = null;
    cleanup?.();
  },
};

export { DashboardApp };