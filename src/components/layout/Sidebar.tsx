'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserPlus,
  Settings as SettingsIcon, LogOut, Glasses,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { authService } from '@/lib/api';

const SIDEBAR_W           = 260;
const SIDEBAR_W_COLLAPSED = 72;

const nav = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Customers',    href: '/customers',    icon: Users },
  { label: 'Add Customer', href: '/customers/add', icon: UserPlus },
  { label: 'Master Data',  href: '/settings',     icon: SettingsIcon },
];

interface SidebarProps {
  collapsed:      boolean;
  setCollapsed:   (c: boolean) => void;
  mobileOpen:     boolean;
  setMobileOpen:  (o: boolean) => void;
  isDesktop:      boolean;
}

function NavItem({
  item, collapsed, active, onClick,
}: {
  item: typeof nav[0]; collapsed: boolean; active: boolean; onClick?: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '11px 0' : '11px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active
          ? 'var(--accent-soft)'
          : hovered
          ? 'var(--bg-muted)'
          : 'transparent',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active indicator bar */}
      {active && (
        <span style={{
          position: 'absolute', left: 0,
          top: '50%', transform: 'translateY(-50%)',
          width: 3, height: '60%',
          background: 'var(--accent)',
          borderRadius: '0 3px 3px 0',
        }} />
      )}
      <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 0.2s',
        }}>
          {item.label}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({
  collapsed, setCollapsed, mobileOpen, setMobileOpen, isDesktop,
}: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) authService.logout();
  };

  const sidebarWidth = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  /* On desktop: always visible, translates in/out via width change
     On mobile:  hidden off-screen, slides in when mobileOpen = true */
  const translateX = isDesktop
    ? 0
    : mobileOpen
    ? 0
    : -SIDEBAR_W;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {!isDesktop && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        width: isDesktop ? sidebarWidth : SIDEBAR_W,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: `translateX(${translateX}px)`,
        transition: isDesktop
          ? 'width 0.25s cubic-bezier(.16,1,.3,1)'
          : 'transform 0.28s cubic-bezier(.16,1,.3,1)',
      }}>

        {/* ── Logo area ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed && isDesktop ? 'center' : 'space-between',
          padding: collapsed && isDesktop ? '20px 0' : '20px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <Link
            href="/dashboard"
            onClick={() => !isDesktop && setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <Glasses size={20} color="white" />
            </div>
            {!(collapsed && isDesktop) && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  Sha optical
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  ADMIN PANEL
                </div>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          {isDesktop && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                flexShrink: 0,
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                borderRadius: 8, cursor: 'pointer',
                color: 'var(--text-muted)', padding: '5px 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                marginLeft: collapsed ? 'auto' : 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          )}

          {/* Mobile close button */}
          {!isDesktop && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Nav items ── */}
        <nav style={{
          flex: 1, padding: '12px 10px',
          display: 'flex', flexDirection: 'column', gap: 2,
          overflowY: 'auto', overflowX: 'hidden',
        }}>
          {nav.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              collapsed={collapsed && isDesktop}
              active={isActive(item.href)}
              onClick={() => !isDesktop && setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* ── Logout ── */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            title={collapsed && isDesktop ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 12, width: '100%',
              padding: collapsed && isDesktop ? '11px 0' : '11px 14px',
              justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
              borderRadius: 10, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--danger)', fontSize: 14, fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {!(collapsed && isDesktop) && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
