import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const sections = [
  { id: 'vip', label: 'VVIP', total: 150, color: '#FFD700', rows: 10, seatsPerRow: 15, prefix: 'vvip' },
  { id: 'premium', label: 'Premium', total: 300, color: '#B8860B', rows: 15, seatsPerRow: 20, prefix: 'vip' },
  { id: 'general', label: 'General', total: 1140, color: '#C9A96E', rows: 30, seatsPerRow: 38, prefix: 'general' },
]

const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateSeats(section, bookings) {
  const seats = []
  const bookedSeatIds = new Set(bookings.map((b) => b.seatId))
  const tierMap = { vip: 'vip', premium: 'premium', general: 'general' }

  for (let r = 0; r < section.rows; r++) {
    for (let s = 1; s <= section.seatsPerRow; s++) {
      if (seats.length >= section.total) break
      const seatId = `${section.prefix}-${rowLabels[r]}-${s}`
      let status = 'available'
      if (bookedSeatIds.has(seatId)) {
        status = 'sold'
      } else if (
        section.id === 'vip' &&
        seats.filter((se) => se.status === 'reserved').length < 45
      ) {
        // Simulate some reserved seats for VIP
        if (Math.random() < 0.15 && status === 'available') {
          status = 'reserved'
        }
      }
      seats.push({ id: seatId, row: rowLabels[r], number: s, status })
    }
    if (seats.length >= section.total) break
  }
  return seats
}

export default function SeatingPage() {
  const { tickets, bookings } = useDataStore()
  const [selectedSection, setSelectedSection] = useState('vip')
  const [hoveredSeat, setHoveredSeat] = useState(null)

  const currentSection = sections.find((s) => s.id === selectedSection)

  const seats = useMemo(() => {
    if (!currentSection) return []
    return generateSeats(currentSection, bookings)
  }, [currentSection, bookings])

  const soldCount = seats.filter((s) => s.status === 'sold').length
  const reservedCount = seats.filter((s) => s.status === 'reserved').length
  const availableCount = seats.filter((s) => s.status === 'available').length

  const ticketData = tickets.reduce((acc, t) => {
    acc[t.tier] = t
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Seating"
        subtitle="Manage seat assignments and availability"
      />

      {/* Section Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {sections.map((section, i) => {
          const ticket = ticketData[section.id]
          const sold = ticket?.sold || 0
          const available = ticket?.available || 0
          const reserved = ticket?.reserved || 0

          return (
            <motion.div
              key={section.id}
              className="bg-white rounded-sm shadow-sm p-5"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <h3 className="font-equip font-medium text-lg text-gdd-black">
                  {section.label}
                </h3>
                <span className="font-equip text-xs text-gdd-black/40 ml-auto">
                  {section.total} seats
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{sold}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                    Sold
                  </p>
                </div>
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{reserved}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                    Reserved
                  </p>
                </div>
                <div className="text-center bg-sand-light/30 rounded-sm py-2">
                  <p className="font-equip font-medium text-lg text-gdd-black">{available}</p>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                    Available
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white rounded-sm shadow-sm p-1 w-fit">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={cn(
              'px-5 py-2 font-equip text-xs font-medium uppercase tracking-widest-plus rounded-sm transition-all',
              selectedSection === section.id
                ? 'bg-gdd-black text-white'
                : 'text-gdd-black/40 hover:text-gdd-black/70'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: currentSection.color, opacity: 0.2 }}
          />
          <span className="font-equip text-xs text-gdd-black/50">
            Available ({availableCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: currentSection.color }}
          />
          <span className="font-equip text-xs text-gdd-black/50">
            Sold ({soldCount})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-status-blue" />
          <span className="font-equip text-xs text-gdd-black/50">
            Reserved ({reservedCount})
          </span>
        </div>
      </div>

      {/* Seat Grid */}
      <motion.div
        className="bg-white rounded-sm shadow-sm p-6 overflow-x-auto"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        {/* Stage indicator */}
        <div className="flex justify-center mb-6">
          <div className="px-16 py-2 bg-gdd-black/5 rounded-full">
            <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30">
              Stage
            </span>
          </div>
        </div>

        <div
          className="grid gap-1 justify-center relative"
          style={{
            gridTemplateColumns: `repeat(${currentSection.seatsPerRow}, minmax(0, 1fr))`,
            maxWidth: currentSection.seatsPerRow * 20 + 'px',
            margin: '0 auto',
          }}
        >
          {seats.map((seat) => {
            const isHovered = hoveredSeat?.id === seat.id
            let bgStyle = {}
            if (seat.status === 'available') {
              bgStyle.backgroundColor = currentSection.color
              bgStyle.opacity = 0.2
            } else if (seat.status === 'sold') {
              bgStyle.backgroundColor = currentSection.color
            }

            return (
              <div
                key={seat.id}
                className="relative"
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-125',
                    seat.status === 'reserved' && 'bg-status-blue'
                  )}
                  style={bgStyle}
                />
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gdd-black text-white rounded-sm shadow-lg whitespace-nowrap pointer-events-none">
                    <p className="font-equip text-xs font-medium">{seat.id}</p>
                    <p className="font-equip text-[10px] text-white/60 capitalize">
                      {seat.status}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
