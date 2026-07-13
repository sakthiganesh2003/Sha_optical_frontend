'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const SIDEBAR_W         = 260;
const SIDEBAR_W_COLLAPSED = 72;
const BREAKPOINT_LG     = 1024; // px — "desktop" threshold

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed,    setCollapsed]    = React.useState(false);
  const [mobileOpen,  setMobileOpen]   = React.useState(false);
  const [isDesktop,   setIsDesktop]    = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  /* ── Auth guard ─────────────────────────── */
  React.useEffect(() => {
    const token = localStorage.getItem('optical_shop_token');
    if (!token) {
      router.replace('/login');
    } else {
      setAuthenticated(true);
    }
  }, [router, pathname]);

  /* ── Responsive: track desktop/mobile ───── */
  React.useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINT_LG}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /* ── Close mobile drawer on route change ── */
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!authenticated) {
    return (
      <div style={{
        display: 'flex', height: '100dvh',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--accent)', borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  /* ── How much left-padding the content needs ── */
  const sidebarPx = isDesktop
    ? (collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W)
    : 0;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>
      {/* Sidebar — always rendered, visibility controlled inside */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isDesktop={isDesktop}
      />

      {/* Main content — pushed right by sidebar width on desktop */}
      <div style={{
        marginLeft: sidebarPx,
        transition: 'margin-left 0.25s cubic-bezier(.16,1,.3,1)',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Navbar
          setMobileOpen={setMobileOpen}
          mobileOpen={mobileOpen}
          isDesktop={isDesktop}
        />
        <main style={{
          flex: 1,
          padding: isDesktop ? '28px 32px' : '20px 16px',
          boxSizing: 'border-box',
          width: '100%',
          overflowX: 'hidden',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
