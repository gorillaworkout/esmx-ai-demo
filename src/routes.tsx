import React from 'react';

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

const Home = () => (
  <Layout>
    <h1>Welcome to ESMX React</h1>
    <p>This is a microfrontend application powered by ESMX and React.</p>
  </Layout>
);

const About = () => (
  <Layout>
    <h1>About ESMX</h1>
    <p>ESMX is a high-performance microfrontend framework supporting modern web technologies.</p>
  </Layout>
);

export const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About
  }
];