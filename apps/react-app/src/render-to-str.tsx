import _reactDomServer from 'react-dom/server';
const renderer = _reactDomServer.renderToString || _reactDomServer.default?.renderToString || _reactDomServer;
import { RouterProvider, RouterView } from '@esmx/router-react';

export async function renderToString(router: any): Promise<string> {
  const html = renderer(
    <RouterProvider router={router}>
      <RouterView />
    </RouterProvider>
  );
  return `<div id="root"><div data-server-rendered>${html}</div></div>`;
}
