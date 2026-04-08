import { cn } from '@/utils/cn'

const statusStyles = {
  confirmed: 'bg-status-green/10 text-status-green',
  active: 'bg-status-green/10 text-status-green',
  paid: 'bg-status-green/10 text-status-green',
  sent: 'bg-status-green/10 text-status-green',
  resolved: 'bg-status-green/10 text-status-green',
  pending: 'bg-gold/10 text-gold-deep',
  scheduled: 'bg-gold/10 text-gold-deep',
  'in-progress': 'bg-gold/10 text-gold-deep',
  allocated: 'bg-gold/10 text-gold-deep',
  upcoming: 'bg-gold/10 text-gold-deep',
  cancelled: 'bg-status-red/10 text-status-red',
  inactive: 'bg-status-red/10 text-status-red',
  failed: 'bg-status-red/10 text-status-red',
  refunded: 'bg-status-blue/10 text-status-blue',
  unassigned: 'bg-status-blue/10 text-status-blue',
  draft: 'bg-gdd-black/5 text-gdd-black/50',
  new: 'bg-gdd-black/5 text-gdd-black/60',
  // SpecialRequest / BookingModification state machines
  'in-review': 'bg-gold/10 text-gold-deep',
  'awaiting-payment': 'bg-status-blue/10 text-status-blue',
  fulfilled: 'bg-status-green/10 text-status-green',
  declined: 'bg-status-red/10 text-status-red',
  approved: 'bg-status-green/10 text-status-green',
  denied: 'bg-status-red/10 text-status-red',
  applied: 'bg-status-green/10 text-status-green',
  expired: 'bg-gdd-black/5 text-gdd-black/40',
  'cancellation-pending': 'bg-gold/10 text-gold-deep',
}

export default function StatusBadge({ status, className }) {
  const style = statusStyles[status] || 'bg-gdd-black/5 text-gdd-black/50'

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
      style,
      className
    )}>
      {status}
    </span>
  )
}
