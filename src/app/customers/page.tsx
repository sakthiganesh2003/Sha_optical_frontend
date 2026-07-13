'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Eye, Trash2, Phone, Users, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { customerService } from '@/lib/api';
import { Customer } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  New: 'badge-new', Processing: 'badge-processing',
  Ready: 'badge-ready', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<Customer | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: customers = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['customers', debounced],
    queryFn: () => customerService.search(debounced),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Customer deleted');
      setDeleteOpen(false);
      setToDelete(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  /* ── Table skeleton rows ── */
  const SkeletonRow = () => (
    <tr style={{ borderTop: '1px solid var(--border)' }}>
      {[44, 120, 100, 80, 70, 80].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w, borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Customers
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {isLoading ? 'Loading…' : `${customers.length} customer${customers.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Refresh button */}
            <button
              onClick={() => {
                refetch();
                toast.success('Customer list refreshed');
              }}
              disabled={isFetching}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-secondary)'; }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isFetching ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>
            {/* Export data button */}
            <button
              onClick={() => {
                if (customers.length === 0) {
                  toast.error('No customer data to export');
                  return;
                }
                const csvHeader = 'ID,Name,Mobile,JoinedDate,OrdersCount\n';
                const csvRows = customers.map((c) => {
                  const id = c._id.toUpperCase();
                  const name = `"${c.name.replace(/"/g, '""')}"`;
                  const mobile = c.mobile;
                  const joined = new Date(c.createdAt).toLocaleDateString('en-GB');
                  const count = c.orderCount ?? 0;
                  return `${id},${name},${mobile},${joined},${count}`;
                }).join('\n');
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `sha_optical_customers_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Customer CSV exported successfully');
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-secondary)'; }}
            >
              <Download size={15} /> Export CSV
            </button>
            <Link href="/customers/add" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'var(--accent)', color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              transition: 'opacity 0.18s, transform 0.18s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = '0.88'; el.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }}
            >
              <UserPlus size={15} /> Add Customer
            </Link>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              height: 40, paddingLeft: 38, paddingRight: 14,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              transition: 'border-color 0.18s',
            }}
            onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* ── Table card ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              {/* Head */}
              <thead>
                <tr style={{ background: 'var(--bg-muted)' }}>
                  {['', 'Customer', 'Mobile', 'Joined', 'Orders', 'Actions'].map((h, i) => (
                    <th key={h + i} style={{
                      padding: i === 0 ? '11px 8px 11px 20px' : '11px 16px',
                      textAlign: 'left', fontSize: 11, fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.05em',
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '60px 20px', gap: 14,
                      }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: 'var(--bg-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Users size={22} color="var(--text-muted)" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px' }}>
                            {search ? `No results for "${search}"` : 'No customers yet'}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
                            {search ? 'Try a different name or mobile.' : 'Add your first customer to get started.'}
                          </p>
                          {!search && (
                            <Link href="/customers/add" style={{
                              padding: '8px 18px', borderRadius: 9,
                              background: 'var(--accent)', color: '#fff',
                              fontSize: 12, fontWeight: 600, textDecoration: 'none',
                            }}>
                              Add Customer
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust, idx) => (
                    <CustomerRow
                      key={cust._id}
                      cust={cust}
                      idx={idx}
                      onDelete={() => { setToDelete(cust); setDeleteOpen(true); }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!isLoading && customers.length > 0 && (
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{customers.length}</strong> customer{customers.length !== 1 ? 's' : ''}
              </span>
              <Link href="/customers/add" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <UserPlus size={13} /> Add new
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>{toDelete?.name}</strong> and all their orders and prescriptions. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: 20 }}>
            <button onClick={() => setDeleteOpen(false)} style={{
              padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)',
              background: 'var(--bg-muted)', color: 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              onClick={() => toDelete && deleteMutation.mutate(toDelete._id)}
              disabled={deleteMutation.isPending}
              style={{
                padding: '9px 18px', borderRadius: 9, border: 'none',
                background: 'var(--danger)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                opacity: deleteMutation.isPending ? 0.7 : 1,
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete Customer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

/* ── Individual table row ─────────────────────────────── */
function CustomerRow({
  cust, idx, onDelete,
}: { cust: Customer; idx: number; onDelete: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  const initials = cust.name.substring(0, 2).toUpperCase();

  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
  const avatarColor = colors[idx % colors.length];

  return (
    <tr
      style={{
        borderTop: '1px solid var(--border)',
        background: hovered ? 'var(--bg-muted)' : 'transparent',
        transition: 'background 0.14s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <td style={{ padding: '12px 8px 12px 20px', width: 44 }}>
        {cust.photo ? (
          <img
            src={cust.photo} alt={cust.name}
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', display: 'block' }}
          />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: avatarColor + '22', color: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
      </td>

      {/* Name */}
      <td style={{ padding: '12px 16px' }}>
        <p style={{ margin: '0 0 2px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, whiteSpace: 'nowrap' }}>
          {cust.name}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          ID: {cust._id.slice(-6).toUpperCase()}
        </p>
      </td>

      {/* Mobile */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Phone size={12} color="var(--accent)" />
          {cust.mobile}
        </div>
      </td>

      {/* Joined */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {new Date(cust.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </td>

      {/* Orders badge */}
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 24, padding: '2px 8px',
          background: 'var(--accent-soft)', color: 'var(--accent)',
          borderRadius: 99, fontSize: 12, fontWeight: 700,
        }}>
          {cust.orderCount ?? 0}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link
            href={`/customers/${cust._id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.14s', whiteSpace: 'nowrap', border: '1px solid transparent',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent)'; el.style.color = '#fff'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent-soft)'; el.style.color = 'var(--accent)'; }}
          >
            <Eye size={13} /> View
          </Link>
          <button
            onClick={onDelete}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', transition: 'all 0.14s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(239,68,68,0.1)'; el.style.color = 'var(--danger)'; el.style.borderColor = 'var(--danger)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--text-muted)'; el.style.borderColor = 'var(--border)'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}
