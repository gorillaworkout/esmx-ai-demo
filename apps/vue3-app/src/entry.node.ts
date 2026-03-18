import type { EsmxOptions } from '@esmx/core';
import http from 'http';
export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then(m => m.createRspackVue3App(esmx));
  },
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const rc = await esmx.render({ params: { url: req.url } });
        res.setHeader('Content-Type', 'text/html');
        res.end(rc.html);
      });
    });
    server.listen(3005, () => console.log('Vue 3 server running on 3005'));
  }
} satisfies EsmxOptions;
