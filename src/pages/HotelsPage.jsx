import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, BedDouble, Trash2, RotateCcw, PowerOff } from 'lucide-react'
import {
  useHotels,
  useCreateHotel,
  useUpdateHotel,
  useDeactivateHotel,
  useReactivateHotel,
  useDeleteHotel,
} from '@/api/hooks/useHotels'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import StatusFilter from '@/components/ui/StatusFilter'
import SearchInput from '@/components/ui/SearchInput'
import TagListInput from '@/components/ui/TagListInput'
import { IMAGE_PROFILES } from '@/data/imageProfiles'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 },
  }),
}

const viewLabels = { pyramid: 'Pyramid View', nile: 'Nile View', city: 'City View' }
const viewColors = {
  pyramid: 'bg-gold/10 text-gold-deep',
  nile:    'bg-status-blue/10 text-status-blue',
  city:    'bg-gdd-black/5 text-gdd-black/50',
}

const emptyRoom = {
  roomId:             '',
  name:               '',
  bedType:            '',
  capacity:           2,
  totalRooms:         1,
  bookedRooms:        0,
  supplementPerNight: 0,
  description:        '',
  sqm:                0,
}

const emptyAddon = {
  addonId:     '',
  name:        '',
  price:       0,
  description: '',
  icon:        '',
}

const emptyHotel = {
  hotelId:             '',
  name:                '',
  stars:               5,
  pricePerNight:       '',
  currency:            'USD',
  view:                'city',
  description:         '',
  cancellationPolicy:  '',
  amenities:           [],
  images:              [],
  rooms:               [],
  addons:              [],
  availableDateRanges: [],
}

