'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Camera } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { customerService } from '@/lib/api';

const schema = z.object({
  name:   z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
});
type FormValues = z.infer<typeof schema>;

export default function EditCustomerPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customerDetails', id],
    queryFn: () => customerService.getDetails(id),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', mobile: '' },
  });

  React.useEffect(() => {
    if (data?.customer) {
      setValue('name', data.customer.name);
      setValue('mobile', data.customer.mobile);
      if (data.customer.photo) setPhotoPreview(data.customer.photo);
    }
  }, [data, setValue]);

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => customerService.update(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Profile updated!');
      router.push(`/customers/${id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error updating profile'),
  });

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    fd.append('mobile', values.mobile);
    if (photoFile) fd.append('photo', photoFile);
    updateMutation.mutate(fd);
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[48, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14 }}><div className="skeleton" style={{ height: '100%' }} /></div>)}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
          <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Failed to load customer.</p>
          <Link href={`/customers/${id}`} style={{ padding: '9px 18px', borderRadius: 9, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Go Back</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href={`/customers/${id}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', textDecoration: 'none',
          }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              Edit Profile
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Update details for {data?.customer?.name}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Personal Information</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Modify contact details and profile photo.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 7 }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    style={{
                      width: '100%', boxSizing: 'border-box', height: 42, padding: '0 14px',
                      background: 'var(--bg-muted)', border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none', transition: 'border-color 0.18s',
                    }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = errors.name ? 'var(--danger)' : 'var(--border)'; }}
                  />
                  {errors.name && <p style={{ fontSize: 11, color: 'var(--danger)', margin: '5px 0 0' }}>{errors.name.message}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 7 }}>
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    {...register('mobile')}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '');
                      register('mobile').onChange(e);
                    }}
                    style={{
                      width: '100%', boxSizing: 'border-box', height: 42, padding: '0 14px',
                      background: 'var(--bg-muted)', border: `1px solid ${errors.mobile ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: 9, color: 'var(--text-primary)', fontSize: 13, outline: 'none', transition: 'border-color 0.18s',
                    }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = errors.mobile ? 'var(--danger)' : 'var(--border)'; }}
                  />
                  {errors.mobile && <p style={{ fontSize: 11, color: 'var(--danger)', margin: '5px 0 0' }}>{errors.mobile.message}</p>}
                </div>
              </div>

              {/* Photo */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Photo</label>
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg-muted)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={22} color="var(--text-muted)" />
                    )}
                  </div>
                  <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPhotoFile(e.target.files[0]);
                        setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Link href={`/customers/${id}`} style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg-muted)', color: 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                Cancel
              </Link>
              <button type="submit" disabled={updateMutation.isPending} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: updateMutation.isPending ? 'rgba(99,102,241,0.5)' : 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: updateMutation.isPending ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
              }}>
                {updateMutation.isPending ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
