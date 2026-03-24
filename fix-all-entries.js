import fs from 'fs';

function fixFile(path, oldStr, newStr) {
  if (fs.existsSync(path)) {
    let text = fs.readFileSync(path, 'utf8');
    if (text.includes(oldStr)) {
      text = text.replace(oldStr, newStr);
      fs.writeFileSync(path, text, 'utf8');
      console.log('Fixed', path);
    }
  }
}

// Fix Vue 3 standalone server
fixFile(
  'apps/vue3-app/src/entry.server.ts',
  `import { renderToString } from '@vue/server-renderer';`,
  `import _vueServerRenderer from '@vue/server-renderer';\nconst renderToString = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;`
);

// Fix React standalone server
fixFile(
  'apps/react-app/src/entry.server.tsx',
  `import { renderToString } from 'react-dom/server';`,
  `import _reactDomServer from 'react-dom/server';\nconst renderToString = _reactDomServer.renderToString || _reactDomServer.default?.renderToString || _reactDomServer;`
);

// Fix Vue 3 render-to-str
fixFile(
  'apps/vue3-app/src/render-to-str.ts',
  `import { renderToString as renderer } from '@vue/server-renderer';`,
  `import _vueServerRenderer from '@vue/server-renderer';\nconst renderer = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;`
);

// Fix React render-to-str
fixFile(
  'apps/react-app/src/render-to-str.tsx',
  `import { renderToString as renderer } from 'react-dom/server';`,
  `import _reactDomServer from 'react-dom/server';\nconst renderer = _reactDomServer.renderToString || _reactDomServer.default?.renderToString || _reactDomServer;`
);

