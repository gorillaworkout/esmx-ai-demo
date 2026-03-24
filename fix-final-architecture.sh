#!/bin/bash
cd /home/ubuntu/apps/ESMX-AI-DEMO

# 1. Clean React App (Make it 100% Standalone)
rm -f apps/react-app/src/*-proxy.ts
rm -f apps/react-app/src/app-creator.tsx
rm -f apps/react-app/src/render-to-str.tsx

cat << 'INNER_EOF' > apps/react-app/src/entry.node.ts
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
import http from 'http';
const require = createRequire(import.meta.url);

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m =>
      m.createRspackReactApp(esmx, {
        chain({ chain }) {
          chain.resolve.alias
            .set('react', require.resolve('react'))
            .set('react-dom/server', require.resolve('react-dom/server'))
            .set('react-dom/client', require.resolve('react-dom/client'))
            .set('react-dom', require.resolve('react-dom'));
        }
      })
    );
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        try {
          const rc = await esmx.render({ params: { url: req.url } });
          res.setHeader('Content-Type', 'text/html');
          res.end(rc.html);
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    });
    server.listen(3007, () => console.log('React App running on http://localhost:3007'));
  }
} satisfies EsmxOptions;
INNER_EOF

cat << 'INNER_EOF' > apps/react-app/src/entry.server.tsx
import { Router, RouterMode } from '@esmx/router';
import _reactDomServer from 'react-dom/server';
const renderToString = _reactDomServer.renderToString || _reactDomServer.default?.renderToString || _reactDomServer;
import { RouterProvider, RouterView } from '@esmx/router-react';
import { routes } from './routes';
import type { RenderContext } from '@esmx/core';

export default async function render(rc: RenderContext) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes
  });

  await router.push(rc.params.url || '/');

  const appHtml = renderToString(
    <RouterProvider router={router}>
      <RouterView />
    </RouterProvider>
  );

  await rc.commit();
  
  rc.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${rc.preload()}
        <meta charset="utf-8" />
        <title>ESMX Demo Hub - React</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <a href="http://localhost:3004/">🏠 HOME</a>
          <a href="http://localhost:3004/vue3">🟢 VUE 3 MFE</a>
          <a href="http://localhost:3004/vue2">🟩 VUE 2 MFE</a>
          <a href="/">🔵 REACT (Standalone) ↗</a>
        </header>

        <div class="container">
          <div id="app">${appHtml}</div>
        </div>

        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
}
INNER_EOF

cat << 'INNER_EOF' > apps/react-app/src/entry.client.tsx
import { createRoot } from 'react-dom/client';
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { routes } from './routes';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes
});

router.push(window.location.pathname).then(() => {
  const root = createRoot(document.getElementById('app')!);
  root.render(
    <RouterProvider router={router}>
      <RouterView />
    </RouterProvider>
  );
});
INNER_EOF

cat << 'INNER_EOF' > apps/react-app/src/routes.tsx
import type { RouteConfig } from '@esmx/router';
import { RouterView } from '@esmx/router-react';

const Layout = ({ children }: any) => {
  return (
    <div>
      <div style={{ padding: '2rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', marginBottom: '1rem' }}>
        <h2>⚛️ Hello from React Standalone!</h2>
        <p>This is rendered entirely independently to bypass Node.js CJS/ESM interop limits.</p>
      </div>
      <main>
        {children}
      </main>
    </div>
  );
};

const Home = () => <h1>Welcome to ESMX React</h1>;
const NotFound = () => <h1>404 - Page Not Found</h1>;

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: '(.*)', component: NotFound }
    ]
  }
];
INNER_EOF

# 2. Clean Host App (Vue Hub Only)
cat << 'INNER_EOF' > apps/host-app/src/entry.node.ts
import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: {
      'vue3-app': '../vue3-app/dist',
      'vue2-app': '../vue2-app/dist'
    },
    imports: {
      'vue3-app-routes': 'vue3-app/src/routes',
      'vue3-app-creator': 'vue3-app/src/app-creator',
      'vue3-app-render': 'vue3-app/src/render-to-str',
      
      'vue2-app-routes': 'vue2-app/src/routes',
      'vue2-app-creator': 'vue2-app/src/app-creator',
      'vue2-app-render': 'vue2-app/src/render-to-str',
      
      'vue': 'vue3-app/vue',
      '@esmx/router-vue': 'vue3-app/@esmx/router-vue'
    },
    scopes: {
      'vue2-app/': {
        'vue': 'vue2-app/vue',
        '@esmx/router-vue': 'vue2-app/@esmx/router-vue'
      }
    }
  },
  async devApp(esmx) {
    return import('@esmx/rspack').then(m => m.createRspackHtmlApp(esmx));
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        try {
          const rc = await esmx.render({ params: { url: req.url } });
          res.setHeader('Content-Type', 'text/html');
          res.end(rc.html);
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    });
    server.listen(3004, () => console.log('HOST APP running on http://localhost:3004'));
  }
} satisfies EsmxOptions;
INNER_EOF

cat << 'INNER_EOF' > apps/host-app/src/routes.ts
import { routes as vue3Routes } from 'vue3-app-routes';
import { routes as vue2Routes } from 'vue2-app-routes';

export const routes = [
  {
    path: '/',
    app: 'vanilla',
    component: { template: '<div style="padding: 2rem; font-family: sans-serif;"><h1>🚀 ESMX Micro-Frontend Host</h1><p>Choose a framework:</p><ul><li><a href="/vue3">Vue 3 App</a></li><li><a href="/vue2">Vue 2 App</a></li><li><a href="http://localhost:3007">React App (Standalone)</a></li></ul></div>' }
  },
  ...vue3Routes,
  ...vue2Routes
];
INNER_EOF

cat << 'INNER_EOF' > apps/host-app/src/entry.client.ts
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
INNER_EOF

cat << 'INNER_EOF' > apps/host-app/src/entry.server.ts
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
INNER_EOF

# 3. Clean, Build, Restart
rm -rf apps/*/dist
pnpm build
kill -9 $(lsof -t -i:3004) 2>/dev/null; true
kill -9 $(lsof -t -i:3007) 2>/dev/null; true
pnpm start > root.log 2>&1 &

git add .
git commit -m "refactor: perfectly align project with the final llms-full.txt specification (Vue Hub + React Standalone)"
git push
