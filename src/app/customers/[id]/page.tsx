'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Calendar, Smartphone, Eye, Plus, Edit, Trash2,
  Download, Info, Clock, Package,
} from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { customerService, orderService, masterDataService } from '@/lib/api';
import { Order } from '@/lib/types';

/* ── Status badge class map ────────────────────── */
const STATUS_BADGE: Record<string, string> = {
  New: 'badge-new', Processing: 'badge-processing',
  Ready: 'badge-ready', Delivered: 'badge-delivered', Cancelled: 'badge-cancelled',
};

/* ── EyePower display cell ─────────────────────── */
function EyeCell({ label, eye }: { label: string; eye: { sph?: string; cyl?: string; axis?: string } }) {
  return (
    <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', margin: '0 0 12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: 4 }}>
        {(['sph', 'cyl', 'axis'] as const).map((k) => (
          <div key={k}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{eye[k] || '--'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Styled form input ─────────────────────────── */
function FInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      width: '100%', boxSizing: 'border-box', height: 38,
      padding: '0 10px', background: 'var(--bg-surface)',
      border: '1px solid var(--border)', borderRadius: 8,
      color: 'var(--text-primary)', fontSize: 13, outline: 'none',
    }}
      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
    />
  );
}

function FSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{
      width: '100%', height: 38, padding: '0 10px',
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer',
    }}
      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {children}
    </select>
  );
}

function FLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 5 }}>{children}</label>;
}

