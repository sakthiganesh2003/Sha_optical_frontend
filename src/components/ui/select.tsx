import * as React from 'react';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ style, ...props }, ref) => (
  <select
    ref={ref}
    style={{
      width: '100%',
      height: 40,
      padding: '0 12px',
      background: 'var(--bg-muted)',
      border: '1px solid var(--border)',
      borderRadius: 9,
      color: 'var(--text-primary)',
      fontSize: 13,
      outline: 'none',
      cursor: 'pointer',
      appearance: 'auto',
      transition: 'border-color 0.18s',
      ...style,
    }}
    onFocus={(e) => {
      (e.target as HTMLElement).style.borderColor = 'var(--accent)';
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      (e.target as HTMLElement).style.borderColor = 'var(--border)';
      props.onBlur?.(e);
    }}
    {...props}
  />
));
Select.displayName = 'Select';
