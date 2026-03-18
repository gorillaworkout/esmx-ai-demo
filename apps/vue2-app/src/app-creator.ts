import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin } from '@esmx/router-vue';
import Vue from 'vue';

Vue.use(RouterPlugin);

export type CreateAppOptions = {
  renderToString?: (app: any) => Promise<string>;
};

export const appCreator = (
  router: Router,
  { renderToString }: CreateAppOptions = {}
): RouterMicroAppOptions => {
  return {
    mount(root: HTMLElement) {
      const app = new Vue({ router, template: '<router-view></router-view>' });
      const el = document.createElement('div');
      root.appendChild(el);
      app.$mount(el);
      (root as any).__vue2App = app;
    },
    unmount(root: HTMLElement) {
      if ((root as any).__vue2App) {
        (root as any).__vue2App.$destroy();
      }
    },
    async renderToString() {
      if (typeof renderToString !== 'function') return '';
      const app = new Vue({ router, template: '<router-view></router-view>' });
      return renderToString(app);
    }
  };
};
