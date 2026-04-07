import { cn } from '@/utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * DataTable
 *
 * Props:
 *   columns       — array of { key, label, render?, className?, cellClassName? }
 *   data          — array of rows
 *   onRowClick    — (row) => void
 *   emptyMessage  — string shown when data is empty
 *   loading       — bool, shows skeleton state
 *
 *   --- pagination (optional) ---
 *   page          — current 1-based page
 *   limit         — page size
 *   total         — total row count across all pages
 *   onPageChange  — (newPage) => void
 *
 * If pagination props are omitted, the footer just shows row count (legacy
 * behavior).
 */
export default function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  page,
  limit,
  total,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-equip text-sm text-gdd-black/30">{emptyMessage}</p>
      </div>
    )
  }

  const isPaginated = page !== undefined && limit !== undefined && total !== undefined && onPageChange
  const totalPages = isPaginated ? Math.max(1, Math.ceil(total / limit)) : 1
  const fromRow = isPaginated ? (page - 1) * limit + 1 : 1
  const toRow = isPaginated ? Math.min(page * limit, total) : data.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gdd-black/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left font-equip font-medium text-[10px] tracking-widest-plus uppercase text-gdd-black/40',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || row._id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'group transition-all duration-200',
                'border-b border-gdd-black/[0.04]',
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-sand-light/25',
                onRowClick && 'cursor-pointer hover:bg-gold/[0.06] hover:shadow-[inset_3px_0_0_0_#D4985A]',
              )}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-5 py-4 font-equip text-sm text-gdd-black/60',
                    'border-r border-gdd-black/[0.03] last:border-r-0',
                    colIndex === 0 && 'text-gdd-black/80',
                    onRowClick && 'group-hover:text-gdd-black/80',
                    col.cellClassName
                  )}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-sand-light/30 border-t border-gdd-black/[0.06] rounded-b-sm flex items-center justify-between gap-4">
        <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30">
          {isPaginated
            ? `${fromRow}–${toRow} of ${total}`
            : `${data.length} ${data.length === 1 ? 'record' : 'records'}`}
        </p>

        {isPaginated && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 text-gdd-black/40 hover:text-gdd-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 text-gdd-black/40 hover:text-gdd-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
