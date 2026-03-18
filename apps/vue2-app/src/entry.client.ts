import { Router, RouterMode } from '@esmx/router';
import { createVueApp } from './create-app';
import { routes } from './routes';

const router = new Router({ root: '#app', mode: RouterMode.history, routes });

router.push(window.location.pathname).then(() => {
  const { app } = createVueApp(router);
  app.$mount('#app');
});
