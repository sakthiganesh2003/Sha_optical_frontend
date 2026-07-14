'use client';

import * as React from 'react';
import { Menu, Sun, Moon, User, Glasses } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/customers':    'Customers',
  '/customers/add':'Add Customer',
  '/settings':     'Master Data',
};

interface NavbarProps {
  setMobileOpen: (o: boolean) => void;
  mobileOpen:    boolean;
  isDesktop:     boolean;
}

export default function Navbar({ setMobileOpen, isDesktop }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [adminName, setAdminName] = React.useState('Admin');

  React.useEffect(() => {
    try {
      const s = localStorage.getItem('optical_shop_admin');
      if (s) setAdminName(JSON.parse(s)?.name || 'Admin');
    } catch (_) {}
  }, []);

  const getTitle = () => {
    for (const [key, val] of Object.entries(pageTitles)) {
      if (pathname === key || pathname.startsWith(key + '/')) return val;
    }
    return 'Sha optical';
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {/* Hamburger — only on mobile */}
        {!isDesktop && (
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'var(--bg-muted)', border: '1px solid var(--border)',
              borderRadius: 9, cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '7px 8px',
              display: 'flex', alignItems: 'center', flexShrink: 0,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <Menu size={18} />
          </button>
        )}

        {/* Mobile logo */}
        {!isDesktop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Glasses size={14} color="white" style={{ display: 'block' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Sha optical</span>
          </div>
        )}

        {/* Page title — desktop only */}
        {isDesktop && (
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>
            {getTitle()}
          </h1>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            borderRadius: 9, cursor: 'pointer', color: 'var(--text-secondary)',
            padding: '7px 8px', display: 'flex', alignItems: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Admin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isDesktop && (
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{adminName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Store Manager</div>
            </div>
          )}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent-soft)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', flexShrink: 0,
          }}>
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
