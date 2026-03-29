import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Edit3, Users, DollarSign, MapPin, Calendar, Clock,
  Ship, ChevronDown, ChevronUp, Star, Package,
} from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import StatsCard from '@/components/ui/StatsCard'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const LABEL = 'block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5'
const INPUT = 'w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold'

const categories = [
  { key: 'all', label: 'All Packages' },
  { key: 'main-group', label: 'Main Group' },
  { key: 'post-event', label: 'Post Event' },
  { key: 'nile-cruise', label: 'Nile Cruise 4NT' },
  { key: 'nile-cruise-luxor', label: 'Cruise + Luxor' },
  { key: 'cruise-3nt', label: '3NT Cruise' },
]

// ─── Hotel Pricing Table ───
function HotelPricingTable({ hotelVariants, itineraryHotels }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gdd-black/10">
            <th className="py-2 pr-4 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Hotel</th>
            <th className="py-2 pr-4 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Room Type</th>
            <th className="py-2 pr-4 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 text-right">PP / DBL</th>
            <th className="py-2 pr-4 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 text-right">SGL Supp</th>
            <th className="py-2 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 text-right">SAKK</th>
          </tr>
        </thead>
        <tbody>
          {hotelVariants.map((hv) => {
            const hotel = itineraryHotels.find((h) => h.id === hv.hotelId)
            if (!hotel) return null
            return (
              <tr key={hv.hotelId} className="border-b border-gdd-black/5 last:border-0">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-equip text-sm text-gdd-black">{hotel.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-4 font-equip text-sm text-gdd-black/60">{hotel.roomType}</td>
                <td className="py-2.5 pr-4 font-equip text-sm font-medium text-gdd-black text-right">{formatCurrency(hv.total)}</td>
                <td className="py-2.5 pr-4 font-equip text-sm text-gold-deep text-right">+{formatCurrency(hv.sglSupplement.total)}</td>
                <td className="py-2.5 font-equip text-sm text-gdd-black/40 text-right">{formatCurrency(hv.sakkHandling)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Day-by-Day Timeline ───
function DayTimeline({ dayByDay, sakkHandling, total }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-3 bottom-3 w-px bg-gold/20" />
      {dayByDay.map((day, idx) => (
        <div key={idx} className="relative mb-4 last:mb-0">
          <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <span className="font-equip text-[10px] font-medium text-gold-deep">{day.day}</span>
          </div>
          <div>
            <h4 className="font-equip text-xs font-medium text-gdd-black/40 mb-1">DAY {day.day}</h4>
            <ul className="space-y-0.5">
              {day.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between font-equip text-xs leading-relaxed">
                  <span className="text-gdd-black/60">{item.service}</span>
                  <span className="text-gdd-black/80 font-medium ml-4">{formatCurrency(item.cost)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      {/* SAKK Handling & Total */}
      <div className="mt-3 pt-3 border-t border-gdd-black/10 space-y-1">
        <div className="flex items-center justify-between font-equip text-xs">
          <span className="text-gdd-black/50">SAKK HANDLING</span>
          <span className="text-gdd-black/70 font-medium">{formatCurrency(sakkHandling)}</span>
        </div>
        <div className="flex items-center justify-between font-equip text-sm font-medium">
          <span className="text-gdd-black">TOTAL</span>
          <span className="text-gold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── SGL Supplement Breakdown ───
function SglBreakdown({ sglSupplement }) {
  return (
    <div>
      <div className="space-y-0.5">
        {sglSupplement.breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between font-equip text-xs">
            <span className="text-gdd-black/50">{item.description}</span>
            <span className="text-gdd-black/70">{formatCurrency(item.cost)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between font-equip text-sm font-medium mt-1 pt-1 border-t border-gdd-black/10">
        <span className="text-gdd-black">SGL SUPPLEMENT TOTAL</span>
        <span className="text-gold-deep">+{formatCurrency(sglSupplement.total)}</span>
      </div>
    </div>
  )
}

// ─── Itinerary Card ───
function ItineraryCard({ itinerary, itineraryHotels, childrenPolicy, index, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const selectedVariant = itinerary.hotelVariants[selectedVariantIdx]

  return (
    <motion.div
      className="bg-white rounded-sm shadow-sm overflow-hidden"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      {/* Header */}
      <div className="p-6 border-b border-gdd-black/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medino text-lg text-gdd-black">{itinerary.name}</h3>
            <p className="font-equip text-sm text-gdd-black/50 mt-0.5">{itinerary.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={itinerary.status === 'active' ? 'confirmed' : 'pending'} />
            <button
              onClick={() => onEdit(itinerary)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-gdd-black/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-equip text-xs">{itinerary.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gdd-black/50">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-equip text-xs">{itinerary.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gdd-black/50">
            <Users className="w-3.5 h-3.5" />
            <span className="font-equip text-xs">{itinerary.totalBookings} bookings</span>
          </div>
          {itinerary.cruiseDetails && (
            <div className="flex items-center gap-1.5 text-gdd-black/50">
              <Ship className="w-3.5 h-3.5" />
              <span className="font-equip text-xs">{itinerary.cruiseDetails.vessel} — {itinerary.cruiseDetails.route}</span>
            </div>
          )}
        </div>

        {/* Starting Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">From</span>
          <span className="font-equip font-medium text-xl text-gold">
            {formatCurrency(Math.min(...itinerary.hotelVariants.map((hv) => hv.total)))}
          </span>
          <span className="font-equip text-xs text-gdd-black/40">per person in double ({itinerary.paxBasis})</span>
        </div>
      </div>

      {/* Hotel Pricing Table */}
      <div className="p-6 border-b border-gdd-black/5">
        <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
          Hotel Options & Pricing
        </h4>
        <HotelPricingTable hotelVariants={itinerary.hotelVariants} itineraryHotels={itineraryHotels} />
      </div>

      {/* Expandable Sections */}
      <div className="px-6 py-3 border-b border-gdd-black/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 font-equip text-xs font-medium text-gold-deep hover:text-gold transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Hide Details' : 'Show Day-by-Day, Inclusions & Policies'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Day-by-Day */}
            <div className="p-6 border-b border-gdd-black/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
                  Day-by-Day Itinerary
                </h4>
                {/* Hotel variant selector */}
                <select
                  value={selectedVariantIdx}
                  onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {itinerary.hotelVariants.map((hv, i) => {
                    const hotel = itineraryHotels.find((h) => h.id === hv.hotelId)
                    return (
                      <option key={i} value={i}>{hotel?.name} — {hotel?.roomType}</option>
                    )
                  })}
                </select>
              </div>
              <DayTimeline
                dayByDay={selectedVariant.dayByDay}
                sakkHandling={selectedVariant.sakkHandling}
                total={selectedVariant.total}
              />
              {/* SGL Supplement Breakdown */}
              <div className="mt-4 pt-4 border-t border-gdd-black/10">
                <h5 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                  Single Supplement Breakdown
                </h5>
                <SglBreakdown sglSupplement={selectedVariant.sglSupplement} />
              </div>
            </div>

            {/* Cruise Details */}
            {itinerary.cruiseDetails && (
              <div className="p-6 border-b border-gdd-black/5">
                <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Cruise Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-0.5">Vessel</p>
                    <p className="font-equip text-sm text-gdd-black">{itinerary.cruiseDetails.vessel}</p>
                  </div>
                  <div>
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-0.5">Route</p>
                    <p className="font-equip text-sm text-gdd-black">{itinerary.cruiseDetails.route}</p>
                  </div>
                  <div>
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-0.5">Board</p>
                    <p className="font-equip text-sm text-gdd-black">{itinerary.cruiseDetails.board}</p>
                  </div>
                  <div>
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-0.5">Domestic Flights</p>
                    <p className="font-equip text-sm text-gold-deep">{formatCurrency(itinerary.cruiseDetails.domesticFlightCost)} pp</p>
                  </div>
                </div>
                {itinerary.excursions && (
                  <div className="mt-4">
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-2">Cruise Excursions</p>
                    <div className="flex flex-wrap gap-2">
                      {itinerary.excursions.map((exc, i) => (
                        <span key={i} className="px-3 py-1 bg-gold/10 text-gold-deep font-equip text-xs rounded-full">
                          {exc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {itinerary.luxorHotel && (
                  <div className="mt-4 p-3 bg-sand-light/50 rounded-sm">
                    <p className="font-equip text-[10px] text-gdd-black/40 mb-1">Luxor Overnight Hotel</p>
                    <p className="font-equip text-sm text-gdd-black">
                      {itinerary.luxorHotel.name} — {itinerary.luxorHotel.roomType} — {formatCurrency(itinerary.luxorHotel.pricePerNight)}/night
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="p-6 border-b border-gdd-black/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                    Rates Include
                  </h4>
                  <div className="space-y-2">
                    {itinerary.includes.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="font-equip text-sm text-gdd-black/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                    Rates Do Not Include
                  </h4>
                  <div className="space-y-2">
                    {itinerary.excludes.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <span className="font-equip text-sm text-gdd-black/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Supplements */}
            {itinerary.hotelVariants.some((hv) => {
              const hotel = itineraryHotels.find((h) => h.id === hv.hotelId)
              return hotel?.roomSupplements?.length > 0
            }) && (
              <div className="p-6 border-b border-gdd-black/5">
                <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Room Supplements
                </h4>
                {itinerary.hotelVariants.map((hv) => {
                  const hotel = itineraryHotels.find((h) => h.id === hv.hotelId)
                  if (!hotel?.roomSupplements?.length) return null
                  return (
                    <div key={hv.hotelId} className="mb-3 last:mb-0">
                      <p className="font-equip text-xs font-medium text-gdd-black mb-1">{hotel.name}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {hotel.roomSupplements.map((sup, i) => (
                          <div key={i} className="px-3 py-2 bg-sand-light/50 rounded-sm">
                            <p className="font-equip text-[10px] text-gdd-black/50">{sup.type}</p>
                            <p className="font-equip text-sm font-medium text-gdd-black">{formatCurrency(sup.perRoomPerNight)} / Room / Night</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Children Policy */}
            <div className="p-6">
              <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Children Policy
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {childrenPolicy.map((policy, i) => (
                  <div key={i} className="px-3 py-2 bg-sand-light/50 rounded-sm">
                    <p className="font-equip text-xs font-medium text-gdd-black">{policy.ageRange}</p>
                    <p className="font-equip text-[11px] text-gdd-black/60 mt-0.5">{policy.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ───
export default function ExperiencesPage() {
  const { bespokePackage, itineraries, itineraryHotels, childrenPolicy, updateItem } = useDataStore()
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ ...bespokePackage })
  const [editingItinerary, setEditingItinerary] = useState(null)
  const [itinForm, setItinForm] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  // Bespoke package handlers
  const handleOpen = () => {
    setForm({ ...bespokePackage })
    setEditOpen(true)
  }

  const handleSave = () => {
    updateItem('experiences', bespokePackage.id, {
      ...form,
      price: Number(form.price),
      totalBookings: Number(form.totalBookings),
    })
    setEditOpen(false)
  }

  // Itinerary edit handlers
  const handleItinEdit = (itinerary) => {
    setEditingItinerary(itinerary)
    setItinForm({
      name: itinerary.name,
      subtitle: itinerary.subtitle,
      status: itinerary.status,
      duration: itinerary.duration,
      location: itinerary.location,
      includes: itinerary.includes,
      excludes: itinerary.excludes,
      hotelVariants: JSON.parse(JSON.stringify(itinerary.hotelVariants)),
    })
  }

  const handleItinSave = () => {
    updateItem('itineraries', editingItinerary.id, {
      ...itinForm,
    })
    setEditingItinerary(null)
    setItinForm(null)
  }

  const updateVariantField = (variantIdx, field, value) => {
    setItinForm((prev) => {
      const variants = [...prev.hotelVariants]
      variants[variantIdx] = { ...variants[variantIdx], [field]: Number(value) || 0 }
      return { ...prev, hotelVariants: variants }
    })
  }

  const updateVariantItemCost = (variantIdx, dayIdx, itemIdx, value) => {
    setItinForm((prev) => {
      const variants = JSON.parse(JSON.stringify(prev.hotelVariants))
      variants[variantIdx].dayByDay[dayIdx].items[itemIdx].cost = Number(value) || 0
      return { ...prev, hotelVariants: variants }
    })
  }

  const filteredItineraries = activeCategory === 'all'
    ? itineraries
    : itineraries.filter((it) => it.category === activeCategory)

  const totalItinBookings = itineraries.reduce((sum, it) => sum + it.totalBookings, 0)
  const activeItineraries = itineraries.filter((it) => it.status === 'active').length

  const pkg = bespokePackage

  return (
    <div>
      <PageHeader
        title="Bespoke Experience"
        subtitle="Manage the flagship Pyramids & Pirouettes package"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Package}
          label="Total Packages"
          value={itineraries.length + 1}
          index={0}
        />
        <StatsCard
          icon={Users}
          label="Bespoke Bookings"
          value={pkg.totalBookings}
          index={1}
        />
        <StatsCard
          icon={Users}
          label="Itinerary Bookings"
          value={totalItinBookings}
          index={2}
        />
        <StatsCard
          icon={DollarSign}
          label="Active Itineraries"
          value={activeItineraries}
          index={3}
        />
      </div>

      {/* ─── Bespoke Package ─── */}
      <div className="mb-10">
        <h2 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">
          Flagship Bespoke Package
        </h2>
        <motion.div
          className="bg-white rounded-sm shadow-sm overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-2 h-64 lg:h-auto">
              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
            </div>
            <div className="lg:col-span-3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-medino text-xl text-gdd-black">{pkg.name}</h2>
                  <p className="font-equip font-medium text-2xl text-gold mt-1">{formatCurrency(pkg.price)}</p>
                </div>
                <button
                  onClick={handleOpen}
                  className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Package
                </button>
              </div>
              <p className="font-equip text-sm text-gdd-black/60 mb-6 leading-relaxed">{pkg.description}</p>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-gdd-black/50">
                  <Clock className="w-4 h-4" />
                  <span className="font-equip text-sm">{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gdd-black/50">
                  <MapPin className="w-4 h-4" />
                  <span className="font-equip text-sm">{pkg.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gdd-black/50">
                  <Calendar className="w-4 h-4" />
                  <span className="font-equip text-sm">{pkg.fixedCheckIn} — {pkg.fixedCheckOut}</span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Inclusions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.includes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <span className="font-equip text-sm text-gdd-black/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Highlights
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pkg.highlights.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-gold/10 text-gold-deep font-equip text-xs rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
                  Total Bookings
                </span>
                <StatusBadge status="confirmed" className="!text-xs !px-3 !py-1" />
                <span className="font-equip font-medium text-lg text-gdd-black">{pkg.totalBookings}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Itinerary Packages ─── */}
      <div>
        <h2 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-4">
          Itinerary Packages
        </h2>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'px-4 py-2 rounded-sm font-equip text-xs uppercase tracking-widest-plus transition-all duration-200',
                activeCategory === cat.key
                  ? 'bg-gdd-black text-white'
                  : 'bg-white text-gdd-black/50 hover:text-gdd-black hover:bg-sand-light/50 border border-gdd-black/10'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Itinerary Cards */}
        <div className="space-y-6">
          {filteredItineraries.map((itinerary, idx) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              itineraryHotels={itineraryHotels}
              childrenPolicy={childrenPolicy}
              index={idx}
              onEdit={handleItinEdit}
            />
          ))}
        </div>
      </div>

      {/* ─── Bespoke Edit Modal ─── */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Bespoke Package" size="lg">
        <div className="space-y-5">
          <div>
            <label className={LABEL}>Package Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Price (USD)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Duration</label>
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={INPUT} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={INPUT} />
            </div>
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Check-in Date</label>
              <input type="date" value={form.fixedCheckIn} onChange={(e) => setForm({ ...form, fixedCheckIn: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Check-out Date</label>
              <input type="date" value={form.fixedCheckOut} onChange={(e) => setForm({ ...form, fixedCheckOut: e.target.value })} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(INPUT, 'resize-none')} />
          </div>
          <div>
            <label className={LABEL}>Inclusions (one per line)</label>
            <textarea rows={4} value={form.includes?.join('\n')} onChange={(e) => setForm({ ...form, includes: e.target.value.split('\n').filter(Boolean) })} className={cn(INPUT, 'resize-none')} />
          </div>
          <div>
            <label className={LABEL}>Highlights (one per line)</label>
            <textarea rows={4} value={form.highlights?.join('\n')} onChange={(e) => setForm({ ...form, highlights: e.target.value.split('\n').filter(Boolean) })} className={cn(INPUT, 'resize-none')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditOpen(false)} className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Itinerary Edit Modal ─── */}
      <Modal
        isOpen={!!editingItinerary}
        onClose={() => { setEditingItinerary(null); setItinForm(null) }}
        title="Edit Itinerary Package"
        size="xl"
      >
        {itinForm && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Package Name</label>
                <input type="text" value={itinForm.name} onChange={(e) => setItinForm({ ...itinForm, name: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Subtitle</label>
                <input type="text" value={itinForm.subtitle} onChange={(e) => setItinForm({ ...itinForm, subtitle: e.target.value })} className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Status</label>
                <select value={itinForm.status} onChange={(e) => setItinForm({ ...itinForm, status: e.target.value })} className={INPUT}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Duration</label>
                <input type="text" value={itinForm.duration} onChange={(e) => setItinForm({ ...itinForm, duration: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Location</label>
                <input type="text" value={itinForm.location} onChange={(e) => setItinForm({ ...itinForm, location: e.target.value })} className={INPUT} />
              </div>
            </div>

            {/* Hotel Variants Pricing */}
            <div>
              <label className={LABEL}>Hotel Pricing Per Variant</label>
              <div className="space-y-4 mt-2">
                {itinForm.hotelVariants.map((hv, vIdx) => {
                  const hotel = itineraryHotels.find((h) => h.id === hv.hotelId)
                  return (
                    <div key={vIdx} className="border border-gdd-black/10 rounded-sm p-4">
                      <p className="font-equip text-xs font-medium text-gdd-black mb-3">{hotel?.name} — {hotel?.roomType}</p>

                      {/* Day-by-Day Costs */}
                      <div className="space-y-2 mb-3">
                        {hv.dayByDay.map((day, dIdx) => (
                          <div key={dIdx}>
                            <p className="font-equip text-[10px] text-gdd-black/40 mb-1">DAY {day.day}</p>
                            {day.items.map((item, iIdx) => (
                              <div key={iIdx} className="flex items-center gap-2 mb-1">
                                <span className="font-equip text-xs text-gdd-black/60 flex-1 min-w-0 truncate">{item.service}</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.cost}
                                  onChange={(e) => updateVariantItemCost(vIdx, dIdx, iIdx, e.target.value)}
                                  className="w-24 px-2 py-1 border border-gdd-black/10 rounded-sm font-equip text-xs text-right text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* SAKK & Total */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gdd-black/10">
                        <div>
                          <label className="font-equip text-[9px] text-gdd-black/40 uppercase">SAKK Handling</label>
                          <input type="number" value={hv.sakkHandling} onChange={(e) => updateVariantField(vIdx, 'sakkHandling', e.target.value)}
                            className="w-full px-2 py-1 border border-gdd-black/10 rounded-sm font-equip text-xs text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold" />
                        </div>
                        <div>
                          <label className="font-equip text-[9px] text-gdd-black/40 uppercase">Total PP/DBL</label>
                          <input type="number" value={hv.total} onChange={(e) => updateVariantField(vIdx, 'total', e.target.value)}
                            className="w-full px-2 py-1 border border-gdd-black/10 rounded-sm font-equip text-xs font-medium text-gold focus:outline-none focus:ring-1 focus:ring-gold" />
                        </div>
                        <div>
                          <label className="font-equip text-[9px] text-gdd-black/40 uppercase">SGL Supp Total</label>
                          <input type="number" value={hv.sglSupplement.total} onChange={(e) => {
                            setItinForm((prev) => {
                              const variants = JSON.parse(JSON.stringify(prev.hotelVariants))
                              variants[vIdx].sglSupplement.total = Number(e.target.value) || 0
                              return { ...prev, hotelVariants: variants }
                            })
                          }}
                            className="w-full px-2 py-1 border border-gdd-black/10 rounded-sm font-equip text-xs text-gold-deep focus:outline-none focus:ring-1 focus:ring-gold" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div>
              <label className={LABEL}>Inclusions (one per line)</label>
              <textarea rows={5} value={itinForm.includes?.join('\n')} onChange={(e) => setItinForm({ ...itinForm, includes: e.target.value.split('\n').filter(Boolean) })} className={cn(INPUT, 'resize-none')} />
            </div>
            <div>
              <label className={LABEL}>Exclusions (one per line)</label>
              <textarea rows={4} value={itinForm.excludes?.join('\n')} onChange={(e) => setItinForm({ ...itinForm, excludes: e.target.value.split('\n').filter(Boolean) })} className={cn(INPUT, 'resize-none')} />
            </div>

            <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white pb-1">
              <button
                onClick={() => { setEditingItinerary(null); setItinForm(null) }}
                className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleItinSave}
                className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
