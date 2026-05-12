import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { WidgetApp } from './WidgetApp';
import { microAppStyles, createIsolatedContainer } from '@/shared/utils/isolation';
import type { WidgetAPI, WidgetProps } from '@/shared/contracts/widget.contract';

let root: Root | null = null;
let cleanup: (() => void) | null = null;

export const Widget: WidgetAPI = {
  version: '1.0.0',

  mount(container: HTMLElement, props: WidgetProps) {
    const styleEl = document.createElement('style');
    styleEl.textContent = microAppStyles;
    document.head.appendChild(styleEl);

    const { container: isolatedContainer, cleanup: containerCleanup } =
      createIsolatedContainer('widget');

    container.appendChild(isolatedContainer);
    cleanup = () => {
      containerCleanup();
      styleEl.remove();
    };

    root = createRoot(isolatedContainer);
    root.render(
      <WidgetApp
        streamToken={props.streamToken}
        onReady={props.onReady}
        onError={props.onError}
      />
    );
  },

  unmount() {
    if (root) {
      root.unmount();
      root = null;
    }
    cleanup?.();
  },
};

export { WidgetApp };