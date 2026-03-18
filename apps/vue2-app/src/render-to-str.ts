import { createRenderer } from 'vue-server-renderer';
const renderer = createRenderer();

export async function renderToString(app: any): Promise<string> {
  const html = await renderer.renderToString(app);
  return `<div id="root"><div data-server-rendered>${html}</div></div>`;
}
