import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import Modal from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import { Grid3X3, Users, Lock, Unlock } from 'lucide-react'
import { useAllSeats, useUpdateSeat } from '@/api/hooks/useSeats'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const sectionOrder = ['vip', 'vvip', 'general']

const sectionColors = {
  general: { available: 'bg-sand hover:bg-sand/80', solid: 'bg-sand', label: 'General' },
  vip:     { available: 'bg-gold hover:bg-gold/80', solid: 'bg-gold', label: 'Premium' },
  vvip:    { available: 'bg-gold-deep hover:bg-gold-deep/80', solid: 'bg-gold-deep', label: 'VVIP' },
}

const sectionBlockConfig = {
  vip: {
    seatsPerBlock: [10, 10, 10],
    rowGroups: [['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']],
  },
  vvip: {
    seatsPerBlock: [10, 10, 10],
    rowGroups: [['A', 'B', 'C', 'D', 'E']],
  },
  general: {
    seatsPerBlock: [10, 17, 17, 13],
    gapTypes: ['stairs', 'aisle', 'aisle'],
    rowGroups: [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'J'],
      ['K', 'L', 'M', 'N', 'O'],
      ['P', 'Q', 'R', 'S', 'T'],
    ],
  },
}

function splitIntoBlocks(seats, seatsPerBlock) {
  const blocks = []
  let offset = 0
  for (const count of seatsPerBlock) {
    blocks.push(seats.slice(offset, offset + count))
    offset += count
  }
  return blocks
}

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved',  label: 'Reserved (admin block)' },
  { value: 'sold',      label: 'Sold' },
]

