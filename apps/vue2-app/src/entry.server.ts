import { Router, RouterMode } from '@esmx/router';
import { createRenderer } from 'vue-server-renderer';
import { createVueApp } from './create-app';
import { routes } from './routes';

const renderer = createRenderer();

export default async function render(rc) {
  const router = new Router({ mode: RouterMode.memory, base: new URL(rc.params.url || '/', 'http://localhost'), routes });
  
  await router.push(rc.params.url || '/');
  
  const { app } = createVueApp(router);
  
  const html = await renderer.renderToString(app);
  
  await rc.commit();
  rc.html = `<!DOCTYPE html><html><head>${rc.preload()}${rc.css()}</head><body><div id="app">${html}</div>${rc.importmap()}${rc.moduleEntry()}${rc.modulePreload()}</body></html>`;
}
