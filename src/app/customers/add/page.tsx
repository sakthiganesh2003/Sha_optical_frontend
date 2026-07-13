'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Eye as EyeIcon, Sparkles, FileText, Camera, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { customerService, masterDataService } from '@/lib/api';

/* ── Zod schema ─────────────────────────────────── */
const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  mobile:   z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  eyePower: z.object({
    right: z.object({ sph: z.string(), cyl: z.string(), axis: z.string() }),
    left:  z.object({ sph: z.string(), cyl: z.string(), axis: z.string() }),
  }),
  frame:    z.object({
    brand: z.string().min(1),
    model: z.string().min(1),
    color: z.string().min(1),
  }),
  lensType: z.string().min(1),
  amount:   z.string().min(1, 'Order Amount is required'),
  status:   z.enum(['New', 'Processing', 'Ready', 'Delivered', 'Cancelled']),
  notes:    z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/* ── Section card wrapper ───────────────────────── */
function Section({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="var(--accent)" />
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

/* ── Styled input ───────────────────────────────── */
function FInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        style={{
          width: '100%', boxSizing: 'border-box',
          height: 42, padding: '0 14px',
          background: 'var(--bg-muted)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
          transition: 'border-color 0.18s',
        }}
        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = error ? 'var(--danger)' : 'var(--border)'; }}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', margin: '5px 0 0' }}>{error}</p>}
    </div>
  );
}

/* ── Styled label ───────────────────────────────── */
function FLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 7 }}>
      {children}
    </label>
  );
}

/* ── Styled select ──────────────────────────────── */
function FSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%', height: 42, padding: '0 14px',
        background: 'var(--bg-muted)', border: '1px solid var(--border)',
        borderRadius: 9, color: 'var(--text-primary)', fontSize: 13,
        outline: 'none', cursor: 'pointer', appearance: 'auto',
        transition: 'border-color 0.18s',
      }}
      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {children}
    </select>
  );
}

