import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/**
 * Bumping `reloadKey` after a demo scenario change remounts the page
 * so the next request uses the new mock header without a full refresh.
 */
export function AppShell() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="app-shell">
      <Header onScenarioChange={() => setReloadKey((value) => value + 1)} />
      <main className="main">
        <Outlet key={reloadKey} />
      </main>
    </div>
  );
}
