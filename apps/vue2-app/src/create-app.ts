import Vue from 'vue';
import { RouterPlugin } from '@esmx/router-vue';

Vue.use(RouterPlugin);

export function createVueApp(router) {
  // ESMX standard for Vue 2: Use new Vue({ router })
  const app = new Vue({
    template: '<router-view></router-view>',
    router
  });
  return { app };
}
