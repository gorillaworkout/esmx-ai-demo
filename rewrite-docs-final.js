import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

// Bersihkan area guide MFE lama jika ada
const marker = "# 🤖 MASTER AI IMPLEMENTATION GUIDE";
if (content.includes(marker)) {
  content = content.substring(0, content.indexOf(marker)).trim();
}

const finalGuide = `
---
url: /guide/ai-master-guide.md
---
# 🤖 MASTER AI IMPLEMENTATION GUIDE FOR ESMX 3.0

> **ATTENTION AI ASSISTANTS:** Read this section carefully before generating any code. ESMX 3.0 has strict architectural boundaries for Micro-Frontends (MFE). Failure to follow these rules will result in \`SyntaxError\`, \`ReferenceError\`, or 500 Internal Server Errors.

## 1. The Golden Architecture Rule (Vue Hub + React Standalone)
ESMX's Module Linking is designed for **same-ecosystem sharing**. You MUST use this architecture:
- **Host App (Hub)**: Must be a Vue 3 application. It seamlessly orchestrates Vue 3 and Vue 2 remote apps within a single router.
- **React Apps**: MUST be generated as **100% standalone applications** running on their own ports (e.g., \`3007\`). 
- **DO NOT** attempt to import a React remote into a Vue Host App via SSR. The Node.js native ESM loader combined with Rspack's CJS hoisting will crash the server. Link to React apps using standard \`<a href="http://localhost:3007">\` tags.

---

## 2. Remote Vue Apps (Seamless Spokers)
Vue 2 and Vue 3 remote apps must be compiled as libraries.

### \`src/entry.node.ts\`
\`\`\`ts
import type { EsmxOptions } from '@esmx/core';
// For Vue 2, you must alias: chain.resolve.alias.set('vue$', require.resolve('vue/dist/vue.runtime.esm.js'));

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.ts',
      'root:src/app-creator.ts',
      { 'src/render-to-str': { client: false, server: './src/render-to-str.ts' } }, // Server-only!
      'pkg:vue',
      'pkg:@esmx/router-vue'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
  }
} satisfies EsmxOptions;
\`\`\`

### \`src/app-creator.ts\`
\`\`\`ts
import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterPlugin, RouterView, useProvideRouter } from '@esmx/router-vue';
import { createSSRApp, h } from 'vue';

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
      return typeof renderToString === 'function' ? renderToString(app) : '';
    }
  };
};
\`\`\`

### \`src/render-to-str.ts\` (Server Only)
**CRITICAL:** You MUST use \`require()\` to bypass Rspack ESM rewriting for CJS packages to prevent dev/start crashes.
\`\`\`ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function renderToString(app: any, context: any = {}): Promise<string> {
  const _renderer = require('@vue/server-renderer'); // 'vue-server-renderer' for Vue 2
  const renderer = _renderer.renderToString || _renderer.default?.renderToString || _renderer.createRenderer?.().renderToString || _renderer;
  const html = await renderer(app, context);
  return \`<div id="root"><div data-server-rendered>\${html}</div></div>\`;
}
\`\`\`

---

## 3. Host App Configuration (The Vue Hub)
The Host App initializes the \`@esmx/router\` and stitches the Vue remotes together.

### \`src/entry.node.ts\`
\`\`\`ts
import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: { 'vue3-app': '../vue3-app/dist' },
    imports: {
      'vue3-app-routes': 'vue3-app/src/routes',
      'vue3-app-creator': 'vue3-app/src/app-creator',
      'vue3-app-render': 'vue3-app/src/render-to-str',
      'vue': 'vue3-app/vue',
      '@esmx/router-vue': 'vue3-app/@esmx/router-vue'
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
import { routes as vue3Routes } from 'vue3-app-routes';

export const routes = [
  {
    path: '/',
    app: 'vanilla',
    component: { template: '<h1>Hub</h1><a href="/vue3">Vue</a> <a href="http://localhost:3007">React Standalone</a>' }
  },
  ...vue3Routes
];
\`\`\`

### \`src/entry.server.ts\` & \`src/entry.client.ts\`
\`\`\`ts
// SERVER
import { Router, RouterMode } from '@esmx/router';
import { routes } from './routes';

export default async function render(rc: any) {
  const vue3Render = await import('vue3-app-render');
  const vue3Creator = await import('vue3-app-creator');

  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes,
    apps: {
      'vanilla': () => ({ mount() {}, unmount() {}, renderToString(c) { return c.template; } }),
      'vue3-app': (r) => vue3Creator.appCreator(r, { renderToString: vue3Render.renderToString })
    }
  });

  await router.push(rc.params.url || '/');
  let html = await router.renderToString(); // Handles remote SSR natively!
  await rc.commit();
  rc.html = \`<!DOCTYPE html><html><head>\${rc.preload()}\${rc.css()}</head><body><div id="root">\${html}</div>\${rc.importmap()}\${rc.moduleEntry()}</body></html>\`;
}
\`\`\`

---

## 4. React Standalone Setup
React apps cannot be seamlessly linked into a Vue Host in ESMX 3.0 due to Node.js ESM strictness. Build them as standalone apps with \`lib: false\` (default).

### \`src/entry.node.ts\`
**CRITICAL:** You must alias React to prevent duplicate hook errors.
\`\`\`ts
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
import http from 'http';
const require = createRequire(import.meta.url);

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m => m.createRspackReactApp(esmx, {
      chain({ chain }) {
        chain.resolve.alias
          .set('react', require.resolve('react'))
          .set('react-dom/server', require.resolve('react-dom/server'))
          .set('react-dom/client', require.resolve('react-dom/client'))
          .set('react-dom', require.resolve('react-dom'));
      }
    }));
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const rc = await esmx.render({ params: { url: req.url } });
        res.setHeader('Content-Type', 'text/html');
        res.end(rc.html);
      });
    });
    server.listen(3007);
  }
} satisfies EsmxOptions;
\`\`\`

## 5. Execution Rule
Always run \`pnpm -r run build\` followed by \`pnpm start\` to test Host Apps locally. Running \`esmx dev\` on a Host App orchestrating remotes is unsupported.
`;

fs.writeFileSync('llms-full.txt', content + '\n\n' + finalGuide, 'utf-8');
console.log('Successfully wrote the FINAL, HONEST AI Guide to llms-full.txt');
