import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  modules: {
    links: {
      'react-app': '../react-app/dist',
      'vue3-app': '../vue3-app/dist',
      'vue2-app': '../vue2-app/dist'
    },
    imports: {
      // Connect host paths to the child apps' routers
      'react-app-routes': 'react-app/src/routes.tsx',
      'vue3-app-routes': 'vue3-app/src/routes.ts',
      'vue2-app-routes': 'vue2-app/src/routes.ts',
      // Share libraries to prevent duplicates
      'react': 'react-app/react',
      'react-dom': 'react-app/react-dom',
      'react-dom/client': 'react-app/react-dom/client',
      'react-dom/server': 'react-app/react-dom/server',
      'vue': 'vue3-app/vue',
      'vue-server-renderer': 'vue2-app/vue-server-renderer',
      '@vue/server-renderer': 'vue3-app/@vue/server-renderer',
      '@esmx/router-react': 'react-app/@esmx/router-react',
      '@esmx/router-vue': 'vue3-app/@esmx/router-vue'
    },
    scopes: {
      // Scope vue2 specifically for the vue2-app components
      'vue2-app/': {
        'vue': 'vue2-app/vue',
        '@esmx/router-vue': 'vue2-app/@esmx/router-vue'
      }
    }
  },
  async devApp(esmx) {
    return import('@esmx/rspack').then(m => m.createRspackHtmlApp(esmx));
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
    server.listen(3000, () => console.log('HOST APP running on http://localhost:3000'));
  }
} satisfies EsmxOptions;
