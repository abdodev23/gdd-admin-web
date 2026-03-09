import { cn } from '@/utils/cn'

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold/30',
          checked ? 'bg-gold' : 'bg-gdd-black/10'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </button>
      {label && (
        <span className="font-equip text-sm text-gdd-black">{label}</span>
      )}
    </label>
  )
}
