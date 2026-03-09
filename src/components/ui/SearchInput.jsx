import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gdd-black/30" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
      />
    </div>
  )
}
