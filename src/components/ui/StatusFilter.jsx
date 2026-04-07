import { cn } from '@/utils/cn'

/**
 * StatusFilter — Active / Inactive / All segmented control.
 *
 * Props:
 *   value     — 'active' | 'inactive' | 'all'
 *   onChange  — (newValue) => void
 *   className — extra classes for the wrapper
 *
 * The values map directly to the backend's `?status=` query param. The admin
 * page passes `value` straight through to its `useList({ status: value })` call.
 */
const OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all',      label: 'All' },
]

export default function StatusFilter({ value = 'active', onChange, className }) {
  return (
    <div className={cn('inline-flex border border-gdd-black/10 rounded-sm overflow-hidden', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 font-equip text-[10px] tracking-widest-plus uppercase transition-colors',
            value === opt.value
              ? 'bg-gdd-black text-white'
              : 'bg-white text-gdd-black/50 hover:bg-sand-light/50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
