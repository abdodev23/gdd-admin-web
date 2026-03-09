import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, MapPin, BedDouble } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const viewLabels = {
  pyramid: 'Pyramid View',
  nile: 'Nile View',
  city: 'City View',
}

const viewColors = {
  pyramid: 'bg-gold/10 text-gold-deep',
  nile: 'bg-status-blue/10 text-status-blue',
  city: 'bg-gdd-black/5 text-gdd-black/50',
}

const emptyForm = {
  name: '',
  stars: 5,
  pricePerNight: '',
  view: 'city',
  totalRooms: '',
  bookedRooms: 0,
  cancellationPolicy: '',
  amenities: '',
  description: '',
  image: '/images/dance/MEL_4520.jpg',
}

export default function HotelsPage() {
  const { hotels, updateItem, addItem } = useDataStore()
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  const openEdit = (hotel) => {
    setSelectedHotel(hotel)
    setForm({
      name: hotel.name,
      stars: hotel.stars,
      pricePerNight: hotel.pricePerNight,
      view: hotel.view,
      totalRooms: hotel.totalRooms,
      bookedRooms: hotel.bookedRooms,
      cancellationPolicy: hotel.cancellationPolicy,
      amenities: hotel.amenities.join(', '),
      description: hotel.description,
      image: hotel.image,
    })
  }

  const openAdd = () => {
    setShowAddModal(true)
    setForm({ ...emptyForm })
  }

  const handleSave = () => {
    const data = {
      name: form.name,
      stars: parseInt(form.stars, 10),
      pricePerNight: parseFloat(form.pricePerNight),
      view: form.view,
      totalRooms: parseInt(form.totalRooms, 10),
      cancellationPolicy: form.cancellationPolicy,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
      image: form.image,
    }

    if (selectedHotel) {
      updateItem('hotels', selectedHotel.id, data)
      setSelectedHotel(null)
    } else if (showAddModal) {
      addItem('hotels', {
        ...data,
        bookedRooms: 0,
        currency: 'USD',
        availableDateRanges: [{ from: '2026-10-01', to: '2026-11-30' }],
      })
      setShowAddModal(false)
    }
  }

  const isModalOpen = !!selectedHotel || showAddModal

  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle={`${hotels.length} partner hotels`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Hotel
          </button>
        }
      />

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {hotels.map((hotel, i) => {
          const occupancy =
            hotel.totalRooms > 0
              ? Math.round((hotel.bookedRooms / hotel.totalRooms) * 100)
              : 0

          return (
            <motion.div
              key={hotel.id}
              className="bg-white rounded-sm shadow-sm overflow-hidden cursor-pointer group"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              onClick={() => openEdit(hotel)}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
                      viewColors[hotel.view]
                    )}
                  >
                    {viewLabels[hotel.view]}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Name + Stars */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medino text-lg text-gdd-black leading-tight">
                    {hotel.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: hotel.stars }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-3.5 h-3.5 text-gold fill-gold"
                    />
                  ))}
                  <span className="font-equip text-xs text-gdd-black/40 ml-1">
                    {hotel.stars}-star
                  </span>
                </div>

                {/* Price */}
                <p className="font-medino text-xl text-gdd-black mb-3">
                  {formatCurrency(hotel.pricePerNight)}
                  <span className="font-equip text-xs text-gdd-black/40 ml-1">
                    / night
                  </span>
                </p>

                {/* Room Availability */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-gdd-black/30" />
                      <span className="font-equip text-xs text-gdd-black/50">
                        {hotel.bookedRooms} / {hotel.totalRooms} rooms booked
                      </span>
                    </div>
                    <span className="font-equip text-xs text-gdd-black/40">
                      {occupancy}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hotel.amenities.slice(0, 5).map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex px-2 py-0.5 bg-sand-light/50 rounded-sm font-equip text-[10px] text-gdd-black/50"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 5 && (
                    <span className="inline-flex px-2 py-0.5 bg-sand-light/50 rounded-sm font-equip text-[10px] text-gdd-black/50">
                      +{hotel.amenities.length - 5} more
                    </span>
                  )}
                </div>

                {/* Cancellation */}
                <p className="font-equip text-[10px] text-gdd-black/40">
                  {hotel.cancellationPolicy}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedHotel(null)
          setShowAddModal(false)
        }}
        title={selectedHotel ? `Edit ${selectedHotel.name}` : 'Add Hotel'}
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Hotel Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stars">
              <select
                value={form.stars}
                onChange={(e) =>
                  setForm({ ...form, stars: parseInt(e.target.value, 10) })
                }
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {[3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Price per Night ($)">
              <input
                type="number"
                value={form.pricePerNight}
                onChange={(e) =>
                  setForm({ ...form, pricePerNight: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="View">
              <select
                value={form.view}
                onChange={(e) => setForm({ ...form, view: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="pyramid">Pyramid View</option>
                <option value="nile">Nile View</option>
                <option value="city">City View</option>
              </select>
            </FormField>
            <FormField label="Total Rooms">
              <input
                type="number"
                value={form.totalRooms}
                onChange={(e) =>
                  setForm({ ...form, totalRooms: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
          </div>
          <FormField label="Cancellation Policy">
            <input
              type="text"
              value={form.cancellationPolicy}
              onChange={(e) =>
                setForm({ ...form, cancellationPolicy: e.target.value })
              }
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Amenities (comma-separated)">
            <textarea
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedHotel(null)
                setShowAddModal(false)
              }}
              className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              {selectedHotel ? 'Save Changes' : 'Add Hotel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
