import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Check, Ticket, DollarSign, Users } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatsCard from '@/components/ui/StatsCard'
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

const tierBorderColors = {
  general: 'border-l-[#C9A96E]',
  premium: 'border-l-[#B8860B]',
  vip: 'border-l-[#FFD700]',
}

const tierBgColors = {
  general: '#C9A96E',
  premium: '#B8860B',
  vip: '#FFD700',
}

export default function TicketsPage() {
  const { tickets, updateItem } = useDataStore()
  const [editingTicket, setEditingTicket] = useState(null)
  const [form, setForm] = useState({})

  const totalTickets = tickets.reduce((sum, t) => sum + t.totalSeats, 0)
  const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + t.sold * t.price, 0)

  const openEdit = (ticket) => {
    setEditingTicket(ticket)
    setForm({
      name: ticket.name,
      price: ticket.price,
      totalSeats: ticket.totalSeats,
      includes: ticket.includes.join('\n'),
    })
  }

  const handleSave = () => {
    if (!editingTicket) return
    const newTotal = parseInt(form.totalSeats, 10)
    const sold = editingTicket.sold
    const reserved = editingTicket.reserved
    updateItem('tickets', editingTicket.id, {
      name: form.name,
      price: parseFloat(form.price),
      totalSeats: newTotal,
      available: Math.max(0, newTotal - sold - reserved),
      includes: form.includes.split('\n').map((s) => s.trim()).filter(Boolean),
    })
    setEditingTicket(null)
  }

  return (
    <div>
      <PageHeader title="Tickets" subtitle="Manage ticket tiers and pricing" />

      {/* Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {tickets.map((ticket, i) => {
          const soldPercent =
            ticket.totalSeats > 0
              ? Math.round((ticket.sold / ticket.totalSeats) * 100)
              : 0
          const reservedPercent =
            ticket.totalSeats > 0
              ? Math.round((ticket.reserved / ticket.totalSeats) * 100)
              : 0
          const bgColor = tierBgColors[ticket.tier]

          return (
            <motion.div
              key={ticket.id}
              className={cn(
                'bg-white rounded-sm shadow-sm border-l-4 overflow-hidden',
                tierBorderColors[ticket.tier]
              )}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medino text-xl text-gdd-black">
                      {ticket.name}
                    </h3>
                    <p className="font-medino text-2xl text-gdd-black mt-1">
                      ${ticket.price}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(ticket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-equip text-xs font-medium uppercase tracking-widest-plus text-gold hover:text-gold-deep border border-gold/20 hover:border-gold/40 rounded-sm transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <StatItem label="Total" value={ticket.totalSeats} />
                  <StatItem label="Sold" value={ticket.sold} />
                  <StatItem label="Reserved" value={ticket.reserved} />
                  <StatItem label="Available" value={ticket.available} />
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
                      Occupancy
                    </span>
                    <span className="font-equip text-xs text-gdd-black/50">
                      {soldPercent + reservedPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gdd-black/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-l-full transition-all"
                      style={{
                        width: `${soldPercent}%`,
                        backgroundColor: bgColor,
                      }}
                    />
                    {reservedPercent > 0 && (
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${reservedPercent}%`,
                          backgroundColor: bgColor,
                          opacity: 0.4,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: bgColor }}
                      />
                      <span className="font-equip text-[10px] text-gdd-black/40">
                        Sold
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: bgColor, opacity: 0.4 }}
                      />
                      <span className="font-equip text-[10px] text-gdd-black/40">
                        Reserved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inclusions */}
                <div>
                  <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                    Includes
                  </p>
                  <ul className="space-y-1.5">
                    {ticket.includes.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 font-equip text-sm text-gdd-black/60"
                      >
                        <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={Ticket}
          label="Total Tickets"
          value={totalTickets.toLocaleString()}
          index={3}
        />
        <StatsCard
          icon={Users}
          label="Total Sold"
          value={totalSold.toLocaleString()}
          index={4}
        />
        <StatsCard
          icon={DollarSign}
          label="Ticket Revenue"
          value={formatCurrency(totalRevenue)}
          index={5}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        title={`Edit ${editingTicket?.name || 'Ticket'}`}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Tier Name">
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Price ($)">
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Total Seats">
            <input
              type="number"
              value={form.totalSeats || ''}
              onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>
          <FormField label="Includes (one per line)">
            <textarea
              value={form.includes || ''}
              onChange={(e) => setForm({ ...form, includes: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingTicket(null)}
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

function StatItem({ label, value }) {
  return (
    <div className="bg-sand-light/30 rounded-sm px-3 py-2">
      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
        {label}
      </p>
      <p className="font-medino text-lg text-gdd-black">{value}</p>
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
