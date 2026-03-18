import { createApp } from 'vue';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
export function createVueApp(router) {
  const app = createApp({
    setup() {
      useProvideRouter(router);
      return () => null; // Dummy root, router-view usually goes here
    },
    template: '<router-view></router-view>'
  });
  app.use(RouterPlugin);
  return { app };
}
