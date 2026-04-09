import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Trash2, RotateCcw, PowerOff } from 'lucide-react'
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeactivateActivity,
  useReactivateActivity,
  useDeleteActivity,
} from '@/api/hooks/useActivities'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import StatusFilter from '@/components/ui/StatusFilter'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import TagListInput from '@/components/ui/TagListInput'
import { IMAGE_PROFILES } from '@/data/imageProfiles'
import { EGYPT_GOVERNORATES } from '@/data/egyptGovernorates'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 },
  }),
}

const categoryColors = {
  sightseeing:   { bg: 'bg-gold/10', text: 'text-gold-deep' },
  culture:       { bg: 'bg-status-blue/10', text: 'text-status-blue' },
  leisure:       { bg: 'bg-status-green/10', text: 'text-status-green' },
  entertainment: { bg: 'bg-status-red/10', text: 'text-status-red' },
}

// Filter dropdown options. The Select component renders the placeholder
// itself when value is empty, so we don't include "All Categories" here.
const FILTER_CATEGORIES = [
  { value: 'sightseeing',   label: 'Sightseeing' },
  { value: 'culture',       label: 'Culture' },
  { value: 'leisure',       label: 'Leisure' },
  { value: 'entertainment', label: 'Entertainment' },
]

// Form dropdown — used inside the create/edit modal where there's no "All".
const FORM_CATEGORIES = ['sightseeing', 'culture', 'leisure', 'entertainment']

// Activity duration modes — see backend Activity model
const DURATION_MODES = [
  { value: 'time-slot', label: 'Specific time slot' },
  { value: 'full-day',  label: 'Full day' },
  { value: 'multi-day', label: 'Multi-day' },
]

const emptyActivity = {
  activityId:    '',
  name:          '',
  category:      'sightseeing',
  price:         '',
  childPrice:    '',
  currency:      'USD',
  // Duration mode + per-mode fields
  durationMode:  'time-slot',
  timeFrom:      '',
  timeTo:        '',
  stretchDays:   1,
  description:   '',
  location:      '',
  images:        [],
  highlights:    [],
  maxAdults:     '',
  maxChildren:   '',
  bufferAfter:   '',
  prerequisites: [],
}

// Convert backend activity → form state
const activityToForm = (a) => {
  let durationMode = 'time-slot'
  if (a.isFullDay) durationMode = 'full-day'
  else if (a.stretchDays && a.stretchDays > 1) durationMode = 'multi-day'

  return {
    activityId:    a.activityId || '',
    name:          a.name || '',
    category:      a.category || 'sightseeing',
    price:         a.price ?? '',
    childPrice:    a.childPrice ?? '',
    currency:      a.currency || 'USD',
    durationMode,
    timeFrom:      a.timeInterval?.from || '',
    timeTo:        a.timeInterval?.to || '',
    stretchDays:   a.stretchDays || 1,
    description:   a.description || '',
    location:      a.location || '',
    images:        a.images || [],
    highlights:    a.highlights || [],
    maxAdults:     a.maxAdults ?? '',
    maxChildren:   a.maxChildren ?? '',
    bufferAfter:   a.bufferAfter ?? '',
    prerequisites: a.prerequisites || [],
  }
}

// Convert form state → backend payload
const formToPayload = (form) => {
  const base = {
    activityId:    form.activityId.trim() || `act-${Date.now()}`,
    name:          form.name.trim(),
    category:      form.category,
    price:         Number(form.price) || 0,
    childPrice:    form.childPrice !== '' ? Number(form.childPrice) : undefined,
    currency:      form.currency || 'USD',
    description:   form.description,
    location:      form.location,
    images:        form.images || [],
    highlights:    form.highlights,
    maxAdults:     form.maxAdults !== '' ? Number(form.maxAdults) : undefined,
    maxChildren:   form.maxChildren !== '' ? Number(form.maxChildren) : undefined,
    bufferAfter:   form.bufferAfter !== '' ? Number(form.bufferAfter) : 0,
    prerequisites: form.prerequisites,
  }

  if (form.durationMode === 'time-slot') {
    const fromMin = parseTime(form.timeFrom)
    const toMin   = parseTime(form.timeTo)
    const durationHours = fromMin != null && toMin != null && toMin > fromMin
      ? (toMin - fromMin) / 60
      : 0
    return {
      ...base,
      timeInterval: { from: form.timeFrom, to: form.timeTo },
      durationHours,
      isFullDay:    false,
      stretchDays:  0,
    }
  }
  if (form.durationMode === 'full-day') {
    return {
      ...base,
      timeInterval: { from: '', to: '' },
      durationHours: 8,
      isFullDay:    true,
      stretchDays:  0,
    }
  }
  // multi-day
  return {
    ...base,
    timeInterval:  { from: '', to: '' },
    durationHours: 8 * (Number(form.stretchDays) || 1),
    isFullDay:     false,
    stretchDays:   Number(form.stretchDays) || 1,
  }
}

