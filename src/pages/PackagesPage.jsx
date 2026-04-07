import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, Hotel, Clock, RotateCcw, PowerOff } from 'lucide-react'
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeactivatePackage,
  useReactivatePackage,
  useDeletePackage,
} from '@/api/hooks/usePackages'
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
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 },
  }),
}

const TIER_OPTIONS = [
  { value: 'basic',    label: 'Basic' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'maximum',  label: 'Maximum' },
  { value: 'custom',   label: 'Custom (Build Your Own)' },
]

const emptyHotelPricingRow = {
  hotelId:           '',
  hotelName:         '',
  perPersonInDouble: 0,
  singleSupplement:  0,
  total:             0,
  singleTotal:       0,
}

const emptyScheduleDay = {
  day:        1,
  date:       '',
  title:      '',
  highlights: [],
  icon:       '',
  type:       '',
}

const emptyItinerary = {
  category:     '',
  subtitle:     '',
  duration:     '',
  badge:        '',
  nights:       '',
  checkIn:      '',
  checkOut:     '',
  eventDate:    '2026-11-05',
  hotelPricing: [],
  schedule:     [],
  includes:     [],
  excludes:     [],
}

const emptyPackage = {
  packageId:       '',
  name:            '',
  tier:            'basic',
  recommended:     false,
  soldOut:         false,
  startingPrice:   '',
  adultPrice:      '',
  childPrice:      '',
  currency:        'USD',
  description:     '',
  includes:        [],
  baseHotelId:     '',
  baseTransferId:  '',
  baseSightseeing: [],
  image:           '',
  hasItinerary:    false,
  itinerary:       { ...emptyItinerary },
}

