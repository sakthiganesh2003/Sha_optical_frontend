'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Check, X, RefreshCw, Tag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { masterDataService } from '@/lib/api';
import { MasterData } from '@/lib/types';

type TabType = 'brands' | 'models' | 'colors' | 'lenses';
const TABS: { value: TabType; label: string; emoji: string }[] = [
  { value: 'brands',  label: 'Frame Brands',  emoji: '🕶️' },
  { value: 'models',  label: 'Frame Models',  emoji: '📐' },
  { value: 'colors',  label: 'Frame Colors',  emoji: '🎨' },
  { value: 'lenses',  label: 'Lens Types',    emoji: '🔬' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<TabType>('brands');
  const [newValue, setNewValue] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<MasterData | null>(null);

  const { data, isLoading, refetch } = useQuery({ queryKey: ['masterData'], queryFn: masterDataService.getAll });

  const addMutation = useMutation({
    mutationFn: masterDataService.add,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['masterData'] }); toast.success('Item added'); setNewValue(''); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error adding item'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => masterDataService.update(id, value),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['masterData'] }); toast.success('Item updated'); setEditingId(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error updating item'),
  });

  const deleteMutation = useMutation({
    mutationFn: masterDataService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['masterData'] }); toast.success('Item deleted'); setDeleteOpen(false); setItemToDelete(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error deleting item'),
  });

  const currentItems = data?.[activeTab] || [];
  const activeTabInfo = TABS.find((t) => t.value === activeTab)!;

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Master Data Settings
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Configure dropdown values for frame brands, models, colors, and lens types.
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--border)', overflowX: 'auto', paddingBottom: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setEditingId(null); setNewValue(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px',
                border: 'none', borderBottom: activeTab === tab.value ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -2,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === tab.value ? 700 : 500,
                color: activeTab === tab.value ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Panel header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                {activeTabInfo.emoji} {activeTabInfo.label}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {currentItems.length} item{currentItems.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button onClick={() => refetch()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-muted)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Add form */}
            <form onSubmit={(e) => { e.preventDefault(); if (!newValue.trim()) return; addMutation.mutate({ type: activeTab, value: newValue }); }}
              style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                <Tag size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder={`New ${activeTabInfo.label.toLowerCase().replace(/s$/, '')}...`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    height: 40, paddingLeft: 36, paddingRight: 14,
                    background: 'var(--bg-muted)', border: '1px solid var(--border)',
                    borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
                />
              </div>
              <button type="submit" disabled={addMutation.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 18px', height: 40, borderRadius: 9, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: addMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: addMutation.isPending ? 0.7 : 1,
                }}>
                <Plus size={15} /> Add
              </button>
            </form>

            {/* Items grid */}
            {isLoading ? (
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ height: 44, borderRadius: 8 }}><div className="skeleton" style={{ height: '100%' }} /></div>
                ))}
              </div>
            ) : currentItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                No items yet. Add one above.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
                {currentItems.map((item) => (
                  <div key={item._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--bg-muted)',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    {editingId === item._id ? (
                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 6 }}>
                        <input
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') editMutation.mutate({ id: item._id, value: editingValue }); if (e.key === 'Escape') setEditingId(null); }}
                          style={{
                            flex: 1, height: 30, padding: '0 8px',
                            background: 'var(--bg-surface)', border: '1px solid var(--accent)',
                            borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                          }}
                        />
                        <button onClick={() => editMutation.mutate({ id: item._id, value: editingValue })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: 2 }}>
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.value}
                        </span>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button onClick={() => { setEditingId(item._id); setEditingValue(item.value); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 5px', borderRadius: 6, transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent-soft)'; el.style.color = 'var(--accent)'; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = 'var(--text-muted)'; }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { setItemToDelete(item); setDeleteOpen(true); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 5px', borderRadius: 6, transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(239,68,68,0.1)'; el.style.color = 'var(--danger)'; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = 'var(--text-muted)'; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>Delete Item?</DialogTitle>
            <DialogDescription style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{itemToDelete?.value}"</strong>? This value will no longer appear in dropdowns for new orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setDeleteOpen(false)}
              style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete._id)}
              disabled={deleteMutation.isPending}
              style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: deleteMutation.isPending ? 0.7 : 1 }}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Item'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
