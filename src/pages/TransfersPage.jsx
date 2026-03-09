import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Edit3, Users, Car, DollarSign } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import Modal from '@/components/ui/Modal'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

export default function TransfersPage() {
  const { transfers, updateItem } = useDataStore()
  const [editTransfer, setEditTransfer] = useState(null)
  const [form, setForm] = useState({})

  const totalBookings = transfers.reduce((sum, t) => sum + t.totalBookings, 0)
  const vipTransfer = transfers.find((t) => t.type === 'vip')
  const basicTransfer = transfers.find((t) => t.type === 'basic')

  const handleEdit = (transfer) => {
    setForm({ ...transfer })
    setEditTransfer(transfer)
  }

  const handleSave = () => {
    updateItem('transfers', editTransfer.id, {
      ...form,
      price: Number(form.price),
      maxPassengers: Number(form.maxPassengers),
      totalBookings: Number(form.totalBookings),
    })
    setEditTransfer(null)
  }

  return (
    <div>
      <PageHeader
        title="Transfers"
        subtitle="Manage airport and event transfer services"
      />

      {/* Transfer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {transfers.map((transfer, i) => (
          <motion.div
            key={transfer.id}
            className={cn(
              'bg-white rounded-sm shadow-sm overflow-hidden',
              transfer.type === 'vip' && 'ring-1 ring-gold/20'
            )}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      transfer.type === 'vip' ? 'bg-gold/10' : 'bg-gdd-black/5'
                    )}>
                      <Car className={cn(
                        'w-5 h-5',
                        transfer.type === 'vip' ? 'text-gold' : 'text-gdd-black/40'
                      )} />
                    </div>
                    {transfer.type === 'vip' && (
                      <span className="px-2.5 py-0.5 bg-gold/10 text-gold-deep text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <h2 className="font-medino text-xl text-gdd-black">{transfer.name}</h2>
                  <p className="font-equip text-sm text-gdd-black/40 mt-0.5">{transfer.vehicle}</p>
                </div>
                <button
                  onClick={() => handleEdit(transfer)}
                  className="flex items-center gap-2 px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:border-gold/30 hover:bg-gold/[0.02] transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              {/* Price */}
              <p className="font-medino text-2xl text-gold mb-4">{formatCurrency(transfer.price)}<span className="font-equip text-xs text-gdd-black/40 ml-1">round trip</span></p>

              {/* Description */}
              <p className="font-equip text-sm text-gdd-black/60 mb-6 leading-relaxed">{transfer.description}</p>

              {/* Includes */}
              <div className="mb-6">
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Includes
                </h3>
                <div className="space-y-2">
                  {transfer.includes.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <span className="font-equip text-sm text-gdd-black/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gdd-black/5">
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Total Bookings</p>
                  <p className="font-medino text-lg text-gdd-black mt-0.5">{transfer.totalBookings}</p>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Max Passengers</p>
                  <p className="font-medino text-lg text-gdd-black mt-0.5">{transfer.maxPassengers}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={Car}
          label="Total Transfer Bookings"
          value={totalBookings}
          index={2}
        />
        <StatsCard
          icon={DollarSign}
          label="VIP Bookings"
          value={vipTransfer?.totalBookings || 0}
          index={3}
        />
        <StatsCard
          icon={Users}
          label="Basic Bookings"
          value={basicTransfer?.totalBookings || 0}
          index={4}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTransfer}
        onClose={() => setEditTransfer(null)}
        title={`Edit ${editTransfer?.name || 'Transfer'}`}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Transfer Name
            </label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Vehicle
            </label>
            <input
              type="text"
              value={form.vehicle || ''}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
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
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Max Passengers
              </label>
              <input
                type="number"
                value={form.maxPassengers || ''}
                onChange={(e) => setForm({ ...form, maxPassengers: e.target.value })}
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
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Includes (one per line)
            </label>
            <textarea
              rows={4}
              value={form.includes?.join('\n') || ''}
              onChange={(e) => setForm({ ...form, includes: e.target.value.split('\n').filter(Boolean) })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditTransfer(null)}
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
