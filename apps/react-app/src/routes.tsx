import type { RouteConfig } from '@esmx/router';
import { RouterView } from '@esmx/router-react';

const Layout = ({ children }: any) => {
  return (
    <div>
      <div style={{ padding: '2rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', marginBottom: '1rem' }}>
        <h2>⚛️ Hello from React Standalone!</h2>
        <p>This is rendered entirely independently to bypass Node.js CJS/ESM interop limits.</p>
      </div>
      <main>
        {children}
      </main>
    </div>
  );
};

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
