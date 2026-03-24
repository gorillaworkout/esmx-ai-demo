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
