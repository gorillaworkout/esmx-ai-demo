import { Router, RouterMode } from '@esmx/router';
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
      'vanilla': () => ({
        mount() {}, unmount() {},
        renderToString(comp) {
           return `<div id="root">${comp?.template || comp?.component?.template || '<h1>Welcome to ESMX Host</h1>'}</div>`;
        }
      }),
      'vue3-app': (r) => vue3Creator.appCreator(r, { renderToString: vue3Render.renderToString }),
      'vue2-app': (r) => vue2Creator.appCreator(r, { renderToString: vue2Render.renderToString })
    }
  });

  await router.push(rc.params.url || '/');
  
  let html = '';
  try {
    const appName = router.route.app;
    if (appName) {
      const activeAppFactory = router.apps[appName];
      if (activeAppFactory) {
        const activeApp = await activeAppFactory(router);
        if (activeApp && activeApp.renderToString) {
          html = await activeApp.renderToString(router.route.component);
        }
      }
    } else {
      html = await router.renderToString();
    }
  } catch (err) {
    html = `<div id="root"><h1>SSR Error</h1><pre>${err.stack}</pre></div>`;
  }
  
  await rc.commit();
  rc.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ESMX Demo Hub</title>
  ${rc.preload()}
  ${rc.css()}
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
    header { padding: 1rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; display: flex; gap: 1.5rem; align-items: center; }
    header a { text-decoration: none; color: #111827; font-weight: 600; }
    header a:hover { color: #2563eb; }
    .container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <header>
    <a href="/">🏠 HOME</a>
    <a href="/vue3">🟢 VUE 3 MFE</a>
    <a href="/vue2">🟩 VUE 2 MFE</a>
    <a href="http://localhost:3007">🔵 REACT (Standalone) ↗</a>
  </header>

  <div class="container">
    ${html || '<h1>Welcome to ESMX Hub</h1><p>Select an app from the menu above.</p>'}
  </div>

  ${rc.importmap()}
  ${rc.moduleEntry()}
  ${rc.modulePreload()}
</body>
</html>`;
}
