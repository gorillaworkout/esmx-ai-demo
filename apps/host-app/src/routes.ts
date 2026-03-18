export const routes = [
  {
    path: '/',
    component: { template: '<h1>Micro-Frontend Host</h1><ul><li><a href="/react">React App</a></li><li><a href="/vue3">Vue 3 App</a></li><li><a href="/vue2">Vue 2 App</a></li></ul>' }
  },
  {
    path: '/react',
    app: 'react-app',
    asyncComponent: () => import('react-app-routes')
  },
  {
    path: '/vue3',
    app: 'vue3-app',
    asyncComponent: () => import('vue3-app-routes')
  },
  {
    path: '/vue2',
    app: 'vue2-app',
    asyncComponent: () => import('vue2-app-routes')
  }
];
