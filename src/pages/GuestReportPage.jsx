import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BedDouble, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useDataStore from '@/store/useDataStore'
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
      <span className="font-equip text-xs text-gdd-black/60">{'★'.repeat(val)}</span>
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
    key: 'totalRooms',
    label: 'Total Rooms',
    render: (val) => <span className="font-equip text-sm text-gdd-black/60">{val}</span>,
  },
  {
    key: 'bookedRooms',
    label: 'Booked',
    render: (val, row) => {
      const pct = row.totalRooms > 0 ? Math.round((val / row.totalRooms) * 100) : 0
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: GOLD }} />
          </div>
          <span className="font-equip text-xs text-gdd-black/50">{pct}%</span>
        </div>
      )
    },
  },
  {
    key: 'view',
    label: 'View',
    render: (val) => (
      <span className="font-equip text-xs text-gdd-black/50">{viewLabels[val] ?? val}</span>
    ),
  },
]

export default function GuestReportPage() {
  const { hotels } = useDataStore()
  const [exported, setExported] = useState(false)

  const sorted = useMemo(
    () => [...hotels].sort((a, b) => (b.guests ?? 0) - (a.guests ?? 0)),
    [hotels]
  )

  const totalGuests = useMemo(() => hotels.reduce((s, h) => s + (h.guests ?? 0), 0), [hotels])

  const atCapacity = useMemo(
    () => hotels.filter((h) => h.bookedRooms >= h.totalRooms).length,
    [hotels]
  )

  const avgOccupancy = useMemo(() => {
    if (!hotels.length) return 0
    const total = hotels.reduce((s, h) => s + (h.totalRooms > 0 ? h.bookedRooms / h.totalRooms : 0), 0)
    return Math.round((total / hotels.length) * 100)
  }, [hotels])

  const chartData = sorted.map((h) => ({
    name: h.name.split(' ').slice(0, 2).join(' '),
    guests: h.guests ?? 0,
  }))

  const handleExport = () => {
    const headers = ['Hotel', 'Stars', 'Guests', 'Total Rooms', 'Booked Rooms', 'Occupancy %', 'View']
    const rows = sorted.map((h) => [
      h.name,
      h.stars,
      h.guests ?? 0,
      h.totalRooms,
      h.bookedRooms,
      h.totalRooms > 0 ? Math.round((h.bookedRooms / h.totalRooms) * 100) : 0,
      viewLabels[h.view] ?? h.view,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-report.csv'
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Hotels Guests Report"
        subtitle={`${totalGuests} total guests across ${hotels.length} hotels`}
        action={
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            {exported ? 'Exported!' : 'Export CSV'}
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Guests', value: totalGuests, icon: Users },
          { label: 'Hotels at Capacity', value: atCapacity, icon: BedDouble },
          { label: 'Avg Occupancy', value: `${avgOccupancy}%`, icon: TrendingUp },
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
      <motion.div
        className="bg-white rounded-sm shadow-sm p-6 mb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mb-4">
          Guests per Hotel
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
        <DataTable columns={columns} data={sorted} emptyMessage="No hotels found" />
      </motion.div>
    </div>
  )
}
