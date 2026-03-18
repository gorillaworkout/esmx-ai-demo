import { defineComponent, h } from 'vue';

const Home = defineComponent({
  name: 'Home',
  render() {
    return h('div', { style: 'padding: 2rem; font-family: sans-serif;' }, [
      h('h1', '🚀 ESMX Vue Micro-Frontend Host'),
      h('p', 'This host orchestrates Vue 3 and Vue 2 apps seamlessly:'),
      h('ul', [
        h('li', [h('a', { href: '/vue3' }, 'Vue 3 App (Integrated)')]),
        h('li', [h('a', { href: '/vue2' }, 'Vue 2 App (Integrated)')]),
        h('li', [h('a', { href: 'http://localhost:3007' }, 'React App (Standalone)')])
      ])
    ]);
  }
});

export const routes = [
  { path: '/', component: Home },
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
