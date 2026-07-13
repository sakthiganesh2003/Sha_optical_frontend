import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      />
      {/* Panel */}
      <div
        className={className}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 520,
          borderRadius: 16,
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          padding: 28,
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.22s cubic-bezier(.16,1,.3,1)',
          ...style,
        }}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          style={{
            position: 'absolute', right: 16, top: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          <X size={18} />
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Close</span>
        </button>
      </div>
    </div>
  );
}

export function DialogHeader({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }} {...props} />
  );
}

export function DialogFooter({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, ...style }} {...props} />
  );
}

export function DialogTitle({
  style,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, ...style }} {...props} />
  );
}

export function DialogDescription({
  style,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', ...style }} {...props} />
  );
}
