'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, Clock, CheckCircle, Truck, Eye, ArrowRight, TrendingUp, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { dashboardService } from '@/lib/api';
import { Order } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  New: 'badge-new',
  Processing: 'badge-processing',
  Ready: 'badge-ready',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

function StatCard({ title, value, prefix = '', desc, icon: Icon, accent }: {
  title: string; value: string | number; prefix?: string; desc: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="animate-fade-up" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--shadow-md)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--shadow-sm)';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{title}</span>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {prefix}{value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{desc}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', height: 120 }}>
      <div className="skeleton" style={{ height: '100%' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = React.useState('all');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboardStats', range],
    queryFn: () => dashboardService.getStats(range),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ height: 36, width: 240 }}><div className="skeleton" style={{ height: '100%' }} /></div>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ height: 360 }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
            <div style={{ height: 360 }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 10 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--danger)' }}>Failed to load dashboard.</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Make sure the backend server is running on port 5000.</p>
        </div>
      </Layout>
    );
  }

  const { stats, recentCustomers, recentOrders } = data!;

  const cards = [
    { title: 'Total Revenue', value: stats.totalRevenue.toLocaleString('en-IN'), prefix: '₹', desc: 'Excluding Cancelled', icon: TrendingUp, accent: '#10b981' },
    { title: 'Total Customers', value: stats.totalCustomers, desc: 'Lifetime registered', icon: Users, accent: '#6366f1' },
    { title: 'New This Month', value: stats.newCustomers, desc: 'Last 30 days', icon: UserPlus, accent: '#06b6d4' },
    { title: 'Pending Orders', value: stats.pendingOrders, desc: 'New & Processing', icon: Clock, accent: '#f59e0b' },
    { title: 'Ready for Pickup', value: stats.readyOrders, desc: 'Awaiting collection', icon: CheckCircle, accent: '#8b5cf6' },
    { title: 'Delivered', value: stats.deliveredOrders, desc: 'Successfully closed', icon: Truck, accent: '#a855f7' },
  ];

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Here is what is happening in your optical shop today.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-secondary)'; }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: isFetching ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>

            {/* Range filter select */}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{
                height: 36, padding: '0 12px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent)',
              borderRadius: 99, padding: '6px 14px',
              fontSize: 12, fontWeight: 500, color: 'var(--accent)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-soft 2s infinite' }} />
              Live
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stagger" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))' }}>
          {cards.map((c) => <StatCard key={c.title} {...c} />)}
        </div>

        {/* Tables */}
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {/* Recent Customers */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>Recent Customers</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Latest registered profiles</p>
              </div>
              <Link href="/customers" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
              {recentCustomers.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No customers yet
                </div>
              ) : recentCustomers.map((c) => (
                <Link key={c._id} href={`/customers/${c._id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {c.photo ? (
                      <img src={c.photo} alt={c.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                      }}>
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{c.mobile}</p>
                    </div>
                  </div>
                  <Eye size={15} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>Recent Orders</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Latest prescription transactions</p>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
              {recentOrders.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No orders yet
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-muted)', position: 'sticky', top: 0, zIndex: 1 }}>
                      {['Customer', 'Frame', 'Amount', 'Status', ''].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: 'var(--bg-surface)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const cust = order.customerId as any;
                      return (
                        <tr key={order._id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--text-primary)' }}>{cust?.name || '—'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{cust?.mobile || ''}</p>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {order.frame?.brand || '—'}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                            ₹{order.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={STATUS_BADGE[order.status]} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <Link href={`/customers/${cust?._id || ''}`} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                              textDecoration: 'none',
                            }}>
                              <Eye size={13} /> View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
