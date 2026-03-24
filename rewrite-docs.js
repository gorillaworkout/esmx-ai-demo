import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

const targetStr = `**\`src/entry.server.ts\` (Host App):**
\`\`\`ts
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';
// Use static imports for SSR rendering functions to bypass Node's ESM/CJS interop crash
import { renderToString as vue3Render } from 'vue3-app/src/render-to-str';
import { appCreator as vue3Creator } from 'vue3-app/src/app-creator';

export default async function render(rc) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vue3-app': () => vue3Creator.appCreator(router, { renderToString: vue3Render.renderToString })
    }
  });
  await router.push(rc.params.url || '/');
  const html = await router.renderToString();
  await rc.commit();
  rc.html = \`...inject html...\`;
}`;

const replaceStr = `**\`src/entry.server.ts\` (Host App):**
\`\`\`ts
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

export default async function render(rc) {
  // Use dynamic imports to load remote renderers
  const vue3Render = await import('vue3-app-render');
  const vue3Creator = await import('vue3-app-creator');

  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vue3-app': (r) => vue3Creator.appCreator(r, { renderToString: vue3Render.renderToString })
    }
  });
  
  await router.push(rc.params.url || '/');
  
  let html = '';
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
  
  await rc.commit();
  
  // Example of a hardcoded shell (Hub Layout) with React as a standalone link
  rc.html = \`<!DOCTYPE html>
<html>
  <head>\${rc.preload()}\${rc.css()}</head>
  <body>
    <header>
      <a href="/">Home</a>
      <a href="/vue3">Vue 3 MFE</a>
      <a href="http://localhost:3007">React (Standalone)</a>
    </header>
    <div id="root">\${html || '<h1>Empty</h1>'}</div>
    \${rc.importmap()}\${rc.moduleEntry()}\${rc.modulePreload()}
  </body>
</html>\`;
}`;

if (content.includes('Use static imports for SSR rendering')) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('llms-full.txt', content, 'utf-8');
  console.log('Docs updated');
}
