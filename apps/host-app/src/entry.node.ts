import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: {
      'vue3-app': '../vue3-app/dist',
      'vue2-app': '../vue2-app/dist'
    },
    imports: {
      'vue3-app-routes': 'vue3-app/src/routes',
      'vue3-app-creator': 'vue3-app/src/app-creator',
      'vue3-app-render': 'vue3-app/src/render-to-str',
      
      'vue2-app-routes': 'vue2-app/src/routes',
      'vue2-app-creator': 'vue2-app/src/app-creator',
      'vue2-app-render': 'vue2-app/src/render-to-str',
      
      'vue': 'vue3-app/vue',
      '@vue/server-renderer': 'vue3-app/@vue/server-renderer',
      '@esmx/router-vue': 'vue3-app/@esmx/router-vue'
    },
    scopes: {
      'vue2-app/': {
        'vue': 'vue2-app/vue',
        '@esmx/router-vue': 'vue2-app/@esmx/router-vue'
      }
    }
  },
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        try {
          const rc = await esmx.render({ params: { url: req.url } });
          res.setHeader('Content-Type', 'text/html');
          res.end(rc.html);
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    });
    server.listen(3004, () => console.log('HOST APP running on http://localhost:3004'));
  }
} satisfies EsmxOptions;
