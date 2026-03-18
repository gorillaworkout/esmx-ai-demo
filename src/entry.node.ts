import type { EsmxOptions } from '@esmx/core';
import http from 'http';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then(m =>
      m.createRspackHtmlApp(esmx, {
        chain({ chain }) {
          chain.module
            .rule('react')
            .test(/\.(jsx?|tsx?)$/)
            .use('swc')
            .loader('builtin:swc-loader')
            .options({
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: { react: { runtime: 'automatic' } }
              }
            });
          chain.resolve.extensions.add('.tsx').add('.jsx');
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
          res.end('Internal Server Error');
        }
      });
    });

    const port = process.env.PORT || 3004;
    server.listen(port, () => {
      console.log(`ESMX React Demo server running at http://localhost:${port}`);
    });
  }
} satisfies EsmxOptions;