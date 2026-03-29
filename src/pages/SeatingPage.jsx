import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import { cn } from '@/utils/cn'
import { Grid3X3, Users, Lock, Unlock, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

// Matches user-web layout exactly
const sectionOrder = ['vip', 'vvip', 'general']

const sectionColors = {
  general: { available: 'bg-sand hover:bg-sand/80', solid: 'bg-sand', label: 'General' },
  vip: { available: 'bg-gold hover:bg-gold/80', solid: 'bg-gold', label: 'Premium' },
  vvip: { available: 'bg-gold-deep hover:bg-gold-deep/80', solid: 'bg-gold-deep', label: 'VVIP' },
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

export default function SeatingPage() {
  const { seatingData, toggleSeatReservation } = useDataStore()
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Group seats by row for each section
  const sectionRows = useMemo(() => {
    const result = {}
    sectionOrder.forEach((sectionId) => {
      const section = seatingData?.[sectionId]
      if (!section) return
      const rows = {}
      section.seats.forEach((seat) => {
        if (!rows[seat.row]) rows[seat.row] = []
        rows[seat.row].push(seat)
      })
      result[sectionId] = Object.fromEntries(Object.entries(rows))
    })
    return result
  }, [seatingData])

  // Collect all reserved seats
  const reservedSeats = useMemo(() => {
    const reserved = []
    sectionOrder.forEach((sectionId) => {
      const section = seatingData?.[sectionId]
      if (!section) return
      section.seats.forEach((seat) => {
        if (seat.status === 'reserved') {
          reserved.push({ ...seat, sectionLabel: sectionColors[sectionId].label })
        }
      })
    })
    return reserved
  }, [seatingData])

  // Compute stats
  const stats = useMemo(() => {
    const result = { totalSold: 0, totalReserved: 0, totalAvailable: 0, total: 0 }
    sectionOrder.forEach((sectionId) => {
      const section = seatingData?.[sectionId]
      if (!section) return
      section.seats.forEach((seat) => {
        if (seat.status === 'sold') result.totalSold++
        else if (seat.status === 'reserved') result.totalReserved++
        else result.totalAvailable++
        result.total++
      })
    })
    return result
  }, [seatingData])

  const [panelOpen, setPanelOpen] = useState(true)

  const handleSeatClick = (seat) => {
    if (seat.status === 'sold') return
    toggleSeatReservation(seat.id)
  }

  const handleMouseEnter = (seat, e) => {
    setHoveredSeat(seat)
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  if (!seatingData) return null

  return (
    <div>
      <PageHeader
        title="Seating"
        subtitle="Manage seat assignments and availability"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Grid3X3} label="Total Seats" value={stats.total} index={0} />
        <StatsCard icon={Users} label="Sold" value={stats.totalSold} index={1} />
        <StatsCard icon={Lock} label="Reserved" value={stats.totalReserved} index={2} />
        <StatsCard icon={Unlock} label="Available" value={stats.totalAvailable} index={3} />
      </div>

      {/* Section Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {sectionOrder.map((sectionId, i) => {
          const section = seatingData[sectionId]
          if (!section) return null
          const colors = sectionColors[sectionId]
          const sold = section.seats.filter((s) => s.status === 'sold').length
          const reserved = section.seats.filter((s) => s.status === 'reserved').length
          const available = section.seats.filter((s) => s.status === 'available').length

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
                <span className="font-equip text-xs text-gdd-black/40 ml-auto">{section.totalSeats} seats</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{sold}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Sold</p>
                </div>
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{reserved}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Reserved</p>
                </div>
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{available}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Available</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-sm shadow-sm p-4 mb-6 flex items-center gap-3">
        <Lock className="w-4 h-4 text-gold" />
        <p className="font-equip text-xs text-gdd-black/60">
          Click any available seat to <span className="font-medium text-gdd-black">reserve</span> it. Click a reserved seat to <span className="font-medium text-gdd-black">release</span> it. Sold seats cannot be changed.
        </p>
      </div>

      {/* Seat Chart — matches user-web layout */}
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gdd-black/10" />
              <span className="font-equip text-xs text-gdd-black/50">Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-500" />
              <span className="font-equip text-xs text-gdd-black/50">Reserved</span>
            </div>
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
              const section = seatingData[sectionId]
              if (!section) return null
              const rowMap = sectionRows[sectionId] || {}
              const colors = sectionColors[sectionId]
              const blockConfig = sectionBlockConfig[sectionId]
              const isGeneral = sectionId === 'general'

              return (
                <div key={sectionId} className="flex flex-col items-center">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-4 self-start">
                    <div className={cn('w-3 h-3 rounded-sm', colors.solid)} />
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/60">
                      {colors.label} Section — {section.totalSeats} seats
                    </span>
                  </div>

                  {/* Seats Grid */}
                  <div>
                    {blockConfig.rowGroups.map((group, gi) => (
                      <div key={gi}>
                        {gi > 0 && isGeneral && <div className="h-5" />}
                        <div className="space-y-1.5">
                          {group.map((rowLabel) => {
                            const seats = rowMap[rowLabel] || []
                            const blocks = splitIntoBlocks(seats, blockConfig.seatsPerBlock)
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
                                          return (
                                            <button
                                              key={seat.id}
                                              className={cn(
                                                'w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 rounded-sm transition-all duration-200',
                                                isSold && 'bg-gdd-black/10 cursor-not-allowed',
                                                isReserved && 'bg-blue-500 hover:bg-blue-400 cursor-pointer',
                                                !isSold && !isReserved && colors.available,
                                                !isSold && !isReserved && 'cursor-pointer',
                                              )}
                                              disabled={isSold}
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

      {/* Floating Reserved Seats Panel */}
      <div className="fixed right-6 top-24 bottom-6 w-72 z-30 pointer-events-none">
        <div className="pointer-events-auto h-full flex flex-col">
          {/* Toggle Button */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className={cn(
              'self-end mb-2 flex items-center gap-2 px-3 py-2 rounded-sm font-equip text-xs uppercase tracking-widest-plus transition-colors shadow-md',
              reservedSeats.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gdd-black/60 hover:bg-sand-light border border-gdd-black/10'
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            {reservedSeats.length} Reserved
          </button>

          {/* Panel */}
          <AnimatePresence>
            {panelOpen && reservedSeats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gdd-black/10 rounded-sm shadow-lg flex-1 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-gdd-black/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-equip text-sm font-medium text-gdd-black">Reserved Seats</h3>
                    <p className="font-equip text-[10px] text-gdd-black/40 mt-0.5">{reservedSeats.length} seat{reservedSeats.length !== 1 ? 's' : ''} reserved</p>
                  </div>
                  <button onClick={() => setPanelOpen(false)} className="text-gdd-black/30 hover:text-gdd-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  {reservedSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center">
                          <span className="font-equip text-[8px] font-medium text-white">{seat.row}{seat.number}</span>
                        </div>
                        <div>
                          <p className="font-equip text-xs text-gdd-black font-medium">
                            Row {seat.row}, Seat {seat.number}
                          </p>
                          <p className="font-equip text-[10px] text-gdd-black/40">{seat.sectionLabel}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSeatReservation(seat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-500 hover:bg-red-50 rounded-sm"
                        title="Release this seat"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gdd-black/5">
                  <button
                    className="w-full px-4 py-2.5 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
                  >
                    Confirm Reservations
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSeat && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-gdd-black text-white px-3 py-2 rounded shadow-lg">
            <p className="font-equip text-xs whitespace-nowrap">
              {sectionColors[hoveredSeat.section]?.label} — Row {hoveredSeat.row}, Seat {hoveredSeat.number}
              {hoveredSeat.status === 'sold' && <span className="text-red-400 ml-2">Sold</span>}
              {hoveredSeat.status === 'reserved' && <span className="text-blue-400 ml-2">Reserved</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
