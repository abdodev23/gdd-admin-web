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
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-sand-light/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3.5 text-left font-equip font-medium text-[10px] tracking-widest-plus uppercase text-gdd-black/50 border-b border-gdd-black/10 first:rounded-tl-sm last:rounded-tr-sm',
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
                'border-b border-gdd-black/5 transition-all duration-150',
                onRowClick && 'cursor-pointer hover:bg-gold/[0.03]',
                rowIndex % 2 === 1 && 'bg-sand-light/20'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 font-equip text-sm text-gdd-black/70',
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
    </div>
  )
}
