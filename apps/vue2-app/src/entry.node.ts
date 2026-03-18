import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.ts',
      'root:src/app-creator.ts',
      {
        'src/render-to-str': {
          client: false,
          server: './src/render-to-str.ts'
        }
      },
      'pkg:vue',
      'pkg:vue-server-renderer',
      'pkg:@esmx/router-vue'
    ]
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue2App(esmx, {
      chain({ chain }) {
        chain.resolve.alias.set('vue$', require.resolve('vue/dist/vue.runtime.esm.js'));
      }
    }));
  }
} satisfies EsmxOptions;
