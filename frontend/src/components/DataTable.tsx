import { ReactNode } from 'react';
import clsx from 'clsx';
import './DataTable.css';

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
};

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  loading,
  empty,
  onRowClick,
  className,
  compact,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={clsx('pp-table-wrap', compact && 'pp-table-wrap--compact', className)}>
      <table className="pp-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align || 'left' }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <tr key={`sk-${i}`} className="pp-table__skeleton-row">
                {columns.map((c) => (
                  <td key={c.key}>
                    <div className="pp-skeleton pp-table__skeleton-cell" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="pp-table__empty">
                {empty || 'No records found.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={clsx(onRowClick && 'pp-table__row--clickable')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
