import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function renderToString(app: any, context: any = {}): Promise<string> {
  // Use require() to completely bypass Rspack's ESM import rewriting
  // This forces Node to load the CJS module at runtime
  const _vueServerRenderer = require('@vue/server-renderer');
  const renderer = _vueServerRenderer.renderToString || _vueServerRenderer.default?.renderToString || _vueServerRenderer;
  
  const html = await renderer(app, context);
  return `<div id="root"><div data-server-rendered>${html}</div></div>`;
}
