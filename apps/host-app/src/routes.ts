export const routes = [
  {
    path: '/',
    app: 'vanilla',
    component: { template: '<div style="padding: 2rem; font-family: sans-serif;"><h1>🚀 ESMX Micro-Frontend Host</h1><p>Choose a framework:</p><ul><li><a href="/vue3">Vue 3 App</a></li><li><a href="/vue2">Vue 2 App</a></li><li><a href="http://localhost:3007">React App (standalone)</a></li></ul></div>' }
  },
  {
    path: '/vue3(.*)',
    app: 'vue3-app',
    asyncComponent: () => import('vue3-app-routes').then(m => m.routes[0].component)
  },
  {
    path: '/vue2(.*)',
    app: 'vue2-app',
    asyncComponent: () => import('vue2-app-routes').then(m => m.routes[0].component)
  }
];
