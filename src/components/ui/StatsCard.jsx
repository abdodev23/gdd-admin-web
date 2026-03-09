import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

export default function StatsCard({ icon: Icon, label, value, trend, className, index = 0 }) {
  return (
    <motion.div
      className={cn('bg-white p-6 rounded-sm shadow-sm', className)}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/10">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-equip font-medium',
            trend >= 0 ? 'text-status-green' : 'text-status-red'
          )}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="font-equip font-medium text-3xl text-gdd-black">{value}</p>
        <p className="mt-1 font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
          {label}
        </p>
      </div>
    </motion.div>
  )
}
