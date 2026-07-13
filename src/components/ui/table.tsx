import * as React from 'react';

export function Table({ children, style, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, ...style }} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, style, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead style={{ background: 'var(--bg-muted)', ...style }} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, style, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody style={{ ...style }} {...props}>
      {children}
    </tbody>
  );
}

export function TableHead({ children, style, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      style={{
        padding: '10px 16px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, style, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      style={{ borderTop: '1px solid var(--border)', transition: 'background 0.14s', ...style }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, style, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      style={{
        padding: '12px 16px',
        color: 'var(--text-secondary)',
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  );
}
