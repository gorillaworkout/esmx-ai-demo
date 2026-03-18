import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.ts',
      'pkg:vue',
      'pkg:@vue/server-renderer',
      'pkg:@esmx/router-vue'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
  }
} satisfies EsmxOptions;
