import { createSSRApp, h } from 'vue';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import type { Router } from '@esmx/router';

export function createApp(router: Router) {
  const app = createSSRApp({
    setup() { useProvideRouter(router); },
    render: () => h(RouterView)
  });
  app.use(RouterPlugin);
  return { app };
}
