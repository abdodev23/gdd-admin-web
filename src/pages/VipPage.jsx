import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, UserCheck, Clock, HelpCircle, Plus, Copy, Check, Link } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'

const TOTAL_VVIP = 150

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'unassigned', label: 'Unassigned' },
]

const columns = [
  { key: 'guestName', label: 'Guest Name', cellClassName: 'font-medium text-gdd-black' },
  { key: 'email', label: 'Email', render: (val) => val || <span className="text-gdd-black/25 italic">--</span> },
  { key: 'phone', label: 'Phone', render: (val) => val || <span className="text-gdd-black/25 italic">--</span> },
  { key: 'ticketId', label: 'Ticket ID', render: (val) => (
    <span className="font-equip text-xs font-medium tracking-widest-plus uppercase">{val}</span>
  )},
  { key: 'seatId', label: 'Seat ID', render: (val) => (
    <span className="font-equip text-xs font-medium tracking-widest-plus uppercase">{val}</span>
  )},
  { key: 'assignedBy', label: 'Assigned By' },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  { key: 'lastContact', label: 'Last Contact', render: (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-gdd-black/25 italic">--</span> },
  { key: 'assignedAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
]

export default function VipPage() {
  const { vipAllocations, addItem, updateItem } = useDataStore()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ guestName: '', email: '', seatId: '', phone: '', lastContact: '' })
  const [selectedAllocation, setSelectedAllocation] = useState(null)
  const [copied, setCopied] = useState(false)

  const counts = useMemo(() => {
    const confirmed = vipAllocations.filter((v) => v.status === 'confirmed').length
    const allocated = vipAllocations.filter((v) => v.status === 'allocated').length
    const unassigned = TOTAL_VVIP - confirmed - allocated
    return { confirmed, allocated, unassigned }
  }, [vipAllocations])

  const allocatedTotal = counts.confirmed + counts.allocated
  const progressPct = (allocatedTotal / TOTAL_VVIP) * 100

  const filtered = useMemo(() => {
    let result = [...vipAllocations]
    if (statusFilter) result = result.filter((v) => v.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((v) =>
        v.guestName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.ticketId.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
  }, [vipAllocations, statusFilter, search])

  const handleAdd = () => {
    if (!form.guestName.trim()) return
    const nextNum = vipAllocations.length + 1
    addItem('vipAllocations', {
      guestName: form.guestName,
      email: form.email,
      phone: form.phone,
      lastContact: form.lastContact ? new Date(form.lastContact).toISOString() : null,
      inviteLink: null,
      ticketId: `VIP-${String(nextNum).padStart(3, '0')}`,
      seatId: form.seatId || `vvip-TBD-${nextNum}`,
      assignedBy: 'Admin',
      status: 'allocated',
      assignedAt: new Date().toISOString(),
    })
    setForm({ guestName: '', email: '', seatId: '', phone: '', lastContact: '' })
    setModalOpen(false)
  }

  const handleGenerateInviteLink = (allocation) => {
    const link = `https://galadedanza.com/vip/invite/${allocation.ticketId}`
    updateItem('vipAllocations', allocation.id, { inviteLink: link })
    setSelectedAllocation({ ...allocation, inviteLink: link })
  }

  const handleCopyInviteLink = async (link) => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    { label: 'Confirmed', count: counts.confirmed, icon: UserCheck, color: 'text-status-green' },
    { label: 'Allocated', count: counts.allocated, icon: Clock, color: 'text-gold-deep' },
    { label: 'Unassigned', count: counts.unassigned, icon: HelpCircle, color: 'text-status-blue' },
  ]

  return (
    <div>
      <PageHeader
        title="VIP Management"
        subtitle={`${TOTAL_VVIP} VVIP tickets — operational allocation`}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Allocation
          </button>
        }
      />

      {/* Progress Bar */}
      <motion.div className="bg-white p-5 rounded-sm shadow-sm mb-6" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">Allocation Progress</span>
          <span className="font-equip text-sm font-medium text-gdd-black">{allocatedTotal} / {TOTAL_VVIP}</span>
        </div>
        <div className="w-full h-3 bg-gdd-black/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="font-equip text-[10px] text-gdd-black/40">Allocated ({allocatedTotal})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gdd-black/10" />
            <span className="font-equip text-[10px] text-gdd-black/40">Unassigned ({counts.unassigned})</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white p-5 rounded-sm shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i + 1}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{card.label}</p>
                <p className="font-equip font-medium text-2xl text-gdd-black mt-1">{card.count}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-30`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gdd-black/5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search guests..." className="w-full sm:w-64" />
          <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions.slice(1)} placeholder="All Statuses" className="w-full sm:w-48" />
        </div>
        <DataTable columns={columns} data={filtered} onRowClick={(row) => setSelectedAllocation(row)} emptyMessage="No VIP allocations found" />
      </motion.div>

      {/* Add Allocation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add VIP Allocation">
        <div className="space-y-4">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Guest Name</label>
            <input
              type="text"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="guest@example.com"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1-555-0142"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Last Contact</label>
            <input
              type="datetime-local"
              value={form.lastContact}
              onChange={(e) => setForm({ ...form, lastContact: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Seat ID</label>
            <input
              type="text"
              value={form.seatId}
              onChange={(e) => setForm({ ...form, seatId: e.target.value })}
              placeholder="e.g. vvip-A-15"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Add Allocation
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedAllocation} onClose={() => { setSelectedAllocation(null); setCopied(false) }} title={`VIP Allocation — ${selectedAllocation?.ticketId}`} size="lg">
        {selectedAllocation && (
          <div className="space-y-6">
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Guest Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Guest Name</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.guestName}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Email</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.email || '—'}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Phone</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.phone || '—'}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Last Contact</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">
                    {selectedAllocation.lastContact
                      ? new Date(selectedAllocation.lastContact).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Allocation Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Ticket ID</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.ticketId}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Seat ID</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.seatId}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Assigned By</p>
                  <div className="font-equip text-sm text-gdd-black mt-0.5">{selectedAllocation.assignedBy}</div>
                </div>
                <div>
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Status</p>
                  <div className="mt-0.5"><StatusBadge status={selectedAllocation.status} /></div>
                </div>
              </div>
            </div>

            {/* Invite Link Section */}
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Invite Link</h3>
              {selectedAllocation.inviteLink ? (
                <div className="flex items-center gap-3 bg-sand-light/30 p-4 rounded-sm">
                  <Link className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="font-equip text-sm text-gdd-black truncate flex-1">{selectedAllocation.inviteLink}</span>
                  <button
                    onClick={() => handleCopyInviteLink(selectedAllocation.inviteLink)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gdd-black text-white font-equip text-xs rounded-sm hover:bg-gdd-black/90 transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateInviteLink(selectedAllocation)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  Generate Invite Link
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
