import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function renderToString(app: any): Promise<string> {
  const _vueServerRenderer = require('vue-server-renderer');
  const createRenderer = _vueServerRenderer.createRenderer || _vueServerRenderer.default?.createRenderer || _vueServerRenderer;
  const renderer = createRenderer();
  const html = await renderer.renderToString(app);
  return `<div id="root"><div data-server-rendered>${html}</div></div>`;
}
