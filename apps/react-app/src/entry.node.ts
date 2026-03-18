import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
import http from 'http';

const require = createRequire(import.meta.url);

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m =>
      m.createRspackReactApp(esmx, {
        chain({ chain }) {
          // STANDALONE FIX: Force Rspack to resolve a single instance of React
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
          const rc = await esmx.render({
            params: { url: req.url }
          });
          res.setHeader('Content-Type', 'text/html');
          res.end(rc.html);
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end('Internal Server Error: ' + e.message);
        }
      });
    });

    const port = process.env.PORT || 3004;
    server.listen(port, () => {
      console.log(`ESMX React Demo server running at http://localhost:${port}`);
    });
  }
} satisfies EsmxOptions;
