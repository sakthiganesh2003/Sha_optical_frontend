import * as React from 'react';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ style, ...props }, ref) => (
  <input
    ref={ref}
    style={{
      width: '100%',
      boxSizing: 'border-box',
      height: 40,
      padding: '0 12px',
      background: 'var(--bg-muted)',
      border: '1px solid var(--border)',
      borderRadius: 9,
      color: 'var(--text-primary)',
      fontSize: 13,
      outline: 'none',
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
Input.displayName = 'Input';
