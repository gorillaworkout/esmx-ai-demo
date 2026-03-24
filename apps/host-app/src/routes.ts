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
