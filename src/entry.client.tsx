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
