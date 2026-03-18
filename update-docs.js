import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

// 1. Remove the old, misleading "Setup with React" section (and everything after it, since we'll append the new master guide)
const misleadingReactSectionIndex = content.indexOf('## Setup with React');
if (misleadingReactSectionIndex !== -1) {
    // Just to be safe, we'll cut out the old Setup with React section entirely.
    // We'll replace it with our perfected guide.
    const endOfSection = content.indexOf('##', misleadingReactSectionIndex + 5);
    if (endOfSection !== -1) {
        content = content.substring(0, misleadingReactSectionIndex) + content.substring(endOfSection);
    } else {
        content = content.substring(0, misleadingReactSectionIndex);
    }
}

// Also remove any of my previous additions at the bottom to avoid duplication
const myPreviousAddition = content.indexOf('## NPM Dependencies & Scripts');
if (myPreviousAddition !== -1) {
    content = content.substring(0, myPreviousAddition);
}
const myPreviousAddition2 = content.indexOf('## React SSR Setup');
if (myPreviousAddition2 !== -1) {
    content = content.substring(0, myPreviousAddition2);
}


// Append the ultimate, perfected AI guide
const perfectGuide = `
## Setup with React (Modern @esmx/router-react)

> **CRITICAL UPDATE FOR AI DEVELOPERS**: Older documentation may claim React requires manual micro-app registration. This is **FALSE**. Esmx provides native, first-class React support via \`@esmx/router-react\` and \`@esmx/rspack-react\`. Follow the strict standalone guide below.

To build a standalone Esmx application using React SSR, you must properly configure your dependencies, Rspack alias (to prevent duplicate React hooks), and the router contexts.

### 1. NPM Dependencies & Scripts
You must install the framework from the public npm registry and use the \`esmx\` binary natively. Do not use local links or \`node cli/index.mjs\`.

\`\`\`json title="package.json"
{
  "scripts": {
    "dev": "esmx dev",
    "build": "esmx build",
    "start": "esmx start"
  },
  "dependencies": {
    "@esmx/core": "^3.0.0-rc.112",
    "@esmx/router": "^3.0.0-rc.112",
    "@esmx/router-react": "^3.0.0-rc.112",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@esmx/rspack": "^3.0.0-rc.112",
    "@esmx/rspack-react": "^3.0.0-rc.112"
  }
}
\`\`\`

### 2. Rspack Alias Configuration (Fixing Invalid Hook Calls)
When bundling a standalone React SSR app, package managers can resolve multiple instances of React between the workspace and \`@esmx/*\` internals, causing a 500 error ("Invalid hook call"). You MUST force Rspack to resolve a single instance of React:

\`\`\`ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then(m =>
      m.createRspackReactApp(esmx, {
        chain({ chain }) {
          // CRITICAL FOR STANDALONE SSR: Force single React instance
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
\`\`\`

### 3. Defining Routes (Always Include Catch-All)
You must include a \`(.*)\` catch-all route to prevent the router from throwing "No active route found" errors when the browser requests unknown paths like \`/favicon.ico\` during SSR.

\`\`\`tsx title="src/routes.tsx"
import type { RouteConfig } from '@esmx/router';

const Layout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Home = () => <h1>Welcome to ESMX React</h1>;
const NotFound = () => <h1>404 - Page Not Found</h1>;

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: '(.*)', component: NotFound }
    ]
  }
];
\`\`\`

### 4. Client Entry
Use \`<RouterProvider>\` and \`<RouterView>\` to hydrate the application on the client.

\`\`\`tsx title="src/entry.client.tsx"
import { createRoot } from 'react-dom/client';
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { routes } from './routes';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes
});

router.push(window.location.pathname).then(() => {
  const root = createRoot(document.getElementById('app')!);
  root.render(
    <RouterProvider router={router}>
      <RouterView />
    </RouterProvider>
  );
});
\`\`\`

### 5. Server Entry (SSR)
Render the React component tree to string and inject it into the \`RenderContext\`. Ensure you await \`rc.commit()\` before constructing the final HTML shell.

\`\`\`tsx title="src/entry.server.tsx"
import { renderToString } from 'react-dom/server';
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import type { RenderContext } from '@esmx/core';
import { routes } from './routes';

export default async function render(rc: RenderContext) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url || '/', 'http://localhost'),
    routes
  });

  await router.push(rc.params.url || '/');

  const appHtml = renderToString(
    <RouterProvider router={router}>
      <RouterView />
    </RouterProvider>
  );

  await rc.commit();
  
  rc.html = \`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>ESMX React SSR App</title>
        \${rc.preload()}
        \${rc.css()}
      </head>
      <body>
        <div id="app">\${appHtml}</div>
        \${rc.importmap()}
        \${rc.moduleEntry()}
        \${rc.modulePreload()}
      </body>
    </html>
  \`;
}
\`\`\`
`;

fs.writeFileSync('llms-full.txt', content + perfectGuide, 'utf-8');
console.log('Successfully updated llms-full.txt with perfect AI instructions.');
