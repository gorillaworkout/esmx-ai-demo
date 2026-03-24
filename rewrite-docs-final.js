import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

// Hapus bagian MASTER AI GUIDE yang lama untuk diganti dengan format dokumentasi resmi
const marker = "# 🤖 MASTER AI IMPLEMENTATION GUIDE FOR ESMX 3.0";
if (content.includes(marker)) {
  content = content.substring(0, content.indexOf(marker)).trim();
}

const officialMFEGuide = `

---
url: /guide/micro-frontend-architecture.md
---
# Micro-Frontend (MFE) Architecture

ESMX is built from the ground up to support Micro-Frontend (MFE) architectures using Module Linking. In an ESMX MFE setup, you typically have one **Host App (Hub)** that manages the routing, and multiple **Remote Apps** that act as UI libraries.

## 1. Remote App Configuration (The Micro-Apps)
Remote applications should not act as standalone servers in a production MFE environment. Instead, they must be compiled as libraries (\`lib: true\`) and export their routing and rendering logic.

### 1.1 \`src/entry.node.ts\`
The remote app must export its routes, an app creator, and a server-only renderer stringifier.

\`\`\`ts title="remote-app/src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  modules: {
    lib: true, // Crucial: Marks this app as a remote library
    exports: [
      'root:src/routes.ts',
      'root:src/app-creator.ts',
      // The render-to-str module is strictly for the server environment
      { 'src/render-to-str': { client: false, server: './src/render-to-str.ts' } },
      'pkg:vue', // or 'pkg:react', etc.
      'pkg:@esmx/router-vue' // or 'pkg:@esmx/router-react'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
    // For React, you MUST add alias to prevent duplicate hooks:
    // chain.resolve.alias.set('react', require.resolve('react')).set('react-dom', require.resolve('react-dom'))
    // For Vue 2, you MUST add alias to prevent missing module errors:
    // chain.resolve.alias.set('vue$', require.resolve('vue/dist/vue.runtime.esm.js'))
  }
} satisfies EsmxOptions;
\`\`\`

### 1.2 \`src/app-creator.ts\`
The \`app-creator\` acts as the bridge between the Host's router and the Remote's framework. It must return \`mount\`, \`unmount\`, and \`renderToString\`.

\`\`\`ts title="remote-app/src/app-creator.ts"
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
    mount(root: HTMLElement) { 
        app.mount(root);
    },
    unmount() { app.unmount(); },
    async renderToString() {
      if (typeof renderToString !== 'function') return '';
      return renderToString(app);
    }
  };
};
\`\`\`

### 1.3 \`src/render-to-str.ts\` (Server Only)
**Critical Note:** To avoid Node.js CJS/ESM interop \`SyntaxError\` during SSR, you MUST use Node's \`require\` to load the underlying framework renderer.

\`\`\`ts title="remote-app/src/render-to-str.ts"
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function renderToString(app: any, context: any = {}): Promise<string> {
  // Use require to bypass Rspack ESM static analysis
  const _vueServerRenderer = require('@vue/server-renderer'); // or 'react-dom/server'
  const renderer = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;
  
  const html = await renderer(app, context);
  return \`<div id="root"><div data-server-rendered>\${html}</div></div>\`;
}
\`\`\`

## 2. Host App Configuration (The Hub)
The Host App initializes the \`@esmx/router\` and stitches the remote apps together.

### 2.1 \`src/entry.node.ts\`
Link the remote directories and map their imports.

\`\`\`ts title="host-app/src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: {
      'remote-app': '../remote-app/dist'
    },
    imports: {
      'remote-app-routes': 'remote-app/src/routes',
      'remote-app-creator': 'remote-app/src/app-creator',
      'remote-app-render': 'remote-app/src/render-to-str',
      'vue': 'remote-app/vue',
      '@esmx/router-vue': 'remote-app/@esmx/router-vue'
    }
  },
  async devApp(esmx) {
    return import('@esmx/rspack').then(m => m.createRspackHtmlApp(esmx));
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const rc = await esmx.render({ params: { url: req.url } });
        res.setHeader('Content-Type', 'text/html');
        res.end(rc.html);
      });
    });
    server.listen(3000);
  }
} satisfies EsmxOptions;
\`\`\`

### 2.2 \`src/create-app.ts\`
The router instance is created here. The \`apps\` property maps remote routes to their respective \`appCreator\`.

\`\`\`ts title="host-app/src/create-app.ts"
import { Router } from '@esmx/router';
import { routes } from './routes';

export async function createApp({ base, url, remoteRenderToStr }: any) {
    const router = new Router({
        root: '#root',
        base: new URL(base),
        routes,
        apps: {
            'remote-app': async (r) => {
                const m = await import('remote-app-creator');
                return m.appCreator(r, { renderToString: remoteRenderToStr });
            }
        }
    });
    await router.replace(url);
    return router;
}
\`\`\`

### 2.3 \`src/entry.server.ts\`
During SSR, the host imports the server-only \`render-to-str\` module from the remote and passes it to the router.

\`\`\`ts title="host-app/src/entry.server.ts"
import { createApp } from './create-app';

export default async function render(rc: any) {
  // Import the remote's SSR renderer
  const remoteRenderModule = await import('remote-app-render');

  const router = await createApp({
      base: 'http://localhost:3000',
      url: rc.params.url || '/',
      remoteRenderToStr: remoteRenderModule.renderToString
  });

  const html = await router.renderToString(rc);
  await rc.commit();

  rc.html = \`<!DOCTYPE html><html><head>\${rc.preload()}\${rc.css()}</head><body>\${html}\${rc.importmap()}\${rc.moduleEntry()}</body></html>\`;
}
\`\`\`

### 2.4 \`src/entry.client.ts\`
On the client, the remote renderer is not needed. The router automatically fetches and mounts the remote app's components.

\`\`\`ts title="host-app/src/entry.client.ts"
import { createApp } from './create-app';

createApp({
    base: window.location.origin,
    url: window.location.pathname
}).then(router => {
    (window as any).router = router;
});
\`\`\`

## 3. Running the Workspace
For a Micro-Frontend architecture with module links, you MUST run the build pipeline before starting the server. Running \`esmx dev\` on the Host App is not supported as it bypasses the necessary chunk bundling.

\`\`\`json title="package.json (Workspace Root)"
{
  "scripts": {
    "build": "pnpm -r run build",
    "start": "pnpm --filter host-app run start"
  }
}
\`\`\`
`;

fs.writeFileSync('llms-full.txt', content + '\n' + officialMFEGuide, 'utf-8');
console.log('Successfully updated llms-full.txt with formal documentation style.');