/* ── Eye power row ──────────────────────────────── */
function EyePowerGrid({ label, prefix, register }: { label: string; prefix: 'eyePower.right' | 'eyePower.left'; register: any }) {
  return (
    <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 3, height: 14, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} />
        {label}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {(['sph', 'cyl', 'axis'] as const).map((field) => (
          <div key={field}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>
              {field}
            </label>
            <input
              type="text"
              placeholder={field === 'sph' ? '-1.50' : field === 'cyl' ? '-0.50' : '180'}
              {...register(`${prefix}.${field}`)}
              style={{
                width: '100%', boxSizing: 'border-box',
                height: 38, padding: '0 10px', textAlign: 'center',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
                fontWeight: 600, outline: 'none',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── File Upload Zone ───────────────────────────── */
function UploadZone({ label, accept, preview, isPdf, fileName, onFile }: {
  label: string; accept: string; preview: string | null; isPdf?: boolean; fileName?: string;
  onFile: (f: File) => void;
}) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <label style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed var(--border)', borderRadius: 12, padding: '20px 16px',
        background: 'var(--bg-muted)', cursor: 'pointer', transition: 'border-color 0.18s, background 0.18s',
        minHeight: 120,
      }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.background = 'var(--accent-soft)'; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--bg-muted)'; }}
      >
        <input type="file" accept={accept} className="absolute inset-0 opacity-0 cursor-pointer" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
        {preview ? (
          isPdf ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(239,68,68,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--danger)' }}>PDF</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <img src={preview} alt="" style={{ height: 80, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fileName}</span>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <UploadCloud size={28} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Choose File</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click or drag &amp; drop</span>
          </div>
        )}
      </label>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────── */
export default function AddCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [prescFile, setPrescFile] = React.useState<File | null>(null);
  const [invFile,  setInvFile]   = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [prescPreview, setPrescPreview] = React.useState<string | null>(null);
  const [invPreview,   setInvPreview]   = React.useState<string | null>(null);

  const { data: masterData } = useQuery({ queryKey: ['masterData'], queryFn: masterDataService.getAll });

  const brands = masterData?.brands?.map((d: any) => d.value) ?? ['Ray-Ban','Titan Eye+','Fastrack','Vogue','Oakley','Police'];
  const models = masterData?.models?.map((d: any) => d.value) ?? ['Full Rim','Half Rim','Rimless','Round','Square','Aviator'];
  const colors = masterData?.colors?.map((d: any) => d.value) ?? ['Black','Brown','Blue','Grey','Gold','Silver','Transparent'];
  const lenses = masterData?.lenses?.map((d: any) => d.value) ?? ['Single Vision','Progressive','Bifocal','Blue Cut','Anti Glare'];

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', mobile: '',
      eyePower: { right: { sph: '', cyl: '', axis: '' }, left: { sph: '', cyl: '', axis: '' } },
      frame: { brand: 'None', model: 'None', color: 'None' },
      lensType: 'None', amount: '', status: 'New', notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: customerService.add,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Customer saved successfully!');
      router.push(`/customers/${data.customer._id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error saving customer'),
  });

  const handleFile = (file: File, setFile: any, setPreview: any) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    fd.append('mobile', values.mobile);
    fd.append('eyePower', JSON.stringify(values.eyePower));
    fd.append('frame', JSON.stringify(values.frame));
    fd.append('lensType', values.lensType);
    fd.append('amount', values.amount);
    fd.append('status', values.status);
    if (values.notes) fd.append('notes', values.notes);
    if (photoFile) fd.append('photo', photoFile);
    if (prescFile)  fd.append('prescriptionImage', prescFile);
    if (invFile)    fd.append('invoice', invFile);
    mutation.mutate(fd);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/customers" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0,
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              Register New Customer
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Create a customer profile with their initial prescription and first order.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Section 1: Customer Profile ── */}
          <Section title="Customer Profile" subtitle="Name, mobile number, and profile photo" icon={User}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <FLabel>Customer Name *</FLabel>
                  <FInput type="text" placeholder="e.g. John Doe" error={errors.name?.message} {...register('name')} />
                </div>
                <div>
                  <FLabel>Mobile Number *</FLabel>
                  <FInput 
                    type="text" 
                    placeholder="e.g. 9876543210" 
                    maxLength={10}
                    error={errors.mobile?.message} 
                    {...register('mobile')} 
                    onChange={(e) => {
                      // Filter non-digits
                      e.target.value = e.target.value.replace(/\D/g, '');
                      // Explicit trigger register onChange
                      register('mobile').onChange(e);
                    }}
                  />
                </div>
              </div>

              {/* Photo uploader */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Photo
                </label>
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'var(--bg-muted)', border: '2px dashed var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', transition: 'border-color 0.18s',
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={22} color="var(--text-muted)" />
                    )}
                    {photoPreview && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.18s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Change</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0], setPhotoFile, setPhotoPreview); }} />
                </label>
              </div>
            </div>
          </Section>

          {/* ── Section 2: Eye Power ── */}
          <Section title="Eye Power Prescription" subtitle="SPH, CYL, AXIS for both eyes" icon={EyeIcon}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <EyePowerGrid label="Right Eye (OD)" prefix="eyePower.right" register={register} />
              <EyePowerGrid label="Left Eye (OS)"  prefix="eyePower.left"  register={register} />
            </div>
          </Section>

          {/* ── Section 3: Frame & Lens ── */}
          <Section title="Frame & Lens Selection" subtitle="Select items from your master inventory" icon={Sparkles}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <FLabel>Frame Brand</FLabel>
                <FSelect {...register('frame.brand')}>
                  <option value="None">None</option>
                  {brands.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  <option value="Other">Other</option>
                </FSelect>
              </div>
              <div>
                <FLabel>Frame Model</FLabel>
                <FSelect {...register('frame.model')}>
                  <option value="None">None</option>
                  {models.map((m: string) => <option key={m} value={m}>{m}</option>)}
                </FSelect>
              </div>
              <div>
                <FLabel>Frame Color</FLabel>
                <FSelect {...register('frame.color')}>
                  <option value="None">None</option>
                  {colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </FSelect>
              </div>
              <div>
                <FLabel>Lens Type</FLabel>
                <FSelect {...register('lensType')}>
                  <option value="None">None</option>
                  {lenses.map((l: string) => <option key={l} value={l}>{l}</option>)}
                </FSelect>
              </div>
            </div>
          </Section>

          {/* ── Section 4: Billing & Files ── */}
          <Section title="Billing & File Uploads" subtitle="Amount, order status, prescription & invoice" icon={FileText}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <FLabel>Total Amount (₹) *</FLabel>
                  <FInput type="number" placeholder="4500" error={errors.amount?.message} {...register('amount')} />
                </div>
                <div>
                  <FLabel>Order Status</FLabel>
                  <FSelect {...register('status')}>
                    <option value="New">New</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </FSelect>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <UploadZone
                  label="Prescription Image"
                  accept="image/*"
                  preview={prescPreview}
                  fileName={prescFile?.name}
                  onFile={(f) => handleFile(f, setPrescFile, setPrescPreview)}
                />
                <UploadZone
                  label="Invoice Receipt (Image / PDF)"
                  accept="image/*,application/pdf"
                  preview={invPreview}
                  isPdf={invFile?.type === 'application/pdf'}
                  fileName={invFile?.name}
                  onFile={(f) => handleFile(f, setInvFile, setInvPreview)}
                />
              </div>

              <div>
                <FLabel>Order Notes</FLabel>
                <textarea
                  rows={3}
                  placeholder="Adjustments, specific instructions, frame fitting notes..."
                  {...register('notes')}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', background: 'var(--bg-muted)',
                    border: '1px solid var(--border)', borderRadius: 9,
                    color: 'var(--text-primary)', fontSize: 13,
                    fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
                />
              </div>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 24 }}>
            <Link href="/customers" style={{
              padding: '10px 22px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              Cancel
            </Link>
            <button type="submit" disabled={mutation.isPending} style={{
              padding: '10px 28px', borderRadius: 10, border: 'none',
              background: mutation.isPending ? 'rgba(99,102,241,0.5)' : 'var(--accent)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              boxShadow: mutation.isPending ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'opacity 0.18s',
            }}>
              {mutation.isPending ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </>
              ) : 'Save Customer & Order'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
