import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes.ts';

export default async function render(rc) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'react-app': () => import('@esmx/router-react').then(m => m.createMicroApp()),
      'vue3-app': () => import('@esmx/router-vue').then(m => m.createMicroApp()),
      'vue2-app': () => import('@esmx/router-vue').then(m => m.createMicroApp())
    }
  });

  await router.push(rc.params.url || '/');
  
  // Here the router itself renders the active micro-app!
  const html = await router.renderToString(rc);
  
  await rc.commit();
  rc.html = `<!DOCTYPE html><html><head>${rc.preload()}${rc.css()}</head><body><div id="app">${html}</div>${rc.importmap()}${rc.moduleEntry()}${rc.modulePreload()}</body></html>`;
}
