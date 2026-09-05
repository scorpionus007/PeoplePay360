import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './AppShell.css';

export function AppShell() {
  return (
    <div className="pp-shell">
      <Sidebar />
      <div className="pp-shell__main">
        <Topbar />
        <main className="pp-shell__content">
          <div className="pp-shell__content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
