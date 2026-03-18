import type { RouteConfig } from '@esmx/router';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <nav style={{ padding: '1rem', background: '#282c34', color: 'white', display: 'flex', gap: '1rem' }}>
        <a href="/" style={{ color: '#61dafb' }}>Home</a>
        <a href="/about" style={{ color: '#61dafb' }}>About</a>
      </nav>
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

const Home = () => <h1>Welcome to Esmx React Micro-App!</h1>;
const About = () => <h1>About Page: Built by AI using the Docs</h1>;

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'about', component: About }
    ]
  }
];
