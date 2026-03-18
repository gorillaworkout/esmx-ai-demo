import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  modules: {
    lib: true,
    exports: [
      'root:src/routes.tsx',
      'pkg:react',
      'pkg:react-dom',
      'pkg:react-dom/client',
      { 'react-dom/server': { client: false, server: 'pkg:react-dom/server' } },
      'pkg:@esmx/router-react'
    ]
  },
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
  }
} satisfies EsmxOptions;
