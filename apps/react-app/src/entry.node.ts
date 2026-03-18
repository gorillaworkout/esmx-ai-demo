import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
import http from 'http';
const require = createRequire(import.meta.url);

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m =>
      m.createRspackReactApp(esmx, {
        chain({ chain }) {
          chain.resolve.alias
            .set('react', require.resolve('react'))
            .set('react-dom/server', require.resolve('react-dom/server'))
            .set('react-dom/client', require.resolve('react-dom/client'))
            .set('react-dom', require.resolve('react-dom'));
        }
      })
    );
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
    server.listen(3007, () => console.log('React App running on http://localhost:3007'));
  }
} satisfies EsmxOptions;
