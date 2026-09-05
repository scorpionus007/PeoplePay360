import { useState, useRef, useEffect } from 'react';
import { LogOut, Search, ChevronDown, Bell, HelpCircle, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import './Topbar.css';

export function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="pp-topbar">
      <div className="pp-topbar__search">
        <Search size={16} />
        <input placeholder="Search employees, requisitions, payslips" />
        <kbd>/</kbd>
      </div>
      <div className="pp-topbar__actions">
        <button className="pp-topbar__icon-btn" aria-label="Help">
          <HelpCircle size={18} />
        </button>
        <button className="pp-topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="pp-topbar__dot" />
        </button>
        <div className="pp-topbar__divider" />
        <div className="pp-topbar__menu" ref={ref}>
          <button className="pp-topbar__profile" onClick={() => setOpen((v) => !v)}>
            <Avatar name={user?.full_name || 'User'} size={30} />
            <div className="pp-topbar__profile-text">
              <div className="pp-topbar__profile-name">{user?.full_name}</div>
              <div className="pp-topbar__profile-role">
                {(user?.roles || []).slice(0, 2).map((r) => r.replace(/_/g, ' ')).join(', ') || 'Member'}
              </div>
            </div>
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="pp-topbar__dropdown">
              <button
                className="pp-topbar__dropdown-item"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings');
                }}
              >
                <UserIcon size={14} /> Profile and settings
              </button>
              <button
                className="pp-topbar__dropdown-item pp-topbar__dropdown-item--danger"
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
