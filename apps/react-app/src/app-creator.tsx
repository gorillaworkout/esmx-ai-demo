import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { createElement } from 'react';

export type CreateAppOptions = {
  renderToString?: (router: any) => Promise<string>;
};

export const appCreator = (
  router: Router,
  { renderToString }: CreateAppOptions = {}
): RouterMicroAppOptions => {
  return {
    mount(root: HTMLElement) {
      import('react-dom/client').then(({ createRoot }) => {
        const el = document.createElement('div');
        root.appendChild(el);
        const reactRoot = createRoot(el);
        reactRoot.render(
          createElement(RouterProvider, { router },
            createElement(RouterView)
          )
        );
        (root as any).__reactRoot = reactRoot;
      });
    },
    unmount(root: HTMLElement) {
      if ((root as any).__reactRoot) {
        (root as any).__reactRoot.unmount();
      }
    },
    async renderToString() {
      if (typeof renderToString !== 'function') return '';
      return renderToString(router);
    }
  };
};
