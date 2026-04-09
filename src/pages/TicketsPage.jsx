import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Check, Ticket, DollarSign, Users, Plus, Trash2, RotateCcw, PowerOff } from 'lucide-react'
import {
  useTickets,
  useCreateTicket,
  useUpdateTicket,
  useDeactivateTicket,
  useReactivateTicket,
  useDeleteTicket,
} from '@/api/hooks/useTickets'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatsCard from '@/components/ui/StatsCard'
import StatusFilter from '@/components/ui/StatusFilter'
import SearchInput from '@/components/ui/SearchInput'
import TagListInput from '@/components/ui/TagListInput'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const tierBorderColors = {
  general: 'border-l-[#C9A96E]',
  premium: 'border-l-[#B8860B]',
  vip:     'border-l-[#FFD700]',
}

const tierBgColors = {
  general: '#C9A96E',
  premium: '#B8860B',
  vip:     '#FFD700',
}

const emptyTicket = {
  ticketId: '',
  tier: 'general',
  name: '',
  price: '',
  currency: 'USD',
  totalSeats: '',
  description: '',
  includes: [],
  color: '',
  soldOut: false,
}

export default function TicketsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')

  const { data, isLoading, isError } = useTickets({
    limit: 50,
    search: search || undefined,
    status,
  })
  const tickets = data?.data || []

  const createTicket     = useCreateTicket()
  const updateTicket     = useUpdateTicket()
  const deactivateTicket = useDeactivateTicket()
  const reactivateTicket = useReactivateTicket()
  const deleteTicket     = useDeleteTicket()

  const [editingTicket, setEditingTicket] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyTicket })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const totalTickets = tickets.reduce((sum, t) => sum + (t.totalSeats || 0), 0)
  const totalSold    = tickets.reduce((sum, t) => sum + (t.soldCount || 0), 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + (t.soldCount || 0) * (t.price || 0), 0)

  const openAdd = () => {
    setForm({ ...emptyTicket })
    setIsAdding(true)
  }

  const openEdit = (ticket) => {
    setEditingTicket(ticket)
    setForm({
      ticketId:    ticket.ticketId || '',
      tier:        ticket.tier || 'general',
      name:        ticket.name || '',
      price:       ticket.price ?? '',
      currency:    ticket.currency || 'USD',
      totalSeats:  ticket.totalSeats ?? '',
      description: ticket.description || '',
      includes:    ticket.includes || [],
      color:       ticket.color || '',
      soldOut:     !!ticket.soldOut,
    })
  }

  const closeModal = () => {
    setEditingTicket(null)
    setIsAdding(false)
  }

  const handleSave = () => {
    const payload = {
      ticketId:    form.ticketId.trim() || `ticket-${Date.now()}`,
      tier:        form.tier,
      name:        form.name.trim(),
      price:       Number(form.price) || 0,
      currency:    form.currency || 'USD',
      totalSeats:  Number(form.totalSeats) || 0,
      description: form.description,
      includes:    form.includes,
      color:       form.color,
      soldOut:     !!form.soldOut,
    }
    if (isAdding) {
      createTicket.mutate(payload, { onSuccess: closeModal })
    } else {
      updateTicket.mutate({ id: editingTicket._id, ...payload }, { onSuccess: closeModal })
    }
  }

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle="Manage ticket tiers and pricing"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tier
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by tier name..."
          className="flex-1"
        />
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load tickets.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {tickets.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-sm">
              <p className="font-equip text-sm text-gdd-black/30">No tickets match the current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {tickets.map((ticket, i) => {
                const sold = ticket.soldCount || 0
                const total = ticket.totalSeats || 0
                const available = Math.max(0, total - sold)
                const soldPercent = total > 0 ? Math.round((sold / total) * 100) : 0
                const bgColor = tierBgColors[ticket.tier] || '#D4985A'
                const isInactive = ticket.isActive === false

                return (
                  <motion.div
                    key={ticket._id}
                    className={cn(
                      'bg-white rounded-sm shadow-sm border-l-4 overflow-hidden relative',
                      tierBorderColors[ticket.tier] || 'border-l-gold',
                      isInactive && 'opacity-60'
                    )}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                  >
                    {isInactive && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-gdd-black/80 text-white font-equip text-[9px] tracking-widest-plus uppercase rounded-sm">
                        Inactive
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(isInactive && 'mt-4')}>
                          <h3 className="font-medino text-xl text-gdd-black">{ticket.name}</h3>
                          <p className="font-equip font-medium text-2xl text-gdd-black mt-1">
                            {formatCurrency(ticket.price || 0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => openEdit(ticket)}
                            className="flex items-center gap-1.5 px-3 py-1.5 font-equip text-xs font-medium uppercase tracking-widest-plus text-gold hover:text-gold-deep border border-gold/20 hover:border-gold/40 rounded-sm transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          {isInactive ? (
                            <button
                              onClick={() => reactivateTicket.mutate(ticket._id)}
                              className="p-1.5 border border-green-200 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                              title="Reactivate"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => deactivateTicket.mutate(ticket._id)}
                              className="p-1.5 border border-orange/30 text-orange hover:bg-orange/10 rounded-sm transition-colors"
                              title="Deactivate (admin can still see)"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(ticket)}
                            className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                            title="Delete (hide from admin too)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <StatItem label="Total" value={total} />
                        <StatItem label="Sold" value={sold} />
                        <StatItem label="Available" value={available} />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Occupancy</span>
                          <span className="font-equip text-xs text-gdd-black/50">{soldPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gdd-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${soldPercent}%`, backgroundColor: bgColor }}
                          />
                        </div>
                      </div>

                      {ticket.includes?.length > 0 && (
                        <div>
                          <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">Includes</p>
                          <ul className="space-y-1.5">
                            {ticket.includes.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 font-equip text-sm text-gdd-black/60">
                                <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard icon={Ticket}     label="Total Capacity" value={totalTickets.toLocaleString()} index={3} />
            <StatsCard icon={Users}      label="Tickets Sold"   value={totalSold.toLocaleString()}    index={4} />
            <StatsCard icon={DollarSign} label="Ticket Revenue" value={formatCurrency(totalRevenue)}  index={5} />
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!editingTicket || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Ticket Tier' : `Edit ${editingTicket?.name || 'Ticket'}`}
        size="md"
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
              disabled={createTicket.isPending || updateTicket.isPending}
              className="px-6 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {createTicket.isPending || updateTicket.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ticket ID (slug)">
              <input
                type="text"
                value={form.ticketId}
                onChange={(e) => setForm({ ...form, ticketId: e.target.value })}
                placeholder="e.g. general-2026"
                disabled={!isAdding}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-sand-light/50 disabled:text-gdd-black/40"
              />
            </FormField>
            <FormField label="Tier">
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="general">general</option>
                <option value="premium">premium</option>
                <option value="vip">vip</option>
              </select>
            </FormField>
          </div>

          <FormField label="Tier Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
            <FormField label="Total Seats">
              <input
                type="number"
                value={form.totalSeats}
                onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </FormField>

          <FormField label="What's Included">
            <TagListInput
              value={form.includes}
              onChange={(items) => setForm({ ...form, includes: items })}
              placeholder="e.g. Welcome drink"
              addLabel="Add inclusion"
              emptyMessage="No inclusions yet."
            />
          </FormField>

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
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Ticket Tier"
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
                deleteTicket.mutate(deleteConfirm._id, { onSuccess: () => setDeleteConfirm(null) })
              }}
              disabled={deleteTicket.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteTicket.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete <strong>{deleteConfirm?.name}</strong>?
        </p>
        <p className="font-equip text-xs text-gdd-black/40">
          This will hide the tier from BOTH the customer site and the admin panel. Use Deactivate (the orange button) instead if you might want it back.
        </p>
      </Modal>
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="bg-sand-light/30 rounded-sm px-3 py-2">
      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">{label}</p>
      <p className="font-equip font-medium text-lg text-gdd-black">{value}</p>
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
