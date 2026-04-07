import { motion } from 'framer-motion'
import { DollarSign, Users, Ticket, BarChart3, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import StatsCard from '@/components/ui/StatsCard'
import { useDashboardStats } from '@/api/hooks/useDashboard'
import { formatCurrency } from '@/utils/formatCurrency'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

// Charts are still placeholder data — Phase 5 swaps these for real aggregations
const placeholderRevenueData = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
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
  const { data: stats, isLoading } = useDashboardStats()

  // Real seat occupancy from backend
  const seatStats = stats?.seats || { available: 0, held: 0, sold: 0, reserved: 0 }
  const totalSeats = seatStats.available + seatStats.held + seatStats.sold + seatStats.reserved
  const occupancyPct = totalSeats > 0
    ? Math.round(((seatStats.sold + seatStats.reserved) / totalSeats) * 100)
    : 0

  // Pie chart from real seat data, grouped by status
  const seatChartData = [
    { name: 'Sold',     value: seatStats.sold,     fill: '#D4985A' },
    { name: 'Held',     value: seatStats.held,     fill: '#A25723' },
    { name: 'Reserved', value: seatStats.reserved, fill: '#C5A44E' },
    { name: 'Available', value: seatStats.available, fill: '#CCBEAA' },
  ].filter((d) => d.value > 0)

  // Bookings-by-status bar chart from real counts
  const bookingsBars = stats ? [
    { tier: 'Confirmed', count: stats.bookings.confirmed, fill: '#22c55e' },
    { tier: 'Pending',   count: stats.bookings.pending,   fill: '#D4985A' },
    { tier: 'Cancelled', count: stats.bookings.cancelled, fill: '#ef4444' },
  ] : []

  return (
    <div>
      {/* Stats Row — real data from /api/analytics/dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={isLoading ? '—' : formatCurrency(stats?.revenue?.total || 0)}
          index={0}
        />
        <StatsCard
          icon={Users}
          label="Total Bookings"
          value={isLoading ? '—' : (stats?.bookings?.total ?? 0)}
          index={1}
        />
        <StatsCard
          icon={Ticket}
          label="Tickets Sold"
          value={isLoading ? '—' : (stats?.ticketsSold ?? 0)}
          index={2}
        />
        <StatsCard
          icon={BarChart3}
          label="Seat Occupancy"
          value={isLoading ? '—' : `${occupancyPct}%`}
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Revenue Trend (placeholder until Phase 5) */}
        <motion.div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Revenue Trend</h3>
            <span className="font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/30">Coming in Phase 5</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={placeholderRevenueData}>
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

        {/* Bookings by Status — real data */}
        <motion.div className="bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={5}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsBars} barSize={32}>
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
                {bookingsBars.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Seat status pie + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <motion.div className="bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={6}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Seat Status</h3>
          {seatChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={seatChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {seatChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-gdd-black text-white px-3 py-2 rounded-sm shadow-lg">
                        <p className="font-equip text-xs text-white/60">{d.name}</p>
                        <p className="font-equip font-medium text-sm">{d.value.toLocaleString()}</p>
                      </div>
                    )
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {seatChartData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="font-equip text-[10px] text-gdd-black/40">{s.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="font-equip text-xs text-gdd-black/30 text-center py-12">No seat data yet</p>
          )}
        </motion.div>

        <motion.div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={7}>
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'View Bookings',     desc: `${stats?.bookings?.pending || 0} pending`,           path: '/bookings' },
              { label: 'Manage Promos',     desc: 'Active codes',                                       path: '/promos' },
              { label: 'VIP Allocations',   desc: 'Manage VIP guests',                                  path: '/vip' },
              { label: 'Special Requests',  desc: 'Customer requests',                                  path: '/requests' },
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

      {/* Recent Bookings — placeholder until Phase 3 */}
      <motion.div className="bg-white rounded-sm shadow-sm p-6" variants={fadeUp} initial="hidden" animate="visible" custom={8}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Recent Bookings</h3>
          <span className="font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/30">Wired in Phase 3</span>
        </div>
        <p className="font-equip text-xs text-gdd-black/30 text-center py-8">
          The bookings table will appear here once Phase 3 wires the bookings API.
        </p>
      </motion.div>
    </div>
  )
}
