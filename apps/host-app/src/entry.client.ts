import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes.ts';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes,
  apps: {
    'react-app': () => import('@esmx/router-react').then(m => m.createMicroApp()),
    'vue3-app': () => import('@esmx/router-vue').then(m => m.createMicroApp()),
    'vue2-app': () => import('@esmx/router-vue').then(m => m.createMicroApp())
  }
});

router.push(window.location.pathname);
