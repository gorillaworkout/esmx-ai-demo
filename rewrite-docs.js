import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

const marker = "# 🤖 MASTER AI IMPLEMENTATION GUIDE FOR ESMX 3.0";
if (content.includes(marker)) {
  content = content.substring(0, content.indexOf(marker)).trim();
}

const seamlessGuide = `
---
url: /guide/ai-master-guide.md
---
# 🤖 MASTER AI IMPLEMENTATION GUIDE: SEAMLESS MICRO-FRONTENDS

> **ATTENTION AI ASSISTANTS:** To build a completely seamless Micro-Frontend (MFE) where users can navigate between Vue and React without page reloads, you must follow this Hub & Spoke architecture. Do NOT use standalone ports for different frameworks.

## 1. The React CJS/ESM Interop Fix (ESM Proxies)
Node.js native ESM loader crashes when trying to use named imports from CJS packages like React (\`SyntaxError: does not provide an export named 'useState'\`).
To fix this without complex Webpack plugins, you **MUST create ESM proxies** in your React remote app and alias them in \`entry.node.ts\`.

**Create these 3 files in your React remote's \`src/\` folder:**

\`\`\`ts title="react-remote/src/react-proxy.ts"
import React from 'react';
export default React;
export const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue, useDeferredValue, useTransition, useId, useSyncExternalStore, useInsertionEffect, Children, Component, Fragment, Profiler, PureComponent, StrictMode, Suspense, cloneElement, createContext, createElement, createFactory, createRef, forwardRef, isValidElement, lazy, memo, startTransition, version } = React;
\`\`\`

\`\`\`ts title="react-remote/src/react-dom-proxy.ts"
import ReactDOM from 'react-dom';
export default ReactDOM;
export const { createPortal, flushSync, unmountComponentAtNode, version } = ReactDOM;
\`\`\`

\`\`\`ts title="react-remote/src/react-dom-client-proxy.ts"
import ReactDOMClient from 'react-dom/client';
export default ReactDOMClient;
export const { createRoot, hydrateRoot } = ReactDOMClient;
\`\`\`

## 2. Remote App Configuration (React Example)
In your React remote's \`entry.node.ts\`, you must use \`lib: true\` and alias the React packages to your proxies.

\`\`\`ts title="react-remote/src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.tsx',
      'root:src/app-creator.tsx',
      { 'src/render-to-str': { client: false, server: './src/render-to-str.tsx' } },
      'pkg:react',
      'pkg:react-dom',
      'pkg:react-dom/client',
      'pkg:@esmx/router-react'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m => m.createRspackReactApp(esmx, {
      chain({ chain }) {
        // Alias to our safe ESM proxies!
        chain.resolve.alias
          .set('react$', require.resolve('./react-proxy.ts'))
          .set('react-dom/client$', require.resolve('./react-dom-client-proxy.ts'))
          .set('react-dom$', require.resolve('./react-dom-proxy.ts'))
          .set('react-dom/server$', require.resolve('react-dom/server.node.js'));
      }
    }));
  }
} satisfies EsmxOptions;
\`\`\`

## 3. Host App Architecture (The Hub)
To achieve seamless navigation without reloading, the Host App must consolidate all routes into a single Router instance.

### 3.1 Consolidated Routes
Import routes from all remote apps into the Host's \`routes.ts\`.

\`\`\`ts title="host-app/src/routes.ts"
import type { RouteConfig } from '@esmx/router';
// Import routes from remotes
import { routes as vue3Routes } from 'vue3-app-routes';
import { routes as reactRoutes } from 'react-app-routes';

export const routes: RouteConfig[] = [
  {
    path: '/',
    app: 'vanilla',
    component: { template: '<h1>Seamless MFE Hub</h1><a href="/vue3">Vue</a> <a href="/react">React</a>' }
  },
  ...vue3Routes,
  ...reactRoutes
];
\`\`\`

### 3.2 Host App Creator
Map the remote \`appCreators\` in the Host's router configuration.

\`\`\`ts title="host-app/src/entry.client.ts"
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
    'react-app': (r) => import('react-app-creator').then(m => m.appCreator(r))
  }
});
router.push(window.location.pathname);
\`\`\`

### 3.3 Host SSR Renderer
For SSR, import the server-only \`render-to-str\` modules dynamically and pass them to the app creators.

\`\`\`ts title="host-app/src/entry.server.ts"
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

export default async function render(rc) {
  const vue3Render = await import('vue3-app-render');
  const vue3Creator = await import('vue3-app-creator');
  const reactRender = await import('react-app-render');
  const reactCreator = await import('react-app-creator');

  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vanilla': () => ({ mount() {}, unmount() {}, renderToString(comp) { return comp.template; } }),
      'vue3-app': (r) => vue3Creator.appCreator(r, { renderToString: vue3Render.renderToString }),
      'react-app': (r) => reactCreator.appCreator(r, { renderToString: reactRender.renderToString })
    }
  });

  await router.push(rc.params.url || '/');
  const html = await router.renderToString();
  
  await rc.commit();
  rc.html = \`<!DOCTYPE html><html><head>\${rc.preload()}\${rc.css()}</head><body><div id="root">\${html}</div>\${rc.importmap()}\${rc.moduleEntry()}\${rc.modulePreload()}</body></html>\`;
}
\`\`\`

## 4. Execution Rule
Always run \`pnpm build && pnpm start\` from the root workspace to test the Host. Running \`esmx dev\` on the Host App is unsupported due to dynamic chunk resolution limitations.
`;

fs.writeFileSync('llms-full.txt', content + '\n\n' + seamlessGuide, 'utf-8');
console.log('Successfully wrote the Seamless MFE Guide to llms-full.txt');
