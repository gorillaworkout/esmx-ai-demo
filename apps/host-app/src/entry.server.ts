import { renderToString } from '@vue/server-renderer';
import { Router, RouterMode } from '@esmx/router';
import { createApp } from './create-app';
import { routes } from './routes';

export default async function render(rc) {
  const vue3Render = await import('vue3-app-render');
  const vue3Creator = await import('vue3-app-creator');
  const vue2Render = await import('vue2-app-render');
  const vue2Creator = await import('vue2-app-creator');

  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vue3-app': () => vue3Creator.appCreator(router, {
        renderToString: vue3Render.renderToString
      }),
      'vue2-app': () => vue2Creator.appCreator(router, {
        renderToString: vue2Render.renderToString
      })
    }
  });

  await router.push(rc.params.url || '/');

  const { app } = createApp(router);
  const html = await renderToString(app);

  await rc.commit();
  rc.html = `<!DOCTYPE html><html><head>${rc.preload()}${rc.css()}</head><body style="margin:0"><div id="app">${html}</div>${rc.importmap()}${rc.moduleEntry()}${rc.modulePreload()}</body></html>`;
}