export default function HotelsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')

  const { data, isLoading, isError } = useHotels({
    page,
    limit: 25,
    search: search || undefined,
    status,
  })
  const hotels = data?.data || []

  const createHotel     = useCreateHotel()
  const updateHotel     = useUpdateHotel()
  const deactivateHotel = useDeactivateHotel()
  const reactivateHotel = useReactivateHotel()
  const deleteHotel     = useDeleteHotel()

  const [selectedHotel, setSelectedHotel] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyHotel })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const openEdit = (hotel) => {
    setForm({
      hotelId:             hotel.hotelId || '',
      name:                hotel.name || '',
      stars:               hotel.stars || 5,
      pricePerNight:       hotel.pricePerNight ?? '',
      currency:            hotel.currency || 'USD',
      view:                hotel.view || 'city',
      description:         hotel.description || '',
      cancellationPolicy:  hotel.cancellationPolicy || '',
      amenities:           hotel.amenities || [],
      images:              hotel.images || [],
      rooms:               hotel.rooms || [],
      addons:              hotel.addons || [],
      availableDateRanges: hotel.availableDateRanges || [],
    })
    setSelectedHotel(hotel)
  }

  const openAdd = () => {
    setForm({ ...emptyHotel })
    setIsAdding(true)
  }

  const closeModal = () => {
    setSelectedHotel(null)
    setIsAdding(false)
  }

  const handleSave = () => {
    const payload = {
      hotelId:             form.hotelId.trim() || `hotel-${Date.now()}`,
      name:                form.name.trim(),
      stars:               Number(form.stars),
      pricePerNight:       Number(form.pricePerNight) || 0,
      currency:            form.currency || 'USD',
      view:                form.view,
      description:         form.description,
      cancellationPolicy:  form.cancellationPolicy,
      amenities:           form.amenities,
      images:              form.images,
      rooms:               form.rooms,
      addons:              form.addons,
      availableDateRanges: form.availableDateRanges.filter((r) => r.from && r.to),
    }
    if (isAdding) {
      createHotel.mutate(payload, { onSuccess: closeModal })
    } else {
      updateHotel.mutate({ id: selectedHotel._id, ...payload }, { onSuccess: closeModal })
    }
  }

  // Rooms subform helpers
  const addRoom = () => setForm((f) => ({ ...f, rooms: [...f.rooms, { ...emptyRoom, roomId: `room-${Date.now()}` }] }))
  const updateRoom = (idx, patch) => setForm((f) => ({
    ...f,
    rooms: f.rooms.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
  }))
  const removeRoom = (idx) => setForm((f) => ({ ...f, rooms: f.rooms.filter((_, i) => i !== idx) }))

  // Addons subform helpers
  const addAddon = () => setForm((f) => ({ ...f, addons: [...f.addons, { ...emptyAddon, addonId: `addon-${Date.now()}` }] }))
  const updateAddon = (idx, patch) => setForm((f) => ({
    ...f,
    addons: f.addons.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
  }))
  const removeAddon = (idx) => setForm((f) => ({ ...f, addons: f.addons.filter((_, i) => i !== idx) }))

  // Available date ranges subform helpers. The user web filters hotels by
  // date — if this list is empty, the hotel is treated as available year-round.
  const addDateRange = () => setForm((f) => ({
    ...f,
    availableDateRanges: [...f.availableDateRanges, { from: '', to: '' }],
  }))
  const updateDateRange = (idx, patch) => setForm((f) => ({
    ...f,
    availableDateRanges: f.availableDateRanges.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
  }))
  const removeDateRange = (idx) => setForm((f) => ({
    ...f,
    availableDateRanges: f.availableDateRanges.filter((_, i) => i !== idx),
  }))

  const isModalOpen = !!selectedHotel || isAdding

  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle={data ? `${data.total} partner hotels` : 'Loading…'}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search hotels..."
          className="flex-1"
        />
        <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load hotels.</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-sm">
          <p className="font-equip text-sm text-gdd-black/30">No hotels match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hotels.map((hotel, i) => {
            const totalRooms = (hotel.rooms || []).reduce((sum, r) => sum + (r.totalRooms || 0), 0)
            const bookedRooms = (hotel.rooms || []).reduce((sum, r) => sum + (r.bookedRooms || 0), 0)
            const occupancy = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0
            const isInactive = hotel.isActive === false

            return (
              <motion.div
                key={hotel._id}
                className={cn(
                  'bg-white rounded-sm shadow-sm overflow-hidden group relative',
                  isInactive && 'opacity-60'
                )}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                {isInactive && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-gdd-black/80 text-white font-equip text-[9px] tracking-widest-plus uppercase rounded-sm">
                    Inactive
                  </div>
                )}
                <div className="relative h-40 overflow-hidden bg-sand-light/50 cursor-pointer" onClick={() => openEdit(hotel)}>
                  {hotel.images?.[0] && (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full', viewColors[hotel.view])}>
                      {viewLabels[hotel.view] || hotel.view}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-medino text-lg text-gdd-black leading-tight mb-2 cursor-pointer" onClick={() => openEdit(hotel)}>{hotel.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: hotel.stars || 0 }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 text-gold fill-gold" />
                    ))}
                    <span className="font-equip text-xs text-gdd-black/40 ml-1">{hotel.stars}-star</span>
                  </div>

                  <p className="font-equip font-medium text-xl text-gdd-black mb-3">
                    {formatCurrency(hotel.pricePerNight)}
                    <span className="font-equip text-xs text-gdd-black/40 ml-1">/ night</span>
                  </p>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-gdd-black/30" />
                        <span className="font-equip text-xs text-gdd-black/50">
                          {(hotel.rooms || []).length} room types · {totalRooms} total
                        </span>
                      </div>
                      <span className="font-equip text-xs text-gdd-black/40">{occupancy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${occupancy}%` }} />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gdd-black/5 mt-3">
                    <button
                      onClick={() => openEdit(hotel)}
                      className="flex-1 py-1.5 font-equip text-[10px] uppercase tracking-widest-plus text-gold border border-gold/20 hover:bg-gold/5 rounded-sm transition-colors"
                    >
                      Edit
                    </button>
                    {isInactive ? (
                      <button
                        onClick={() => reactivateHotel.mutate(hotel._id)}
                        className="p-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                        title="Reactivate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateHotel.mutate(hotel._id)}
                        className="p-1.5 border border-orange/30 text-orange hover:bg-orange/10 rounded-sm transition-colors"
                        title="Deactivate"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(hotel)}
                      className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data?.total > data?.limit && (
        <div className="flex items-center justify-between mt-6">
          <p className="font-equip text-xs text-gdd-black/40">Page {data.page} · {data.total} total</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus border border-gdd-black/10 rounded-sm disabled:opacity-30">Prev</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * data.limit >= data.total}
              className="px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus border border-gdd-black/10 rounded-sm disabled:opacity-30">Next</button>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedHotel ? `Edit ${selectedHotel.name}` : 'Add Hotel'}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createHotel.isPending || updateHotel.isPending}
              className="px-6 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {createHotel.isPending || updateHotel.isPending ? 'Saving…' : (selectedHotel ? 'Save Changes' : 'Add Hotel')}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Hotel ID (slug)">
              <input
                type="text"
                value={form.hotelId}
                onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
                placeholder="e.g. nile-ritz"
                disabled={!isAdding}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-sand-light/50 disabled:text-gdd-black/40"
              />
            </Field>
            <Field label="Hotel Name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Stars">
              <select
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {[3, 4, 5].map((n) => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </Field>
            <Field label="Price/Night">
              <input
                type="number"
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="View">
              <select
                value={form.view}
                onChange={(e) => setForm({ ...form, view: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="pyramid">Pyramid View</option>
                <option value="nile">Nile View</option>
                <option value="city">City View</option>
              </select>
            </Field>
          </div>

          <Field label="Cancellation Policy">
            <input
              type="text"
              value={form.cancellationPolicy}
              onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>

          <Field label="Amenities">
            <TagListInput
              value={form.amenities}
              onChange={(items) => setForm({ ...form, amenities: items })}
              placeholder="e.g. Free WiFi"
              addLabel="Add amenity"
              emptyMessage="No amenities yet."
            />
          </Field>

          <ImageUpload
            label="Hotel Images"
            value={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
            multiple={true}
            requirements={IMAGE_PROFILES.HOTEL}
          />

          {/* Available date ranges — leave empty to mean "always available" */}
          <div className="border border-gdd-black/10 rounded-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-sand-light/30">
              <div>
                <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
                  Available Date Ranges
                </h4>
                <p className="font-equip text-[10px] text-gdd-black/40 mt-0.5">
                  Leave empty to make this hotel available for any dates the customer picks.
                </p>
              </div>
              <button
                type="button"
                onClick={addDateRange}
                className="flex items-center gap-1 px-2 py-1 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" /> Add Range
              </button>
            </div>
            <div className="p-4 space-y-3">
              {form.availableDateRanges.length === 0 && (
                <p className="font-equip text-xs text-gdd-black/30 text-center py-2">
                  No date restrictions — hotel is available year-round.
                </p>
              )}
              {form.availableDateRanges.map((range, idx) => (
                <div key={idx} className="border border-gdd-black/5 rounded-sm p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                      Range #{idx + 1}
                    </span>
                    <button onClick={() => removeDateRange(idx)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SubField label="From">
                      <input
                        type="date"
                        value={range.from}
                        onChange={(e) => updateDateRange(idx, { from: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="To">
                      <input
                        type="date"
                        value={range.to}
                        onChange={(e) => updateDateRange(idx, { to: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms subform with proper labels */}
          <div className="border border-gdd-black/10 rounded-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-sand-light/30">
              <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Room Types</h4>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1 px-2 py-1 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Room
              </button>
            </div>
            <div className="p-4 space-y-4">
              {form.rooms.length === 0 && (
                <p className="font-equip text-xs text-gdd-black/30 text-center py-2">No room types yet.</p>
              )}
              {form.rooms.map((room, idx) => (
                <div key={idx} className="border border-gdd-black/5 rounded-sm p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Room #{idx + 1}</span>
                    <button onClick={() => removeRoom(idx)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SubField label="Room ID (slug)">
                      <input
                        type="text"
                        value={room.roomId}
                        onChange={(e) => updateRoom(idx, { roomId: e.target.value })}
                        placeholder="e.g. deluxe-king"
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Room Name">
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(idx, { name: e.target.value })}
                        placeholder="e.g. Deluxe King"
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <SubField label="Bed Type">
                      <input
                        type="text"
                        value={room.bedType}
                        onChange={(e) => updateRoom(idx, { bedType: e.target.value })}
                        placeholder="king / twin"
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Capacity">
                      <input
                        type="number"
                        value={room.capacity}
                        onChange={(e) => updateRoom(idx, { capacity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Total Rooms">
                      <input
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => updateRoom(idx, { totalRooms: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Sqm">
                      <input
                        type="number"
                        value={room.sqm}
                        onChange={(e) => updateRoom(idx, { sqm: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SubField label="Supplement / Night ($)">
                      <input
                        type="number"
                        value={room.supplementPerNight}
                        onChange={(e) => updateRoom(idx, { supplementPerNight: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Description">
                      <input
                        type="text"
                        value={room.description}
                        onChange={(e) => updateRoom(idx, { description: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addons subform with proper labels */}
          <div className="border border-gdd-black/10 rounded-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-sand-light/30">
              <h4 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Hotel Add-ons</h4>
              <button
                type="button"
                onClick={addAddon}
                className="flex items-center gap-1 px-2 py-1 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Addon
              </button>
            </div>
            <div className="p-4 space-y-4">
              {form.addons.length === 0 && (
                <p className="font-equip text-xs text-gdd-black/30 text-center py-2">No addons yet.</p>
              )}
              {form.addons.map((addon, idx) => (
                <div key={idx} className="border border-gdd-black/5 rounded-sm p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Addon #{idx + 1}</span>
                    <button onClick={() => removeAddon(idx)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <SubField label="Addon ID (slug)">
                      <input
                        type="text"
                        value={addon.addonId}
                        onChange={(e) => updateAddon(idx, { addonId: e.target.value })}
                        placeholder="e.g. breakfast"
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Name">
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => updateAddon(idx, { name: e.target.value })}
                        placeholder="e.g. Breakfast"
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                    <SubField label="Price ($)">
                      <input
                        type="number"
                        value={addon.price}
                        onChange={(e) => updateAddon(idx, { price: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                      />
                    </SubField>
                  </div>
                  <SubField label="Description">
                    <input
                      type="text"
                      value={addon.description}
                      onChange={(e) => updateAddon(idx, { description: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                    />
                  </SubField>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Hotel"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteHotel.mutate(deleteConfirm._id, { onSuccess: () => setDeleteConfirm(null) })
              }}
              disabled={deleteHotel.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteHotel.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete <strong>{deleteConfirm?.name}</strong>?
        </p>
        <p className="font-equip text-xs text-gdd-black/40">
          The hotel will be hidden from BOTH the customer site and the admin panel. Use Deactivate instead if you might want it back.
        </p>
      </Modal>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function SubField({ label, children }) {
  return (
    <div>
      <label className="block font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/30 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
