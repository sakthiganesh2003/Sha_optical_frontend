import * as React from 'react';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size    = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
  },
  outline: {
    background: 'var(--bg-muted)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  destructive: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  default: { height: 40, padding: '0 18px', fontSize: 13, borderRadius: 9 },
  sm:      { height: 32, padding: '0 12px', fontSize: 12, borderRadius: 7 },
  lg:      { height: 48, padding: '0 24px', fontSize: 15, borderRadius: 11 },
  icon:    { height: 36, width: 36, padding: 0, fontSize: 13, borderRadius: 9 },
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        transition: 'opacity 0.18s, transform 0.18s',
        fontFamily: 'inherit',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) (e.currentTarget as HTMLElement).style.opacity = '0.88';
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = isDisabled ? '0.65' : '1';
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading && (
        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
      )}
      {children}
    </button>
  );
}
