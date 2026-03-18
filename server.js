import { Esmx } from '@esmx/core';
import http from 'http';

const esmx = new Esmx();

async function start() {
  await esmx.init();

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

start();