const parseTime = (str) => {
  if (!str) return null
  const [h, m] = str.split(':').map(Number)
  if (Number.isNaN(h)) return null
  return h * 60 + (m || 0)
}

export default function ActivitiesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [status, setStatus] = useState('active')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useActivities({
    page,
    limit: 24,
    search: search || undefined,
    category: categoryFilter || undefined,
    status,
  })
  const activities = data?.data || []

  const createActivity     = useCreateActivity()
  const updateActivity     = useUpdateActivity()
  const deactivateActivity = useDeactivateActivity()
  const reactivateActivity = useReactivateActivity()
  const deleteActivity     = useDeleteActivity()

  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyActivity })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleAdd = () => {
    setForm({ ...emptyActivity })
    setIsAdding(true)
  }

  const handleEdit = (activity) => {
    setForm(activityToForm(activity))
    setSelectedActivity(activity)
  }

  const closeModal = () => {
    setSelectedActivity(null)
    setIsAdding(false)
  }

  const handleSave = () => {
    const payload = formToPayload(form)
    if (isAdding) {
      createActivity.mutate(payload, { onSuccess: closeModal })
    } else {
      updateActivity.mutate({ id: selectedActivity._id, ...payload }, { onSuccess: closeModal })
    }
  }

  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle={data ? `${data.total} activities` : 'Loading…'}
        action={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search activities..."
          className="flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold sm:w-48"
        >
          <option value="">All Categories</option>
          {FILTER_CATEGORIES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load activities.</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      ) : activities.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-sm">
          <p className="font-equip text-sm text-gdd-black/30">No activities match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activities.map((activity, i) => {
              const cat = categoryColors[activity.category] || categoryColors.sightseeing
              const isInactive = activity.isActive === false
              return (
                <motion.div
                  key={activity._id}
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
                  <div className="relative h-40 overflow-hidden bg-sand-light/50 cursor-pointer" onClick={() => handleEdit(activity)}>
                    {activity.images?.[0] && (
                      <img
                        src={activity.images[0]}
                        alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className={cn(
                      'absolute top-3 right-3 px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
                      cat.bg, cat.text
                    )}>
                      {activity.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-medino text-base text-gdd-black mb-1 cursor-pointer" onClick={() => handleEdit(activity)}>{activity.name}</h3>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-equip text-sm font-medium text-gold-deep">
                        {formatCurrency(activity.price || 0)}
                      </span>
                      <span className="flex items-center gap-1 font-equip text-xs text-gdd-black/40">
                        <Clock className="w-3 h-3" />
                        {activity.isFullDay ? 'Full day' : activity.stretchDays > 1 ? `${activity.stretchDays} days` : `${activity.durationHours}h`}
                      </span>
                    </div>
                    {activity.location && (
                      <p className="font-equip text-xs text-gdd-black/40 mb-3">{activity.location}</p>
                    )}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-gdd-black/5">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="flex-1 py-1.5 font-equip text-[10px] uppercase tracking-widest-plus text-gold border border-gold/20 hover:bg-gold/5 rounded-sm transition-colors"
                      >
                        Edit
                      </button>
                      {isInactive ? (
                        <button
                          onClick={() => reactivateActivity.mutate(activity._id)}
                          className="p-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                          title="Reactivate"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => deactivateActivity.mutate(activity._id)}
                          className="p-1.5 border border-orange/30 text-orange hover:bg-orange/10 rounded-sm transition-colors"
                          title="Deactivate"
                        >
                          <PowerOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(activity)}
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

          {/* Pagination */}
          {data?.total > data?.limit && (
            <div className="flex items-center justify-between mt-6">
              <p className="font-equip text-xs text-gdd-black/40">
                Page {data.page} · {data.total} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus border border-gdd-black/10 rounded-sm disabled:opacity-30">Prev</button>
                <button onClick={() => setPage((p) => p + 1)} disabled={page * data.limit >= data.total}
                  className="px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus border border-gdd-black/10 rounded-sm disabled:opacity-30">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!selectedActivity || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Activity' : 'Edit Activity'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createActivity.isPending || updateActivity.isPending}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {createActivity.isPending || updateActivity.isPending ? 'Saving…' : (isAdding ? 'Add Activity' : 'Save Changes')}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Activity ID (slug)">
              <input
                type="text"
                value={form.activityId}
                onChange={(e) => setForm({ ...form, activityId: e.target.value })}
                placeholder="e.g. pyramid-tour"
                disabled={!isAdding}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-sand-light/50 disabled:text-gdd-black/40"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {FORM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Activity Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Adult Price (USD)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Child Price (optional)">
              <input
                type="number"
                value={form.childPrice}
                onChange={(e) => setForm({ ...form, childPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>

          {/* Duration mode picker */}
          <div className="border border-gdd-black/10 rounded-sm p-4 space-y-3">
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setForm({ ...form, durationMode: mode.value })}
                  className={cn(
                    'px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus rounded-sm border transition-colors',
                    form.durationMode === mode.value
                      ? 'bg-gdd-black text-white border-gdd-black'
                      : 'bg-white text-gdd-black/60 border-gdd-black/10 hover:border-gdd-black/30'
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {form.durationMode === 'time-slot' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Field label="From">
                  <input
                    type="time"
                    value={form.timeFrom}
                    onChange={(e) => setForm({ ...form, timeFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </Field>
                <Field label="To">
                  <input
                    type="time"
                    value={form.timeTo}
                    onChange={(e) => setForm({ ...form, timeTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </Field>
              </div>
            )}
            {form.durationMode === 'full-day' && (
              <p className="font-equip text-xs text-gdd-black/40 italic pt-1">
                This activity occupies the entire day. No time slot needed.
              </p>
            )}
            {form.durationMode === 'multi-day' && (
              <Field label="Number of days">
                <input
                  type="number"
                  min="2"
                  value={form.stretchDays}
                  onChange={(e) => setForm({ ...form, stretchDays: e.target.value })}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Max Adults (blank = unlimited)">
              <input
                type="number"
                value={form.maxAdults}
                onChange={(e) => setForm({ ...form, maxAdults: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Max Children">
              <input
                type="number"
                value={form.maxChildren}
                onChange={(e) => setForm({ ...form, maxChildren: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
            <Field label="Buffer After (min)">
              <input
                type="number"
                value={form.bufferAfter}
                onChange={(e) => setForm({ ...form, bufferAfter: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </Field>
          </div>

          <Field label="Location (Egyptian governorate)">
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="">Select a governorate…</option>
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </Field>

          <ImageUpload
            label="Activity Images"
            value={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
            multiple={true}
            requirements={IMAGE_PROFILES.ACTIVITY}
          />

          <Field label="Highlights">
            <TagListInput
              value={form.highlights}
              onChange={(items) => setForm({ ...form, highlights: items })}
              placeholder="e.g. Expert local guide"
              addLabel="Add highlight"
              emptyMessage="No highlights yet."
            />
          </Field>

          <Field label="Prerequisites (other activity IDs that must come first)">
            <TagListInput
              value={form.prerequisites}
              onChange={(items) => setForm({ ...form, prerequisites: items })}
              placeholder="e.g. pyramid-intro"
              addLabel="Add prerequisite"
              emptyMessage="No prerequisites."
            />
          </Field>

        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Activity"
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
                deleteActivity.mutate(deleteConfirm._id, { onSuccess: () => setDeleteConfirm(null) })
              }}
              disabled={deleteActivity.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteActivity.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete <strong>{deleteConfirm?.name}</strong>?
        </p>
        <p className="font-equip text-xs text-gdd-black/40">
          Hidden from BOTH the customer site and the admin panel. Use Deactivate instead if you might want it back.
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
