import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Users, Edit2 } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
  }
}

export default function EventsPage() {
  const { events, updateItem } = useDataStore()
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState({})

  const openEdit = (event) => {
    setEditingEvent(event)
    setForm({
      name: event.name,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      lineup: event.lineup.join(', '),
    })
  }

  const handleSave = () => {
    if (!editingEvent) return
    updateItem('events', editingEvent.id, {
      name: form.name,
      description: form.description,
      startTime: form.startTime,
      endTime: form.endTime,
      lineup: form.lineup.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setEditingEvent(null)
  }

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="November 3-6, 2026 — Grand Egyptian Museum"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event, i) => {
          const dateInfo = formatDay(event.date)
          const occupancy = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0

          return (
            <motion.div
              key={event.id}
              className="bg-white rounded-sm shadow-sm overflow-hidden"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className="p-6">
                {/* Date + Status header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-sand-light/50 rounded-sm px-4 py-3">
                      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                        {dateInfo.weekday}
                      </p>
                      <p className="font-equip font-medium text-3xl text-gdd-black leading-none mt-1">
                        {dateInfo.day}
                      </p>
                      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mt-1">
                        {dateInfo.month}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medino text-xl text-gdd-black">
                        {event.name}
                      </h3>
                      <p className="font-equip text-sm text-gdd-black/50 mt-1 max-w-md">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-gdd-black/50">
                  <div className="flex items-center gap-1.5 font-equip text-sm">
                    <Clock className="w-4 h-4" />
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="flex items-center gap-1.5 font-equip text-sm">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1.5 font-equip text-sm">
                    <Users className="w-4 h-4" />
                    {event.ticketsSold} / {event.capacity}
                  </div>
                </div>

                {/* Lineup */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.lineup.map((act) => (
                    <span
                      key={act}
                      className="inline-flex px-3 py-1 bg-sand-light/50 rounded-full font-equip text-xs text-gdd-black/60"
                    >
                      {act}
                    </span>
                  ))}
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                      Capacity
                    </span>
                    <span className="font-equip text-xs text-gdd-black/50">
                      {occupancy}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gdd-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>

                {/* Edit button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openEdit(event)}
                    className="flex items-center gap-1.5 px-4 py-2 font-equip text-xs font-medium uppercase tracking-widest-plus text-gold hover:text-gold-deep border border-gold/20 hover:border-gold/40 rounded-sm transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title={`Edit Event`}
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Event Name">
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time">
              <input
                type="time"
                value={form.startTime || ''}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
            <FormField label="End Time">
              <input
                type="time"
                value={form.endTime || ''}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
          </div>
          <FormField label="Lineup (comma-separated)">
            <textarea
              value={form.lineup || ''}
              onChange={(e) => setForm({ ...form, lineup: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingEvent(null)}
              className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Save Changes
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
