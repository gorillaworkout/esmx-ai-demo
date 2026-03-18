import fs from 'fs';

let content = fs.readFileSync('llms-full.txt', 'utf-8');

const warningSection = `### 🚨 CRITICAL ARCHITECTURE WARNING: React in Micro-Frontends (SSR)

ESMX's Module Linking is designed for **same-ecosystem sharing** (e.g., Vue 3 Host orchestrating Vue 2 and Vue 3 remotes). 

**DO NOT ATTEMPT TO MIX REACT AND VUE IN A SINGLE HOST APP WITH SSR.**
If you attempt to import a bundled React remote into a Host App on the server (Node.js), you will encounter the following fatal error:
\`SyntaxError: The requested module 'react' does not provide an export named 'useSyncExternalStore'\`

**Why?**
Node.js native ESM loader cannot destructure named exports from CJS modules (like React 19) when they are imported via bare specifiers inside pre-bundled remote chunks.

**The Solution:**
1. Keep the Host App restricted to Vue 2 and Vue 3 (matching the official ESMX \`ssr-hub\` example).
2. If you need a React application, build and run it as a **100% standalone application** on a separate port (e.g., 3007), and link to it via standard HTML \`<a>\` tags or Nginx reverse proxy.
`;

// Insert the warning right before the Host App setup section
content = content.replace('## Micro-Frontend Host Setup', warningSection + '\n\n## Micro-Frontend Host Setup');

fs.writeFileSync('llms-full.txt', content, 'utf-8');
console.log('Docs updated with critical warning!');
