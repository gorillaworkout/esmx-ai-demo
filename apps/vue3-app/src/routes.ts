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

const Vue3Page = defineComponent({
  name: 'Vue3Page',
  render() {
    return h('h1', 'Vue 3 ESMX');
  }
});

export const routes = [
  { 
    path: '/', 
    app: 'vue3-app',
    component: Home 
  },
  {
    path: '/vue3(.*)',
    app: 'vue3-app',
    component: Vue3Page
  }
];
