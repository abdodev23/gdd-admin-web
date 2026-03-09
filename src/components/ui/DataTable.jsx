import { cn } from '@/utils/cn'

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-equip text-sm text-gdd-black/30">{emptyMessage}</p>
      </div>
    )
  }

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
              key={row.id || rowIndex}
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

      {/* Footer row count */}
      <div className="px-5 py-2.5 bg-sand-light/30 border-t border-gdd-black/[0.06] rounded-b-sm">
        <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30">
          {data.length} {data.length === 1 ? 'record' : 'records'}
        </p>
      </div>
    </div>
  )
}
