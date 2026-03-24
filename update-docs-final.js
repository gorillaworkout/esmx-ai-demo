import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

// Bersihkan bagian MFE / React standalone lama jika ada
const markers = [
  "## React SSR Setup",
  "## Setup with React",
  "# 🤖 MASTER AI IMPLEMENTATION",
  "# Micro-Frontend (MFE) Architecture"
];

let cutIndex = content.length;
for (const marker of markers) {
  const idx = content.indexOf(marker);
  if (idx !== -1 && idx < cutIndex) {
    cutIndex = idx;
  }
}
content = content.substring(0, cutIndex).trim();

const mfeGuide = `

---
url: /guide/micro-frontend-architecture.md
---
# Micro-Frontend (MFE) Hub Architecture

> **AI ASSISTANT GUIDE:** Use this exact boilerplate when generating an ESMX 3.0 Micro-Frontend project. ESMX Module Linking works best when the Host App acts as a Router Hub, and Remote Apps act as libraries.

## 1. Workspace Setup
Use a monorepo setup (e.g., pnpm workspace).

\`\`\`json title="package.json"
{
  "name": "esmx-workspace",
  "private": true,
  "scripts": {
    "build": "pnpm -r run build",
    "start": "pnpm --filter host-app run start",
    "clean": "rm -rf apps/*/dist"
  }
}
\`\`\`

## 2. Remote App Configuration (Vue / React)
Remote apps are compiled as libraries. They export their routes, an app-creator, and a server-side renderer.

### \`src/entry.node.ts\`
Must set \`lib: true\`. 
For React 19, you must alias react to prevent duplicate hooks.

\`\`\`ts
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.ts', // or .tsx
      'root:src/app-creator.ts',
      { 'src/render-to-str': { client: false, server: './src/render-to-str.ts' } }, // SERVER ONLY
      'pkg:vue', // or 'pkg:react', 'pkg:react-dom', 'pkg:react-dom/client'
      'pkg:@esmx/router-vue' // or 'pkg:@esmx/router-react'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
    // FOR REACT: 
    // return import('@esmx/rspack-react').then(m => m.createRspackReactApp(esmx, {
    //   chain({ chain }) {
    //     chain.resolve.alias
    //       .set('react', require.resolve('react'))
    //       .set('react-dom/server', require.resolve('react-dom/server'))
    //       .set('react-dom/client', require.resolve('react-dom/client'))
    //       .set('react-dom', require.resolve('react-dom'));
    //   }
    // }));
  }
} satisfies EsmxOptions;
\`\`\`

### \`src/app-creator.ts\`
\`\`\`ts
import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h } from 'vue';

// For React, use RouterProvider and createRoot/hydrateRoot from react-dom/client
export const appCreator = (router: Router, { renderToString }: any = {}): RouterMicroAppOptions => {
  const app = createSSRApp({
    setup() { useProvideRouter(router); },
    render: () => h(RouterView)
  });
  app.use(RouterPlugin);
  return {
    mount(root: HTMLElement) { app.mount(root); },
    unmount() { app.unmount(); },
    async renderToString() {
      if (typeof renderToString !== 'function') return '';
      return renderToString(app);
    }
  };
};
\`\`\`

### \`src/render-to-str.ts\` (Server Only)
**CRITICAL:** Node.js ESM loader will crash if you use named imports from CJS packages (like \`@vue/server-renderer\` or \`react-dom/server\`) inside bundled remotes. You MUST bypass the bundler using Node's \`require\`.

\`\`\`ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function renderToString(app: any, context: any = {}): Promise<string> {
  const _renderer = require('@vue/server-renderer'); // or 'react-dom/server'
  const renderToString = _renderer.renderToString || _renderer.default?.renderToString || _renderer;
  const html = await renderToString(app, context);
  return \`<div id="root"><div data-server-rendered>\${html}</div></div>\`;
}
\`\`\`

## 3. Host App Configuration (The Hub)
The Host App acts as a shell. It combines remote routes and renders the active micro-app.

### \`src/entry.node.ts\`
\`\`\`ts
import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: { 'remote-app': '../remote-app/dist' },
    imports: {
      'remote-app-routes': 'remote-app/src/routes',
      'remote-app-creator': 'remote-app/src/app-creator',
      'remote-app-render': 'remote-app/src/render-to-str',
      'vue': 'remote-app/vue',
      '@esmx/router-vue': 'remote-app/@esmx/router-vue'
    }
  },
  async devApp(esmx) { return import('@esmx/rspack').then(m => m.createRspackHtmlApp(esmx)); },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const rc = await esmx.render({ params: { url: req.url } });
        res.setHeader('Content-Type', 'text/html');
        res.end(rc.html);
      });
    });
    server.listen(3004);
  }
} satisfies EsmxOptions;
\`\`\`

### \`src/routes.ts\`
\`\`\`ts
import { routes as remoteRoutes } from 'remote-app-routes';

export const routes = [
  {
    path: '/',
    app: 'vanilla',
    component: { template: '<h1>Welcome to Hub</h1><a href="/remote">Go to Remote</a>' }
  },
  ...remoteRoutes
];
\`\`\`

### \`src/entry.server.ts\`
\`\`\`ts
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

export default async function render(rc: any) {
  const remoteRender = await import('remote-app-render');
  const remoteCreator = await import('remote-app-creator');

  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vanilla': () => ({ mount() {}, unmount() {}, renderToString(c) { return c.template; } }),
      'remote-app': (r) => remoteCreator.appCreator(r, { renderToString: remoteRender.renderToString })
    }
  });

  await router.push(rc.params.url || '/');
  
  let html = '';
  const appName = router.route.app;
  if (appName) {
    const activeAppFactory = router.apps[appName];
    if (activeAppFactory) {
      const activeApp = await activeAppFactory(router);
      if (activeApp?.renderToString) html = await activeApp.renderToString(router.route.component);
    }
  } else {
    html = await router.renderToString();
  }
  
  await rc.commit();
  rc.html = \`<!DOCTYPE html><html><head>\${rc.preload()}\${rc.css()}</head><body>\${html}\${rc.importmap()}\${rc.moduleEntry()}</body></html>\`;
}
\`\`\`

### \`src/entry.client.ts\`
\`\`\`ts
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

const router = new Router({
  root: '#root',
  mode: RouterMode.history,
  routes,
  apps: {
    'vanilla': () => ({ mount(el, c) { el.innerHTML = c.template; return c; }, unmount(el) { el.innerHTML = ''; } }),
    'remote-app': (r) => import('remote-app-creator').then(m => m.appCreator(r))
  }
});
router.push(window.location.pathname);
\`\`\`
`;

fs.writeFileSync('llms-full.txt', content + '\n' + mfeGuide, 'utf-8');
console.log('Documentation updated perfectly.');
