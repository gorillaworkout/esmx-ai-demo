import fs from 'fs';

let content = fs.readFileSync('apps/host-app/src/entry.server.ts', 'utf-8');

const targetStr = `import { renderToString } from '@vue/server-renderer';`;
const replaceStr = `import _vueServerRenderer from '@vue/server-renderer';
const renderToString = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('apps/host-app/src/entry.server.ts', content, 'utf-8');
  console.log('Fixed entry.server.ts');
}

// Update the documentation as well!
let docs = fs.readFileSync('llms-full.txt', 'utf-8');

const devWarning = `
### 🚨 CRITICAL ESM/CJS INTEROP IN NODE.JS DEV MODE

When running \`esmx dev\`, Node.js uses its native ESM loader which throws \`SyntaxError: The requested module ... does not provide an export named ...\` when you try to named-import from CJS modules (like \`@vue/server-renderer\` or \`react-dom/server\`).

**Rule for all \`entry.server.ts\` files:**
Never use named imports from CJS modules directly. Use default imports and unwrap them to prevent the dev server from crashing.

❌ **BAD:**
\`\`\`ts
import { renderToString } from '@vue/server-renderer'; // CRASHES esmx dev
\`\`\`

✅ **GOOD:**
\`\`\`ts
import _vueServerRenderer from '@vue/server-renderer';
const renderToString = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;
\`\`\`
`;

if (!docs.includes('CRITICAL ESM/CJS INTEROP IN NODE.JS DEV MODE')) {
  docs = docs.replace('## Micro-Frontend Host Setup', devWarning + '\n\n## Micro-Frontend Host Setup');
  fs.writeFileSync('llms-full.txt', docs, 'utf-8');
  console.log('Docs updated with dev interop fix');
}