export default function PackagesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = usePackages({
    page,
    limit: 25,
    search: search || undefined,
    status,
  })
  const items = data?.data || []

  const createPackage     = useCreatePackage()
  const updatePackage     = useUpdatePackage()
  const deactivatePackage = useDeactivatePackage()
  const reactivatePackage = useReactivatePackage()
  const deletePackage     = useDeletePackage()

  const [selected, setSelected] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyPackage })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const openAdd = () => {
    setForm({ ...emptyPackage, itinerary: { ...emptyItinerary } })
    setIsAdding(true)
  }

  const openEdit = (pkg) => {
    setForm({
      packageId:       pkg.packageId || '',
      name:            pkg.name || '',
      tier:            pkg.tier || 'basic',
      recommended:     !!pkg.recommended,
      soldOut:         !!pkg.soldOut,
      startingPrice:   pkg.startingPrice ?? '',
      adultPrice:      pkg.adultPrice ?? '',
      childPrice:      pkg.childPrice ?? '',
      currency:        pkg.currency || 'USD',
      description:     pkg.description || '',
      includes:        pkg.includes || [],
      baseHotelId:     pkg.baseHotelId || '',
      baseTransferId:  pkg.baseTransferId || '',
      baseSightseeing: pkg.baseSightseeing || [],
      image:           pkg.image || '',
      hasItinerary:    !!pkg.itinerary,
      itinerary:       pkg.itinerary
        ? {
            category:     pkg.itinerary.category || '',
            subtitle:     pkg.itinerary.subtitle || '',
            duration:     pkg.itinerary.duration || '',
            badge:        pkg.itinerary.badge || '',
            nights:       pkg.itinerary.nights ?? '',
            checkIn:      pkg.itinerary.checkIn || '',
            checkOut:     pkg.itinerary.checkOut || '',
            eventDate:    pkg.itinerary.eventDate || '2026-11-05',
            hotelPricing: pkg.itinerary.hotelPricing || [],
            schedule:     pkg.itinerary.schedule || [],
            includes:     pkg.itinerary.includes || [],
            excludes:     pkg.itinerary.excludes || [],
          }
        : { ...emptyItinerary },
    })
    setSelected(pkg)
  }

  const closeModal = () => {
    setSelected(null)
    setIsAdding(false)
  }

  const handleSave = () => {
    const itineraryPayload = form.hasItinerary
      ? {
          category:     form.itinerary.category,
          subtitle:     form.itinerary.subtitle,
          duration:     form.itinerary.duration,
          badge:        form.itinerary.badge,
          nights:       form.itinerary.nights !== '' ? Number(form.itinerary.nights) : undefined,
          checkIn:      form.itinerary.checkIn,
          checkOut:     form.itinerary.checkOut,
          eventDate:    form.itinerary.eventDate,
          hotelPricing: form.itinerary.hotelPricing,
          schedule:     form.itinerary.schedule,
          includes:     form.itinerary.includes,
          excludes:     form.itinerary.excludes,
        }
      : null

    const payload = {
      packageId:       form.packageId.trim() || `pkg-${Date.now()}`,
      name:            form.name.trim(),
      tier:            form.tier,
      recommended:     form.recommended,
      soldOut:         form.soldOut,
      startingPrice:   form.startingPrice !== '' ? Number(form.startingPrice) : null,
      adultPrice:      form.adultPrice !== '' ? Number(form.adultPrice) : null,
      childPrice:      form.childPrice !== '' ? Number(form.childPrice) : null,
      currency:        form.currency || 'USD',
      description:     form.description,
      includes:        form.includes,
      baseHotelId:     form.baseHotelId || null,
      baseTransferId:  form.baseTransferId || null,
      baseSightseeing: form.baseSightseeing,
      image:           form.image,
      itinerary:       itineraryPayload,
    }
    if (isAdding) {
      createPackage.mutate(payload, { onSuccess: closeModal })
    } else {
      updatePackage.mutate({ id: selected._id, ...payload }, { onSuccess: closeModal })
    }
  }

  // Itinerary subform helpers
  const setItin = (patch) => setForm((f) => ({ ...f, itinerary: { ...f.itinerary, ...patch } }))
  const addPricingRow = () => setItin({ hotelPricing: [...form.itinerary.hotelPricing, { ...emptyHotelPricingRow }] })
  const updatePricingRow = (idx, patch) => setItin({
    hotelPricing: form.itinerary.hotelPricing.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
  })
  const removePricingRow = (idx) => setItin({
    hotelPricing: form.itinerary.hotelPricing.filter((_, i) => i !== idx),
  })

  const addScheduleDay = () => setItin({
    schedule: [...form.itinerary.schedule, { ...emptyScheduleDay, day: form.itinerary.schedule.length + 1 }],
  })
  const updateScheduleDay = (idx, patch) => setItin({
    schedule: form.itinerary.schedule.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
  })
  const removeScheduleDay = (idx) => setItin({
    schedule: form.itinerary.schedule.filter((_, i) => i !== idx),
  })

  return (
    <div>
      <PageHeader
        title="Packages"
        subtitle="Manage booking packages and their itineraries"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Package
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search packages..."
          className="flex-1"
        />
        <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load packages.</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-sm">
          <p className="font-equip text-sm text-gdd-black/30">No packages match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((pkg, i) => {
            const isInactive = pkg.isActive === false
            const itin = pkg.itinerary
            return (
              <motion.div
                key={pkg._id}
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
                {pkg.recommended && !isInactive && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-gold text-white font-equip text-[9px] tracking-widest-plus uppercase rounded-sm">
                    Recommended
                  </div>
                )}
                <div className="relative h-48 overflow-hidden bg-sand-light/50 cursor-pointer" onClick={() => openEdit(pkg)}>
                  {pkg.image && (
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medino text-base text-gdd-black cursor-pointer" onClick={() => openEdit(pkg)}>{pkg.name}</h3>
                    <span className="font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/40">{pkg.tier}</span>
                  </div>
                  {pkg.adultPrice !== null && pkg.adultPrice !== undefined ? (
                    <p className="font-equip text-2xl font-medium text-gold-deep mb-2">{formatCurrency(pkg.adultPrice || 0)}</p>
                  ) : pkg.startingPrice !== null && pkg.startingPrice !== undefined ? (
                    <p className="font-equip text-lg font-medium text-gold-deep mb-2">From {formatCurrency(pkg.startingPrice || 0)}</p>
                  ) : (
                    <p className="font-equip text-sm text-gdd-black/40 mb-2">Custom pricing</p>
                  )}

                  {/* Itinerary summary */}
                  {itin && (
                    <div className="flex flex-wrap gap-3 font-equip text-xs text-gdd-black/40 mb-3">
                      {itin.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{itin.duration}</span>}
                      {(itin.hotelPricing || []).length > 0 && <span className="flex items-center gap-1"><Hotel className="w-3 h-3" />{itin.hotelPricing.length} hotels</span>}
                      {(itin.schedule || []).length > 0 && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{itin.schedule.length} days</span>}
                    </div>
                  )}

                  {pkg.soldOut && (
                    <p className="font-equip text-[10px] text-red-600 mb-3">Sold out</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gdd-black/5">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="flex-1 py-1.5 font-equip text-[10px] uppercase tracking-widest-plus text-gold border border-gold/20 hover:bg-gold/5 rounded-sm transition-colors"
                    >
                      Edit
                    </button>
                    {isInactive ? (
                      <button
                        onClick={() => reactivatePackage.mutate(pkg._id)}
                        className="p-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                        title="Reactivate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivatePackage.mutate(pkg._id)}
                        className="p-1.5 border border-orange/30 text-orange hover:bg-orange/10 rounded-sm transition-colors"
                        title="Deactivate"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(pkg)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={!!selected || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Package' : `Edit ${selected?.name || 'Package'}`}
        size="xl"
      >
        <div className="space-y-5">
          {/* Core package fields */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Package ID (slug)">
              <input
                type="text"
                value={form.packageId}
                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                disabled={!isAdding}
                placeholder="e.g. platinum-package"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-sand-light/50 disabled:text-gdd-black/40"
              />
            </Field>
            <Field label="Tier">
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Starting Price (optional)">
              <input
                type="number"
                value={form.startingPrice}
                onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Adult Price">
              <input
                type="number"
                value={form.adultPrice}
                onChange={(e) => setForm({ ...form, adultPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Child Price">
              <input
                type="number"
                value={form.childPrice}
                onChange={(e) => setForm({ ...form, childPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </Field>

          <Field label="What's Included">
            <TagListInput
              value={form.includes}
              onChange={(items) => setForm({ ...form, includes: items })}
              placeholder="e.g. 4 nights luxury accommodation"
              addLabel="Add inclusion"
              emptyMessage="No inclusions yet."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Base Hotel ID (optional)">
              <input
                type="text"
                value={form.baseHotelId}
                onChange={(e) => setForm({ ...form, baseHotelId: e.target.value })}
                placeholder="e.g. nile-ritz"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Base Transfer ID (optional)">
              <input
                type="text"
                value={form.baseTransferId}
                onChange={(e) => setForm({ ...form, baseTransferId: e.target.value })}
                placeholder="e.g. airport-hotel"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>

          <Field label="Base Sightseeing IDs">
            <TagListInput
              value={form.baseSightseeing}
              onChange={(items) => setForm({ ...form, baseSightseeing: items })}
              placeholder="e.g. cairo-classics"
              addLabel="Add sightseeing"
              emptyMessage="No sightseeing items."
            />
          </Field>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.recommended}
                onChange={(e) => setForm({ ...form, recommended: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-equip text-sm text-gdd-black/70">Recommended</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.soldOut}
                onChange={(e) => setForm({ ...form, soldOut: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="font-equip text-sm text-gdd-black/70">Sold Out</span>
            </label>
          </div>

          <ImageUpload
            label="Package Hero Image"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            requirements={IMAGE_PROFILES.PACKAGE}
          />

          {/* Embedded Itinerary section */}
          <div className="border-2 border-gold/20 rounded-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-gold/5">
              <div>
                <h4 className="font-medino text-sm text-gdd-black">Itinerary</h4>
                <p className="font-equip text-[10px] text-gdd-black/40 mt-0.5">
                  Each package owns its own itinerary (hotel pricing tiers + day-by-day schedule).
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasItinerary}
                  onChange={(e) => setForm({ ...form, hasItinerary: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-equip text-xs text-gdd-black/70">Has itinerary</span>
              </label>
            </div>

            {form.hasItinerary && (
              <div className="p-4 space-y-4">
                <Field label="Subtitle">
                  <input
                    type="text"
                    value={form.itinerary.subtitle}
                    onChange={(e) => setItin({ subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </Field>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Duration label">
                    <input
                      type="text"
                      value={form.itinerary.duration}
                      onChange={(e) => setItin({ duration: e.target.value })}
                      placeholder="3 nights / 4 days"
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Nights">
                    <input
                      type="number"
                      value={form.itinerary.nights}
                      onChange={(e) => setItin({ nights: e.target.value })}
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Badge">
                    <input
                      type="text"
                      value={form.itinerary.badge}
                      onChange={(e) => setItin({ badge: e.target.value })}
                      placeholder="e.g. Most Popular"
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Check-in">
                    <input
                      type="date"
                      value={form.itinerary.checkIn}
                      onChange={(e) => setItin({ checkIn: e.target.value })}
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Check-out">
                    <input
                      type="date"
                      value={form.itinerary.checkOut}
                      onChange={(e) => setItin({ checkOut: e.target.value })}
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                  <Field label="Event Date">
                    <input
                      type="date"
                      value={form.itinerary.eventDate}
                      onChange={(e) => setItin({ eventDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </Field>
                </div>

                {/* Hotel pricing tiers */}
                <div className="border border-gdd-black/10 rounded-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-sand-light/30">
                    <h5 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Hotel Pricing Tiers</h5>
                    <button type="button" onClick={addPricingRow}
                      className="flex items-center gap-1 px-2 py-1 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors">
                      <Plus className="w-3 h-3" /> Add Hotel Tier
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {form.itinerary.hotelPricing.length === 0 && (
                      <p className="font-equip text-xs text-gdd-black/30 text-center py-2">No pricing tiers yet.</p>
                    )}
                    {form.itinerary.hotelPricing.map((row, idx) => (
                      <div key={idx} className="border border-gdd-black/5 rounded-sm p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Tier #{idx + 1}</span>
                          <button onClick={() => removePricingRow(idx)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <SubField label="Hotel ID">
                            <input type="text" value={row.hotelId}
                              onChange={(e) => updatePricingRow(idx, { hotelId: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Hotel Name">
                            <input type="text" value={row.hotelName}
                              onChange={(e) => updatePricingRow(idx, { hotelName: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <SubField label="Per Person (DBL)">
                            <input type="number" value={row.perPersonInDouble}
                              onChange={(e) => updatePricingRow(idx, { perPersonInDouble: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Single Suppl.">
                            <input type="number" value={row.singleSupplement}
                              onChange={(e) => updatePricingRow(idx, { singleSupplement: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Total (DBL)">
                            <input type="number" value={row.total}
                              onChange={(e) => updatePricingRow(idx, { total: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Total (Single)">
                            <input type="number" value={row.singleTotal}
                              onChange={(e) => updatePricingRow(idx, { singleTotal: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="border border-gdd-black/10 rounded-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gdd-black/5 bg-sand-light/30">
                    <h5 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Day-by-Day Schedule</h5>
                    <button type="button" onClick={addScheduleDay}
                      className="flex items-center gap-1 px-2 py-1 bg-gdd-black text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors">
                      <Plus className="w-3 h-3" /> Add Day
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {form.itinerary.schedule.length === 0 && (
                      <p className="font-equip text-xs text-gdd-black/30 text-center py-2">No schedule yet.</p>
                    )}
                    {form.itinerary.schedule.map((day, idx) => (
                      <div key={idx} className="border border-gdd-black/5 rounded-sm p-4 space-y-3 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Day {day.day || idx + 1}</span>
                          <button onClick={() => removeScheduleDay(idx)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <SubField label="Day #">
                            <input type="number" value={day.day}
                              onChange={(e) => updateScheduleDay(idx, { day: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Date">
                            <input type="date" value={day.date}
                              onChange={(e) => updateScheduleDay(idx, { date: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                          <SubField label="Type">
                            <input type="text" value={day.type}
                              onChange={(e) => updateScheduleDay(idx, { type: e.target.value })}
                              placeholder="arrival, gala, etc."
                              className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                            />
                          </SubField>
                        </div>
                        <SubField label="Title">
                          <input type="text" value={day.title}
                            onChange={(e) => updateScheduleDay(idx, { title: e.target.value })}
                            className="w-full px-3 py-1.5 border border-gdd-black/10 rounded-sm font-equip text-xs"
                          />
                        </SubField>
                        <SubField label="Highlights">
                          <TagListInput
                            value={day.highlights || []}
                            onChange={(items) => updateScheduleDay(idx, { highlights: items })}
                            placeholder="e.g. Visit the Pyramids"
                            addLabel="Add highlight"
                            emptyMessage="No highlights for this day."
                          />
                        </SubField>
                      </div>
                    ))}
                  </div>
                </div>

                <Field label="Itinerary Includes">
                  <TagListInput
                    value={form.itinerary.includes}
                    onChange={(items) => setItin({ includes: items })}
                    placeholder="e.g. All transfers"
                    addLabel="Add inclusion"
                    emptyMessage="No inclusions yet."
                  />
                </Field>

                <Field label="Itinerary Excludes">
                  <TagListInput
                    value={form.itinerary.excludes}
                    onChange={(items) => setItin({ excludes: items })}
                    placeholder="e.g. International flights"
                    addLabel="Add exclusion"
                    emptyMessage="No exclusions yet."
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={closeModal}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createPackage.isPending || updatePackage.isPending}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {createPackage.isPending || updatePackage.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Package"
        size="sm"
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete <strong>{deleteConfirm?.name}</strong>?
        </p>
        <p className="font-equip text-xs text-gdd-black/40 mb-6">
          The package and its itinerary will be hidden from BOTH the customer site and the admin panel. Use Deactivate instead if you might want it back.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deletePackage.mutate(deleteConfirm._id, { onSuccess: () => setDeleteConfirm(null) })}
            disabled={deletePackage.isPending}
            className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deletePackage.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
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
