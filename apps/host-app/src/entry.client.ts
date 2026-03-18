import { Router, RouterMode } from '@esmx/router';
import { createApp } from './create-app';
import { routes } from './routes';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes,
  apps: {
    'vue3-app': () => import('vue3-app-creator').then(m => m.appCreator(router)),
    'vue2-app': () => import('vue2-app-creator').then(m => m.appCreator(router))
  }
});

router.push(window.location.pathname).then(() => {
  const { app } = createApp(router);
  app.mount('#app');
});