/* ── Main Page ─────────────────────────────────── */
export default function CustomerProfilePage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [newOrderOpen,  setNewOrderOpen]  = React.useState(false);
  const [deleteOrderOpen, setDeleteOrderOpen] = React.useState(false);
  const [orderToDeleteId, setOrderToDeleteId] = React.useState<string | null>(null);

  // New order form state
  const [amount,    setAmount]    = React.useState('');
  const [lensType,  setLensType]  = React.useState('None');
  const [status,    setStatus]    = React.useState<'New'|'Processing'|'Ready'|'Delivered'|'Cancelled'>('New');
  const [notes,     setNotes]     = React.useState('');
  const [brand,     setBrand]     = React.useState('None');
  const [model,     setModel]     = React.useState('None');
  const [color,     setColor]     = React.useState('None');
  const [rightSph,  setRightSph]  = React.useState('');
  const [rightCyl,  setRightCyl]  = React.useState('');
  const [rightAxis, setRightAxis] = React.useState('');
  const [leftSph,   setLeftSph]   = React.useState('');
  const [leftCyl,   setLeftCyl]   = React.useState('');
  const [leftAxis,  setLeftAxis]  = React.useState('');
  const [prescFile, setPrescFile] = React.useState<File | null>(null);
  const [invFile,   setInvFile]   = React.useState<File | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customerDetails', id],
    queryFn: () => customerService.getDetails(id),
  });

  const { data: masterData } = useQuery({ queryKey: ['masterData'], queryFn: masterDataService.getAll });

  React.useEffect(() => {
    if (data?.orders?.length) {
      const latest = data.orders[0];
      setRightSph(latest.eyePower.right.sph || '');
      setRightCyl(latest.eyePower.right.cyl || '');
      setRightAxis(latest.eyePower.right.axis || '');
      setLeftSph(latest.eyePower.left.sph || '');
      setLeftCyl(latest.eyePower.left.cyl || '');
      setLeftAxis(latest.eyePower.left.axis || '');
    }
  }, [data]);

  const createOrderMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Order created!');
      setNewOrderOpen(false);
      setAmount(''); setNotes(''); setPrescFile(null); setInvFile(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating order'),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Order deleted');
      setDeleteOrderOpen(false);
      setOrderToDeleteId(null);
      if (selectedOrder) setSelectedOrder(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error deleting order'),
  });

  const brands = masterData?.brands?.map((d: any) => d.value) ?? ['Ray-Ban','Titan Eye+','Fastrack','Vogue','Oakley','Police'];
  const models = masterData?.models?.map((d: any) => d.value) ?? ['Full Rim','Half Rim','Rimless','Round','Square','Aviator'];
  const colors = masterData?.colors?.map((d: any) => d.value) ?? ['Black','Brown','Blue','Grey','Gold','Silver','Transparent'];
  const lenses = masterData?.lenses?.map((d: any) => d.value) ?? ['Single Vision','Progressive','Bifocal','Blue Cut','Anti Glare'];

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {[220, 240, 380].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 16 }}><div className="skeleton" style={{ height: '100%' }} /></div>
          ))}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--danger)' }}>Failed to load customer profile.</p>
          <Link href="/customers" style={{ padding: '9px 20px', borderRadius: 9, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            Back to Customers
          </Link>
        </div>
      </Layout>
    );
  }

  const { customer, orders } = data!;
  const latestOrder = orders[0];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) { toast.error('Enter an order amount'); return; }
    const fd = new FormData();
    fd.append('customerId', customer._id);
    fd.append('lensType', lensType);
    fd.append('amount', amount);
    fd.append('status', status);
    fd.append('notes', notes);
    fd.append('eyePower', JSON.stringify({ right: { sph: rightSph, cyl: rightCyl, axis: rightAxis }, left: { sph: leftSph, cyl: leftCyl, axis: leftAxis } }));
    fd.append('frame', JSON.stringify({ brand, model, color }));
    if (prescFile) fd.append('prescriptionImage', prescFile);
    if (invFile)   fd.append('invoice', invFile);
    createOrderMutation.mutate(fd);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/customers" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0,
          }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={16} />
          </Link>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customers / <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong></span>
        </div>

        {/* ── Customer header card ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ height: 5, background: 'linear-gradient(90deg, var(--accent), #8b5cf6, #06b6d4)' }} />
          <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {customer.photo ? (
                <img src={customer.photo} alt={customer.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{customer.name}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Smartphone size={13} color="var(--accent)" /> {customer.mobile}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Calendar size={13} color="var(--accent)" />
                    Joined {new Date(customer.createdAt).toLocaleDateString('en-GB')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Package size={13} color="var(--accent)" />
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/customers/${customer._id}/edit`} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-muted)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <Edit size={14} /> Edit Profile
              </Link>
              <button onClick={() => setNewOrderOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10,
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'opacity 0.18s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <Plus size={15} /> New Order
              </button>
            </div>
          </div>
        </div>

        {/* ── Latest Eye Power ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={17} color="var(--accent)" />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Latest Eye Power Prescription</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {latestOrder ? `From order on ${new Date(latestOrder.createdAt).toLocaleDateString('en-GB')}` : 'No prescriptions on record'}
              </p>
            </div>
          </div>
          <div style={{ padding: 24 }}>
            {latestOrder ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <EyeCell label="Right Eye (OD)" eye={latestOrder.eyePower.right} />
                <EyeCell label="Left Eye (OS)"  eye={latestOrder.eyePower.left} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                No orders yet. Click "New Order" to add the first prescription.
              </div>
            )}
          </div>
        </div>

        {/* ── Order History table ── */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>Order & Prescription History</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Complete record of all prescription orders</p>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No orders recorded yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-muted)' }}>
                    {['Date', 'Frame Brand', 'Lens Type', 'Amount', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.14s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{order.frame.brand || '—'}</td>
                      <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{order.lensType || '—'}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>₹{order.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span className={STATUS_BADGE[order.status]} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelectedOrder(order)} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--text-secondary)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.14s',
                          }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent-soft)'; el.style.color = 'var(--accent)'; el.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--text-secondary)'; el.style.borderColor = 'var(--border)'; }}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button onClick={() => { setOrderToDeleteId(order._id); setDeleteOrderOpen(true); }} style={{
                            width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.14s',
                          }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(239,68,68,0.1)'; el.style.color = 'var(--danger)'; el.style.borderColor = 'var(--danger)'; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--text-muted)'; el.style.borderColor = 'var(--border)'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ───── View Order Details Modal ───── */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent style={{ maxWidth: 600 }}>
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Order Details</span>
                  <span className={STATUS_BADGE[selectedOrder.status]} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    {selectedOrder.status}
                  </span>
                </DialogTitle>
                <DialogDescription style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 12 }}>
                  Created on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'full' })}
                </DialogDescription>
              </DialogHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
                {/* Eye Power */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <EyeCell label="Right Eye (OD)" eye={selectedOrder.eyePower.right} />
                  <EyeCell label="Left Eye (OS)"  eye={selectedOrder.eyePower.left} />
                </div>

                {/* Frame & Lens details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  {[
                    ['Frame Brand', selectedOrder.frame.brand],
                    ['Frame Model', selectedOrder.frame.model],
                    ['Frame Color', selectedOrder.frame.color],
                    ['Lens Type',   selectedOrder.lensType],
                    ['Amount',      `₹${selectedOrder.amount.toLocaleString('en-IN')}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div style={{ padding: 14, background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Info size={12} /> Notes
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Files */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Prescription', url: selectedOrder.prescriptionImage },
                    { label: 'Invoice',      url: selectedOrder.invoice },
                  ].map(({ label, url }) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', margin: '0 0 8px' }}>{label}</p>
                      {url ? (
                        <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-muted)', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {url.endsWith('.pdf') ? (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--danger)' }}>PDF</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Receipt Invoice</div>
                            </div>
                          ) : (
                            <img src={url} alt={label} style={{ height: '100%', objectFit: 'contain', padding: 8 }} />
                          )}
                          <a href={url} target="_blank" rel="noreferrer" style={{
                            position: 'absolute', bottom: 8, right: 8,
                            background: 'var(--accent)', color: '#fff',
                            borderRadius: 7, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}>
                            <Download size={14} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ height: 80, border: '1px dashed var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No file uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter style={{ marginTop: 20 }}>
                <button onClick={() => setSelectedOrder(null)} style={{
                  padding: '9px 22px', borderRadius: 9, border: '1px solid var(--border)',
                  background: 'var(--bg-muted)', color: 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ───── Delete Order Confirmation ───── */}
      <Dialog open={deleteOrderOpen} onOpenChange={setDeleteOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>Delete Order?</DialogTitle>
            <DialogDescription style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              This will permanently remove the order from this customer's history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setDeleteOrderOpen(false)} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => orderToDeleteId && deleteOrderMutation.mutate(orderToDeleteId)}
              disabled={deleteOrderMutation.isPending}
              style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deleteOrderMutation.isPending ? 0.7 : 1 }}>
              {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete Order'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── New Order Modal ───── */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent style={{ maxWidth: 540 }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>Record New Order</DialogTitle>
            <DialogDescription style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
              New prescription order for {customer.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
            {/* Eye power */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prescription Grid</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Right */}
                <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 10px' }}>Right Eye (OD)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[['SPH', rightSph, setRightSph], ['CYL', rightCyl, setRightCyl], ['AXIS', rightAxis, setRightAxis]].map(([l, v, s]) => (
                      <div key={l as string}>
                        <FLabel>{l as string}</FLabel>
                        <FInput size={1} placeholder="—" value={v as string} onChange={(e) => (s as any)(e.target.value)} style={{ textAlign: 'center' }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Left */}
                <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 10px' }}>Left Eye (OS)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[['SPH', leftSph, setLeftSph], ['CYL', leftCyl, setLeftCyl], ['AXIS', leftAxis, setLeftAxis]].map(([l, v, s]) => (
                      <div key={l as string}>
                        <FLabel>{l as string}</FLabel>
                        <FInput size={1} placeholder="—" value={v as string} onChange={(e) => (s as any)(e.target.value)} style={{ textAlign: 'center' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Frame & Lens */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frame & Lens</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><FLabel>Brand</FLabel><FSelect value={brand} onChange={(e) => setBrand(e.target.value)}><option value="None">None</option>{brands.map((b: string) => <option key={b}>{b}</option>)}<option value="Other">Other</option></FSelect></div>
                <div><FLabel>Model</FLabel><FSelect value={model} onChange={(e) => setModel(e.target.value)}><option value="None">None</option>{models.map((m: string) => <option key={m}>{m}</option>)}</FSelect></div>
                <div><FLabel>Color</FLabel><FSelect value={color} onChange={(e) => setColor(e.target.value)}><option value="None">None</option>{colors.map((c: string) => <option key={c}>{c}</option>)}</FSelect></div>
                <div><FLabel>Lens Type</FLabel><FSelect value={lensType} onChange={(e) => setLensType(e.target.value)}><option value="None">None</option>{lenses.map((l: string) => <option key={l}>{l}</option>)}</FSelect></div>
              </div>
            </div>

            {/* Amount & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <FLabel>Amount (₹) *</FLabel>
                <FInput type="number" placeholder="4500" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <FLabel>Order Status</FLabel>
                <FSelect value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="New">New</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </FSelect>
              </div>
            </div>

            {/* File uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <FLabel>Prescription Image</FLabel>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setPrescFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', boxSizing: 'border-box' }} />
              </div>
              <div>
                <FLabel>Invoice (Image/PDF)</FLabel>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files && setInvFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <FLabel>Notes</FLabel>
              <textarea rows={2} placeholder="Special instructions or adjustments..." value={notes} onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
              />
            </div>

            <DialogFooter style={{ paddingTop: 4 }}>
              <button type="button" onClick={() => setNewOrderOpen(false)} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={createOrderMutation.isPending} style={{
                padding: '9px 20px', borderRadius: 9, border: 'none',
                background: createOrderMutation.isPending ? 'rgba(99,102,241,0.5)' : 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {createOrderMutation.isPending ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creating...</>
                ) : 'Create Order'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
