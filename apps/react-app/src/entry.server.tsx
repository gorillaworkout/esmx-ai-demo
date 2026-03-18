import { Router, RouterMode } from '@esmx/router';
import { renderToString } from 'react-dom/server';
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
        <title>ESMX React App by AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${rc.css()}
      </head>
      <body style="margin: 0; font-family: system-ui, sans-serif;">
        <div id="app">${appHtml}</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
}
