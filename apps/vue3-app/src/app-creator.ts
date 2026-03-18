import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h } from 'vue';

export type CreateAppOptions = {
  afterCreateApp?: (app: any) => void;
  renderToString?: (app: any, context: any) => Promise<string>;
  ssrCtx?: Record<string, any>;
};

export const appCreator = (
  router: Router,
  { afterCreateApp, renderToString, ssrCtx = {} }: CreateAppOptions = {}
): RouterMicroAppOptions => {
  const app = createSSRApp({
    setup() {
      useProvideRouter(router);
    },
    render: () => h(RouterView)
  });
  app.use(RouterPlugin);
  afterCreateApp?.(app);
  return {
    mount(root: HTMLElement) {
      const ssrEl = root.querySelector('[data-server-rendered]');
      if (ssrEl) {
        app.mount(ssrEl);
      } else {
        const el = document.createElement('div');
        app.mount(el);
        root.appendChild(el);
      }
    },
    unmount() {
      app.unmount();
    },
    async renderToString() {
      if (typeof renderToString !== 'function') return '';
      return renderToString(app, ssrCtx);
    }
  };
};
