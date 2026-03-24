import fs from 'fs';
const path = 'apps/vue3-app/src/render-to-str.ts';
let content = fs.readFileSync(path, 'utf-8');

const targetStr = `import { renderToString as renderer } from '@vue/server-renderer';`;
const replaceStr = `import _vueServerRenderer from '@vue/server-renderer';
const renderer = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Fixed vue3-app render-to-str.ts');
}

