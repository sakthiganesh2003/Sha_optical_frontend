import * as React from 'react';

export function Card({
  children,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ padding: '18px 22px 0', ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', ...style }} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px', ...style }} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ padding: '16px 22px 20px', ...style }} {...props}>
      {children}
    </div>
  );
}
