import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BedDouble, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useGuestReport } from '@/api/hooks/useGuestReport'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const viewLabels = { pyramid: 'Pyramid', nile: 'Nile', city: 'City' }
const GOLD = '#AC7C43'

const columns = [
  {
    key: 'name',
    label: 'Hotel',
    cellClassName: 'font-medium text-gdd-black',
  },
  {
    key: 'stars',
    label: 'Stars',
    render: (val) => (
      <span className="font-equip text-xs text-gdd-black/60">{'★'.repeat(val || 0)}</span>
    ),
  },
  {
    key: 'guests',
    label: 'Guests',
    render: (val) => (
      <span className="font-equip font-medium text-gdd-black">{val ?? 0}</span>
    ),
  },
  {
    key: 'adults',
    label: 'Adults / Children',
    render: (_val, row) => (
      <span className="font-equip text-xs text-gdd-black/60">
        {row.adults ?? 0} / {row.children ?? 0}
      </span>
    ),
  },
  {
    key: 'bookings',
    label: 'Bookings',
    render: (val) => <span className="font-equip text-sm text-gdd-black/70">{val ?? 0}</span>,
  },
  {
    key: 'totalNights',
    label: 'Total Nights',
    render: (val) => <span className="font-equip text-sm text-gdd-black/60">{val ?? 0}</span>,
  },
  {
    key: 'bookedRoomNights',
    label: 'Room-Nights',
    render: (val, row) => {
      const pct = row.occupancyPct ?? 0
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: GOLD }} />
          </div>
          <span className="font-equip text-xs text-gdd-black/50">{val} ({pct}%)</span>
        </div>
      )
    },
  },
  {
    key: 'view',
    label: 'View',
    render: (val) => (
      <span className="font-equip text-xs text-gdd-black/50">{viewLabels[val] ?? val ?? '—'}</span>
    ),
  },
]

export default function GuestReportPage() {
  const { data, isLoading, isError, refetch } = useGuestReport()
  const [exported, setExported] = useState(false)

  const rows = data?.rows || []
  const totals = data?.totals || { totalGuests: 0, hotelsCount: 0, atCapacityCount: 0, avgOccupancyPct: 0 }

  const chartData = useMemo(
    () => rows.slice(0, 10).map((h) => ({
      name: h.name.split(' ').slice(0, 2).join(' '),
      guests: h.guests ?? 0,
    })),
    [rows]
  )

  const handleExport = () => {
    const headers = ['Hotel', 'Stars', 'Guests', 'Adults', 'Children', 'Bookings', 'Total Nights', 'Room-Nights', 'Occupancy %', 'Revenue', 'View']
    const body = rows.map((h) => [
      h.name,
      h.stars,
      h.guests ?? 0,
      h.adults ?? 0,
      h.children ?? 0,
      h.bookings ?? 0,
      h.totalNights ?? 0,
      h.bookedRoomNights ?? 0,
      h.occupancyPct ?? 0,
      h.revenue ?? 0,
      viewLabels[h.view] ?? h.view ?? '',
    ])
    const esc = (v) => {
      const s = String(v ?? '').replace(/"/g, '""')
      return /[",\n]/.test(s) ? `"${s}"` : s
    }
    const csv = [headers, ...body].map((r) => r.map(esc).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guest-report-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Hotels Guests Report"
        subtitle={`${totals.totalGuests} total guests across ${totals.hotelsCount} hotels`}
        action={
          <button
            onClick={handleExport}
            disabled={!rows.length}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exported ? 'Exported!' : 'Export CSV'}
          </button>
        }
      />

      {isError && (
        <div className="bg-white rounded-sm shadow-sm py-16 text-center mb-6">
          <p className="font-equip text-sm text-red-500 mb-3">Failed to load guest report.</p>
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
          { label: 'Total Guests',        value: totals.totalGuests,         icon: Users },
          { label: 'Hotels at Capacity',  value: totals.atCapacityCount,     icon: BedDouble },
          { label: 'Avg Occupancy',       value: `${totals.avgOccupancyPct}%`, icon: TrendingUp },
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

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <motion.div
          className="bg-white rounded-sm shadow-sm p-6 mb-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mb-4">
            Guests per Hotel (Top 10)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis
                dataKey="name"
                tick={{ fontFamily: 'Equip, sans-serif', fontSize: 10, fill: '#15151680' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: 'Equip, sans-serif', fontSize: 10, fill: '#15151650' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{ fontFamily: 'Equip, sans-serif', fontSize: 12, border: 'none', borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#AC7C4310' }}
              />
              <Bar dataKey="guests" radius={[2, 2, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? GOLD : '#AC7C4360'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        className="bg-white rounded-sm shadow-sm"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <div className="px-6 py-4 border-b border-gdd-black/5">
          <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
            All Hotels — sorted by guests
          </p>
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No hotel bookings yet" />
      </motion.div>
    </div>
  )
}
