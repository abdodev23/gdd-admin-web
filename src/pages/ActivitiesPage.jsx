import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, DollarSign, MapPin, X } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
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
  sightseeing: { bg: 'bg-gold/10', text: 'text-gold-deep' },
  culture: { bg: 'bg-status-blue/10', text: 'text-status-blue' },
  leisure: { bg: 'bg-status-green/10', text: 'text-status-green' },
  entertainment: { bg: 'bg-status-red/10', text: 'text-status-red' },
}

const categoryOptions = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'culture', label: 'Culture' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'entertainment', label: 'Entertainment' },
]

const emptyActivity = {
  name: '',
  category: 'sightseeing',
  price: '',
  durationHours: '',
  durationLabel: '',
  description: '',
  image: '/images/dance/MEL_4520.jpg',
  highlights: [],
  availableDates: [],
  timeSlots: [],
  totalSlots: '',
  bookedSlots: 0,
}

export default function ActivitiesPage() {
  const { activities, addItem, updateItem } = useDataStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyActivity })

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !categoryFilter || a.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [activities, search, categoryFilter])

  const handleCardClick = (activity) => {
    setForm({ ...activity })
    setSelectedActivity(activity)
  }

  const handleAdd = () => {
    setForm({ ...emptyActivity })
    setIsAdding(true)
  }

  const handleSave = () => {
    const payload = {
      ...form,
      price: Number(form.price),
      durationHours: Number(form.durationHours),
      totalSlots: Number(form.totalSlots),
      bookedSlots: Number(form.bookedSlots || 0),
    }
    if (isAdding) {
      addItem('activities', payload)
      setIsAdding(false)
    } else {
      updateItem('activities', selectedActivity.id, payload)
      setSelectedActivity(null)
    }
  }

  const closeModal = () => {
    setSelectedActivity(null)
    setIsAdding(false)
  }

  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle={`${activities.length} activities available`}
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

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search activities..."
          className="flex-1"
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          placeholder="All Categories"
          className="sm:w-48"
        />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((activity, i) => {
          const cat = categoryColors[activity.category] || categoryColors.sightseeing
          const progress = activity.totalSlots > 0
            ? Math.round((activity.bookedSlots / activity.totalSlots) * 100)
            : 0

          return (
            <motion.div
              key={activity.id}
              className="bg-white rounded-sm shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              onClick={() => handleCardClick(activity)}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={cn(
                  'absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
                  cat.bg, cat.text
                )}>
                  {activity.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-medino text-base text-gdd-black mb-1">{activity.name}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-equip text-sm font-medium text-gold-deep">
                    {formatCurrency(activity.price)}
                  </span>
                  <span className="flex items-center gap-1 font-equip text-xs text-gdd-black/40">
                    <Clock className="w-3 h-3" />
                    {activity.durationLabel}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                      Bookings
                    </span>
                    <span className="font-equip text-xs text-gdd-black/60">
                      {activity.bookedSlots} / {activity.totalSlots}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-equip text-sm text-gdd-black/30">No activities match your filters.</p>
        </div>
      )}

      {/* Detail / Edit Modal */}
      <Modal
        isOpen={!!selectedActivity || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Activity' : 'Edit Activity'}
        size="lg"
      >
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Activity Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Price (USD)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Duration (hours)
              </label>
              <input
                type="number"
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Duration Label
              </label>
              <input
                type="text"
                value={form.durationLabel}
                onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                placeholder="e.g. Half day"
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Total Slots
              </label>
              <input
                type="number"
                value={form.totalSlots}
                onChange={(e) => setForm({ ...form, totalSlots: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Image Path
              </label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Highlights (one per line)
            </label>
            <textarea
              rows={4}
              value={form.highlights?.join('\n')}
              onChange={(e) => setForm({ ...form, highlights: e.target.value.split('\n').filter(Boolean) })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
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
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              {isAdding ? 'Add Activity' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
