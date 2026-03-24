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

fixFile(
  'apps/vue2-app/src/entry.server.ts',
  `import { createRenderer } from 'vue-server-renderer';\nconst renderer = createRenderer();`,
  `import _vueServerRenderer from 'vue-server-renderer';\nconst createRenderer = _vueServerRenderer.createRenderer || _vueServerRenderer.default?.createRenderer || _vueServerRenderer;\nconst renderer = createRenderer();`
);

fixFile(
  'apps/vue2-app/src/render-to-str.ts',
  `import { createRenderer } from 'vue-server-renderer';\nconst renderer = createRenderer();`,
  `import _vueServerRenderer from 'vue-server-renderer';\nconst createRenderer = _vueServerRenderer.createRenderer || _vueServerRenderer.default?.createRenderer || _vueServerRenderer;\nconst renderer = createRenderer();`
);

