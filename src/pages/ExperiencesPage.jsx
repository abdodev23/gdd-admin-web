import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Edit3, Users, DollarSign, MapPin, Calendar, Clock } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import StatsCard from '@/components/ui/StatsCard'
import Modal from '@/components/ui/Modal'
import ImageUpload from '@/components/ui/ImageUpload'
import { formatCurrency } from '@/utils/formatCurrency'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

export default function ExperiencesPage() {
  const { bespokePackage, updateItem } = useDataStore()
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ ...bespokePackage })

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

  const pkg = bespokePackage

  return (
    <div>
      <PageHeader
        title="Bespoke Experience"
        subtitle="Manage the flagship Pyramids & Pirouettes package"
      />

      {/* Featured Card */}
      <motion.div
        className="bg-white rounded-sm shadow-sm overflow-hidden mb-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image */}
          <div className="lg:col-span-2 h-64 lg:h-auto">
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
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

            {/* Meta Info */}
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

            {/* Inclusions */}
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

            {/* Highlights */}
            <div className="mb-6">
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {pkg.highlights.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gold/10 text-gold-deep font-equip text-xs rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Bookings Badge */}
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

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          icon={Users}
          label="Total Bookings"
          value={pkg.totalBookings}
          index={1}
        />
        <StatsCard
          icon={DollarSign}
          label="Package Revenue"
          value={formatCurrency(pkg.totalBookings * pkg.price)}
          index={2}
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Package" size="lg">
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Package Name
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
                Price (USD)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Check-in Date
              </label>
              <input
                type="date"
                value={form.fixedCheckIn}
                onChange={(e) => setForm({ ...form, fixedCheckIn: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Check-out Date
              </label>
              <input
                type="date"
                value={form.fixedCheckOut}
                onChange={(e) => setForm({ ...form, fixedCheckOut: e.target.value })}
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
              Inclusions (one per line)
            </label>
            <textarea
              rows={4}
              value={form.includes?.join('\n')}
              onChange={(e) => setForm({ ...form, includes: e.target.value.split('\n').filter(Boolean) })}
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
              onClick={() => setEditOpen(false)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
