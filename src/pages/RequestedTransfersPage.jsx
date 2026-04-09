import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, DollarSign, Route } from 'lucide-react'
import { useRequestedTransfers } from '@/api/hooks/useRequestedTransfers'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import SearchInput from '@/components/ui/SearchInput'
import { formatCurrency } from '@/utils/formatCurrency'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const columns = [
  {
    key: 'bookingRef',
    label: 'Booking Ref',
    render: (val) => (
      <span className="font-equip text-xs font-medium tracking-widest-plus uppercase text-gdd-black/70">{val}</span>
    ),
  },
  {
    key: 'guestFirstName',
    label: 'Guest',
    cellClassName: 'font-medium text-gdd-black',
    render: (_val, row) => (
      <div>
        <p className="font-equip text-sm text-gdd-black">
          {[row.guestFirstName, row.guestLastName].filter(Boolean).join(' ') || '—'}
        </p>
        {row.guestEmail && (
          <p className="font-equip text-[10px] text-gdd-black/40">{row.guestEmail}</p>
        )}
      </div>
    ),
  },
  {
    key: 'routeId',
    label: 'Route',
    render: (val) => <span className="font-equip text-sm text-gdd-black">{val || '—'}</span>,
  },
  {
    key: 'carName',
    label: 'Car',
    render: (val) => <span className="font-equip text-sm text-gdd-black/70">{val || '—'}</span>,
  },
  {
    key: 'flightNumber',
    label: 'Flight',
    render: (val) => (
      <span className="font-equip text-xs text-gdd-black/60">{val || '—'}</span>
    ),
  },
  {
    key: 'dateFrom',
    label: 'Arrival',
    render: (val) => <span className="font-equip text-xs text-gdd-black/60">{formatDate(val)}</span>,
  },
  {
    key: 'price',
    label: 'Price',
    render: (val) => (
      <span className="font-equip font-medium text-gdd-black">{formatCurrency(val || 0)}</span>
    ),
  },
  {
    key: 'bookingStatus',
    label: 'Booking',
    render: (val) => {
      const cfg = val === 'confirmed'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700'
      return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full font-equip text-[10px] font-medium uppercase tracking-widest-plus ${cfg}`}>
          {val}
        </span>
      )
    },
  },
]

export default function RequestedTransfersPage() {
  const { data, isLoading, isError, refetch } = useRequestedTransfers()
  const [search, setSearch] = useState('')

  const rows = data?.rows || []
  const totals = data?.totals || { count: 0, totalRevenue: 0, uniqueRoutes: 0 }

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.bookingRef, r.guestFirstName, r.guestLastName, r.guestEmail, r.routeId, r.carName, r.flightNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [rows, search])

  return (
    <div>
      <PageHeader
        title="Requested Transfers"
        subtitle="Every transfer line from confirmed bookings"
      />

      {isError && (
        <div className="bg-white rounded-sm shadow-sm py-16 text-center mb-6">
          <p className="font-equip text-sm text-red-500 mb-3">Failed to load transfer requests.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transfers', value: totals.count,                        icon: ArrowLeftRight },
          { label: 'Total Revenue',   value: formatCurrency(totals.totalRevenue), icon: DollarSign },
          { label: 'Unique Routes',   value: totals.uniqueRoutes,                 icon: Route },
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gdd-black/5">
          <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
            All transfer lines — earliest first
          </p>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Booking ref, guest, route, flight…"
            className="w-full sm:w-80 sm:ml-auto"
          />
        </div>
        <DataTable columns={columns} data={filtered} loading={isLoading} emptyMessage="No transfer requests yet" />
      </motion.div>
    </div>
  )
}