export default function SeatingPage() {
  const { data: seats, isLoading, isError, refetch } = useAllSeats()
  const updateSeat = useUpdateSeat()

  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [overrideSeat, setOverrideSeat] = useState(null)
  const [overrideStatus, setOverrideStatus] = useState('available')

  // Group seats by section, then by row, sorted by number
  const sectionRows = useMemo(() => {
    const result = {}
    if (!seats) return result
    sectionOrder.forEach((sectionId) => {
      const sectionSeats = seats.filter((s) => s.section === sectionId)
      const rows = {}
      sectionSeats.forEach((seat) => {
        if (!rows[seat.row]) rows[seat.row] = []
        rows[seat.row].push(seat)
      })
      Object.keys(rows).forEach((r) => rows[r].sort((a, b) => a.number - b.number))
      result[sectionId] = rows
    })
    return result
  }, [seats])

  // Stats across all seats
  const stats = useMemo(() => {
    const result = { total: 0, sold: 0, held: 0, reserved: 0, available: 0, perSection: {} }
    if (!seats) return result
    seats.forEach((s) => {
      result.total++
      result[s.status === 'sold' ? 'sold'
        : s.status === 'held' ? 'held'
        : s.status === 'reserved' ? 'reserved'
        : 'available']++
      if (!result.perSection[s.section]) {
        result.perSection[s.section] = { total: 0, sold: 0, held: 0, reserved: 0, available: 0 }
      }
      const ps = result.perSection[s.section]
      ps.total++
      ps[s.status === 'sold' ? 'sold'
        : s.status === 'held' ? 'held'
        : s.status === 'reserved' ? 'reserved'
        : 'available']++
    })
    return result
  }, [seats])

  const handleSeatClick = (seat) => {
    setOverrideSeat(seat)
    setOverrideStatus(seat.status === 'held' ? 'available' : seat.status)
  }

  const handleMouseEnter = (seat, e) => {
    setHoveredSeat(seat)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  const handleOverrideSave = () => {
    if (!overrideSeat) return
    const patch = { status: overrideStatus }
    // Releasing back to available — clear all hold/booking pointers
    if (overrideStatus === 'available') {
      patch.heldBy = null
      patch.heldByGuest = null
      patch.heldUntil = null
      patch.bookingId = null
    }
    updateSeat.mutate(
      { seatId: overrideSeat.seatId, ...patch },
      { onSuccess: () => setOverrideSeat(null) }
    )
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Seating" subtitle="Manage seat assignments and availability" />
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Seating" subtitle="Manage seat assignments and availability" />
        <div className="py-16 text-center bg-white rounded-sm shadow-sm">
          <p className="font-equip text-sm text-red-500 mb-3">Failed to load seats.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Seating" subtitle="Manage seat assignments and availability" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatsCard icon={Grid3X3} label="Total Seats" value={stats.total} index={0} />
        <StatsCard icon={Users} label="Sold" value={stats.sold} index={1} />
        <StatsCard icon={Lock} label="Reserved" value={stats.reserved} index={2} />
        <StatsCard icon={Lock} label="Held" value={stats.held} index={3} />
        <StatsCard icon={Unlock} label="Available" value={stats.available} index={4} />
      </div>

      {/* Section Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {sectionOrder.map((sectionId, i) => {
          const colors = sectionColors[sectionId]
          const ps = stats.perSection[sectionId] || { total: 0, sold: 0, held: 0, reserved: 0, available: 0 }
          return (
            <motion.div
              key={sectionId}
              className="bg-white rounded-sm shadow-sm p-5"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-3 h-3 rounded-sm', colors.solid)} />
                <h3 className="font-equip font-medium text-lg text-gdd-black">{colors.label}</h3>
                <span className="font-equip text-xs text-gdd-black/40 ml-auto">{ps.total} seats</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Stat label="Sold" value={ps.sold} />
                <Stat label="Held" value={ps.held} />
                <Stat label="Resv." value={ps.reserved} />
                <Stat label="Avail." value={ps.available} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-sm shadow-sm p-4 mb-6 flex items-center gap-3">
        <Lock className="w-4 h-4 text-gold" />
        <p className="font-equip text-xs text-gdd-black/60">
          Click any seat to <span className="font-medium text-gdd-black">override</span> its status. Release a guest hold, manually reserve, or mark as sold.
        </p>
      </div>

      {/* Seat Chart */}
      <motion.div
        className="bg-white rounded-sm shadow-sm p-6 overflow-x-auto"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
        style={{ '--seat-size': '0.625rem' }}
      >
        <div className="inline-flex flex-col items-center min-w-max px-4 sm:px-6 md:px-8 pb-4 sm:[--seat-size:0.75rem] md:[--seat-size:0.875rem] xl:[--seat-size:1rem]">
          {/* Legend */}
          <div className="mb-6 pb-4 border-b border-gdd-black/5 flex flex-wrap items-center justify-center gap-3 sm:gap-4" style={{ width: 'calc(30 * (var(--seat-size) + 3px) - 3px + 2 * (1.25rem) + 2rem)' }}>
            {sectionOrder.map((sectionId) => (
              <div key={sectionId} className="flex items-center gap-2">
                <div className={cn('w-4 h-4 rounded-sm', sectionColors[sectionId].solid)} />
                <span className="font-equip text-xs text-gdd-black/50">{sectionColors[sectionId].label}</span>
              </div>
            ))}
            <LegendDot color="bg-gdd-black/15" label="Sold" />
            <LegendDot color="bg-amber-400" label="Held (guest)" />
            <LegendDot color="bg-blue-500" label="Reserved" />
          </div>

          {/* Stage */}
          <div className="mb-6" style={{ width: 'calc(30 * (var(--seat-size) + 3px) - 3px + 2 * (1.25rem) + 2rem)' }}>
            <div className="w-full bg-gdd-black text-white py-2 sm:py-2.5 rounded-t-full text-center">
              <span className="font-equip text-[10px] tracking-widest-plus uppercase">Stage</span>
            </div>
          </div>

          {/* All Sections */}
          <div className="space-y-10 flex flex-col items-center">
            {sectionOrder.map((sectionId) => {
              const rowMap = sectionRows[sectionId] || {}
              const colors = sectionColors[sectionId]
              const blockConfig = sectionBlockConfig[sectionId]
              const isGeneral = sectionId === 'general'
              const sectionTotal = stats.perSection[sectionId]?.total || 0

              return (
                <div key={sectionId} className="flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-4 self-start">
                    <div className={cn('w-3 h-3 rounded-sm', colors.solid)} />
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/60">
                      {colors.label} Section — {sectionTotal} seats
                    </span>
                  </div>

                  <div>
                    {blockConfig.rowGroups.map((group, gi) => (
                      <div key={gi}>
                        {gi > 0 && isGeneral && <div className="h-5" />}
                        <div className="space-y-1.5">
                          {group.map((rowLabel) => {
                            const rowSeats = rowMap[rowLabel] || []
                            const blocks = splitIntoBlocks(rowSeats, blockConfig.seatsPerBlock)
                            return (
                              <div key={rowLabel} className="flex items-center gap-1">
                                <span className="font-equip text-[8px] sm:text-[10px] text-gdd-black/40 w-5 sm:w-8 text-right shrink-0">
                                  {rowLabel}
                                </span>
                                <div className="flex items-center">
                                  {blocks.map((blockSeats, bi) => (
                                    <div key={bi} className="flex items-center">
                                      {bi > 0 && (
                                        <div className={cn(
                                          'shrink-0 flex items-center justify-center',
                                          blockConfig.gapTypes?.[bi - 1] === 'stairs'
                                            ? 'w-4 sm:w-6 md:w-8 xl:w-10'
                                            : 'w-2 sm:w-3 md:w-4 xl:w-5'
                                        )}>
                                          {blockConfig.gapTypes?.[bi - 1] === 'stairs' && (
                                            <div className="w-px h-5 bg-gdd-black/15" />
                                          )}
                                        </div>
                                      )}
                                      <div className="flex gap-0.75">
                                        {blockSeats.map((seat) => {
                                          const isSold = seat.status === 'sold'
                                          const isReserved = seat.status === 'reserved'
                                          const isHeld = seat.status === 'held'
                                          return (
                                            <button
                                              key={seat.seatId}
                                              className={cn(
                                                'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 rounded-sm transition-all duration-200 cursor-pointer',
                                                isSold && 'bg-gdd-black/15 hover:bg-gdd-black/25',
                                                isReserved && 'bg-blue-500 hover:bg-blue-400',
                                                isHeld && 'bg-amber-400 hover:bg-amber-300',
                                                !isSold && !isReserved && !isHeld && colors.available,
                                              )}
                                              onClick={() => handleSeatClick(seat)}
                                              onMouseEnter={(e) => handleMouseEnter(seat, e)}
                                              onMouseLeave={() => setHoveredSeat(null)}
                                              aria-label={`${colors.label} — Row ${seat.row}, Seat ${seat.number} (${seat.status})`}
                                            />
                                          )
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <span className="font-equip text-[8px] sm:text-[10px] text-gdd-black/40 w-5 sm:w-8 shrink-0">
                                  {rowLabel}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      {hoveredSeat && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-gdd-black text-white px-3 py-2 rounded shadow-lg">
            <p className="font-equip text-xs whitespace-nowrap">
              {sectionColors[hoveredSeat.section]?.label} — Row {hoveredSeat.row}, Seat {hoveredSeat.number}
              <span className="ml-2 opacity-70">({hoveredSeat.status})</span>
            </p>
          </div>
        </div>
      )}

      {/* Override Modal */}
      <Modal isOpen={!!overrideSeat} onClose={() => setOverrideSeat(null)} title="Seat Override">
        {overrideSeat && (
          <div className="space-y-4">
            <div className="bg-sand-light/40 px-4 py-3 rounded-sm">
              <p className="font-equip text-sm text-gdd-black">
                {sectionColors[overrideSeat.section]?.label} — Row {overrideSeat.row}, Seat {overrideSeat.number}
              </p>
              <p className="font-equip text-[10px] text-gdd-black/40 uppercase tracking-widest-plus mt-1">
                Current status: {overrideSeat.status}
                {overrideSeat.heldUntil && ` · Held until ${new Date(overrideSeat.heldUntil).toLocaleTimeString()}`}
                {overrideSeat.bookingId && ` · Linked to booking`}
              </p>
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                New Status
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {overrideSeat.status === 'held' && (
                <p className="font-equip text-[10px] text-amber-600 mt-2">
                  This seat is currently held by a guest. Setting to "Available" will release the hold.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOverrideSeat(null)}
                className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSave}
                disabled={updateSeat.isPending}
                className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
              >
                {updateSeat.isPending ? 'Saving…' : 'Save Override'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center bg-sand-light/30 rounded-sm py-2">
      <p className="font-equip font-medium text-lg text-gdd-black">{value}</p>
      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">{label}</p>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-4 h-4 rounded-sm', color)} />
      <span className="font-equip text-xs text-gdd-black/50">{label}</span>
    </div>
  )
}
