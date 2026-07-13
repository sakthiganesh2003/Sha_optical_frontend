'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Glasses, Eye, EyeOff, ArrowRight, Lock, User2 } from 'lucide-react';
import { authService } from '@/lib/api';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (localStorage.getItem('optical_shop_token')) router.replace('/dashboard');
  }, [router]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await authService.login(data);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      background: '#080d1c',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-15%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-15%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Left branding panel (hidden on mobile) */}
      <div className="hidden lg:flex" style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 60,
        gap: 32,
      }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 99, padding: '6px 14px',
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'pulse-soft 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>Optical Shop Management</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Manage your<br />
            <span style={{ color: '#818cf8' }}>optical shop</span><br />
            with precision.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
            Customer prescriptions, orders, lens inventory, and history — all in one beautiful admin panel.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 36 }}>
            {['Customer Management', 'Eye Prescriptions', 'Order Tracking', 'Master Data', 'Cloudinary Uploads'].map((f) => (
              <span key={f} style={{
                fontSize: 12, fontWeight: 500,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 99, padding: '5px 12px',
                color: 'rgba(255,255,255,0.6)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div className="animate-fade-up" style={{ width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              marginBottom: 16,
            }}>
              <Glasses size={28} color="white" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
             Sha Optical Admin
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Sign in to your admin console
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 32,
            backdropFilter: 'blur(20px)',
          }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User2 size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="admin"
                    autoComplete="username"
                    {...register('username')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      height: 46, padding: '0 14px 0 42px',
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.username ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.18s',
                    }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = '#6366f1'; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = errors.username ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                {errors.username && <p style={{ fontSize: 12, color: '#f87171', margin: '6px 0 0' }}>{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      height: 46, padding: '0 44px 0 42px',
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.password ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.18s',
                    }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = '#6366f1'; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = errors.password ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4 }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 12, color: '#f87171', margin: '6px 0 0' }}>{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 48, borderRadius: 12,
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.18s, transform 0.18s',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.4)',
                  marginTop: 4,
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                {loading ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
            OptiShop Admin Panel &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
