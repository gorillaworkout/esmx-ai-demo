import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

const router = new Router({
  root: '#root',
  mode: RouterMode.history,
  routes,
  apps: {
    'vanilla': () => ({
      mount(el, comp) { el.innerHTML = comp.template; return comp; },
      unmount(el) { el.innerHTML = ''; }
    }),
    'vue3-app': (r) => import('vue3-app-creator').then(m => m.appCreator(r)),
    'vue2-app': (r) => import('vue2-app-creator').then(m => m.appCreator(r))
  }
});

router.push(window.location.pathname);
