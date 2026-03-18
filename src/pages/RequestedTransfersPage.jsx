import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, DollarSign, Clock } from 'lucide-react'
import { mockTransferRequests } from '@/data/mockTransferRequests'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/utils/formatCurrency'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const statusConfig = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-gdd-black/5 text-gdd-black/50' },
}

const columns = [
  {
    key: 'bookingRef',
    label: 'Booking Ref',
    render: (val) => <span className="font-equip text-xs font-medium text-gdd-black/60">{val}</span>,
  },
  {
    key: 'guestName',
    label: 'Guest',
    cellClassName: 'font-medium text-gdd-black',
  },
  {
    key: 'route',
    label: 'Route',
    render: (val) => <span className="font-equip text-sm text-gdd-black">{val}</span>,
  },
  {
    key: 'carType',
    label: 'Car Type',
    render: (val) => <span className="font-equip text-sm text-gdd-black/70">{val}</span>,
  },
  {
    key: 'date',
    label: 'Date',
    render: (val) => (
      <span className="font-equip text-sm text-gdd-black/60">
        {new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'price',
    label: 'Price',
    render: (val) => (
      <span className="font-equip font-medium text-gdd-black">{formatCurrency(val)}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => {
      const cfg = statusConfig[val] ?? statusConfig.pending
      return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full font-equip text-[10px] font-medium uppercase tracking-widest-plus ${cfg.className}`}>
          {cfg.label}
        </span>
      )
    },
  },
]

export default function RequestedTransfersPage() {
  const sorted = useMemo(
    () => [...mockTransferRequests].sort((a, b) => new Date(a.date) - new Date(b.date)),
    []
  )

  const totalRevenue = useMemo(
    () => mockTransferRequests.reduce((s, t) => s + t.price, 0),
    []
  )

  const pendingCount = useMemo(
    () => mockTransferRequests.filter((t) => t.status === 'pending').length,
    []
  )

  return (
    <div>
      <PageHeader
        title="Requested Transfers"
        subtitle="All transfer requests from bookings"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transfers', value: mockTransferRequests.length, icon: ArrowLeftRight },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign },
          { label: 'Pending Confirmation', value: pendingCount, icon: Clock },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white p-5 rounded-sm shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
                  {card.label}
                </p>
                <p className="font-equip font-medium text-3xl text-gdd-black mt-1">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-gdd-black/10" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-sm shadow-sm"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <div className="px-6 py-4 border-b border-gdd-black/5">
          <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
            All requests — sorted by date
          </p>
        </div>
        <DataTable columns={columns} data={sorted} emptyMessage="No transfer requests found" />
      </motion.div>
    </div>
  )
}
