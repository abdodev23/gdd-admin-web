import { motion } from 'framer-motion'
import { DollarSign, Users, Ticket, BarChart3, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import useDataStore from '@/store/useDataStore'
import StatsCard from '@/components/ui/StatsCard'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency } from '@/utils/formatCurrency'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const revenueData = [
  { month: 'Jan', revenue: 18500 },
  { month: 'Feb', revenue: 32400 },
  { month: 'Mar', revenue: 28900 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
]

const bookingsByTier = [
  { tier: 'General', count: 847, fill: '#C9A96E' },
  { tier: 'Premium', count: 198, fill: '#B8860B' },
  { tier: 'VIP', count: 72, fill: '#FFD700' },
]

const seatData = [
  { name: 'General', value: 847, total: 1140, fill: '#C9A96E' },
  { name: 'Premium', value: 198, total: 300, fill: '#B8860B' },
  { name: 'VIP', value: 117, total: 150, fill: '#FFD700' },
]

const recentColumns = [
  { key: 'id', label: 'ID', cellClassName: 'font-medium text-gdd-black' },
  { key: 'customerName', label: 'Customer' },
  { key: 'ticketTier', label: 'Tier', render: (val) => (
    <span className="font-equip text-xs font-medium uppercase tracking-widest-plus">{val}</span>
  )},
  { key: 'total', label: 'Total', render: (val) => formatCurrency(val) },
  { key: 'paymentStatus', label: 'Payment', render: (val) => <StatusBadge status={val} /> },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gdd-black text-white px-3 py-2 rounded-sm shadow-lg">
      <p className="font-equip text-xs text-white/60">{label}</p>
      <p className="font-equip font-medium text-sm">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { bookings, getStats } = useDataStore()
  const stats = getStats()
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} trend={12.5} index={0} />
        <StatsCard icon={Users} label="Total Bookings" value={stats.totalBookings} trend={8.3} index={1} />
        <StatsCard icon={Ticket} label="Tickets Sold" value={`${stats.ticketsSold} / ${stats.totalSeats}`} trend={6.1} index={2} />
        <StatsCard icon={BarChart3} label="Seat Occupancy" value={`${stats.seatOccupancy}%`} trend={4.7} index={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Revenue Trend */}
        <motion.div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4985A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4985A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#15151608" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#15151660', fontSize: 11, fontFamily: 'Equip' }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#15151660', fontSize: 11, fontFamily: 'Equip' }} tickFormatter={(v) => v === 0 ? '$0' : `$${v / 1000}k`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#D4985A" strokeWidth={2} fill="url(#goldGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bookings by Tier */}
        <motion.div className="bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={5}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Bookings by Tier</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsByTier} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#15151608" vertical={false} />
              <XAxis dataKey="tier" tickLine={false} axisLine={false} tick={{ fill: '#15151660', fontSize: 11, fontFamily: 'Equip' }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#15151660', fontSize: 11, fontFamily: 'Equip' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} width={35} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-gdd-black text-white px-3 py-2 rounded-sm shadow-lg">
                    <p className="font-equip text-xs text-white/60">{payload[0].payload.tier}</p>
                    <p className="font-equip font-medium text-sm">{payload[0].value} bookings</p>
                  </div>
                )
              }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {bookingsByTier.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Seat Occupancy + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <motion.div className="bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={6}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Seat Occupancy</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={seatData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                {seatData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                const pct = Math.round((d.value / d.total) * 100)
                return (
                  <div className="bg-gdd-black text-white px-3 py-2 rounded-sm shadow-lg">
                    <p className="font-equip text-xs text-white/60">{d.name}</p>
                    <p className="font-equip font-medium text-sm">{d.value.toLocaleString()} / {d.total.toLocaleString()}</p>
                    <p className="font-equip text-xs text-white/40">{pct}% occupied</p>
                  </div>
                )
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {seatData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                <span className="font-equip text-[10px] text-gdd-black/40">{s.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={7}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'View All Bookings', desc: `${stats.pendingBookings} pending`, path: '/bookings' },
              { label: 'Manage Promo Codes', desc: '6 active codes', path: '/promos' },
              { label: 'VIP Allocations', desc: `${stats.vipAllocated} / ${stats.vipTotal} allocated`, path: '/vip' },
              { label: 'Special Requests', desc: '3 new requests', path: '/requests' },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-center justify-between p-4 border border-gdd-black/5 rounded-sm hover:border-gold/30 hover:bg-gold/[0.02] transition-all group text-left"
              >
                <div>
                  <p className="font-equip text-sm text-gdd-black font-medium">{action.label}</p>
                  <p className="font-equip text-xs text-gdd-black/40 mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gdd-black/20 group-hover:text-gold transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={8}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gdd-black/5">
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Recent Bookings</h3>
          <button onClick={() => navigate('/bookings')} className="font-equip text-xs text-gold hover:text-gold-deep transition-colors">
            View all
          </button>
        </div>
        <DataTable columns={recentColumns} data={recentBookings} onRowClick={(row) => navigate('/bookings')} />
      </motion.div>
    </div>
  )
}
