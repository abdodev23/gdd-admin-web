import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Inbox, Loader, CheckCircle } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

const columns = [
  { key: 'customerName', label: 'Customer', cellClassName: 'font-medium text-gdd-black' },
  { key: 'originalLanguage', label: 'Language', render: (val, row) => (
    <span className="font-equip text-sm">
      {row.languageFlag} <span className="uppercase text-xs tracking-widest-plus text-gdd-black/40 ml-1">{val}</span>
    </span>
  )},
  { key: 'message', label: 'Message', render: (val) => (
    <span className="text-gdd-black/60">{val.length > 60 ? `${val.slice(0, 60)}...` : val}</span>
  )},
  { key: 'bookingId', label: 'Booking ID', render: (val) => (
    <span className="font-equip text-xs font-medium tracking-widest-plus uppercase">{val}</span>
  )},
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
]

export default function RequestsPage() {
  const { requests, updateItem } = useDataStore()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const counts = useMemo(() => ({
    new: requests.filter((r) => r.status === 'new').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  }), [requests])

  const filtered = useMemo(() => {
    let result = [...requests]
    if (statusFilter) result = result.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        r.bookingId.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [requests, statusFilter, search])

  const handleStatusChange = (id, newStatus) => {
    updateItem('requests', id, { status: newStatus })
    setSelectedRequest((prev) => prev ? { ...prev, status: newStatus } : null)
  }

  const statCards = [
    { label: 'New', count: counts.new, icon: Inbox, color: 'text-gdd-black/30' },
    { label: 'In Progress', count: counts['in-progress'], icon: Loader, color: 'text-gold-deep' },
    { label: 'Resolved', count: counts.resolved, icon: CheckCircle, color: 'text-status-green' },
  ]

  const isDifferentLanguage = selectedRequest && selectedRequest.originalLanguage !== 'en'

  return (
    <div>
      <PageHeader
        title="Special Requests"
        subtitle={`${requests.length} total requests`}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="bg-white p-5 rounded-sm shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{card.label}</p>
                <p className="font-medino text-2xl text-gdd-black mt-1">{card.count}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-30`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gdd-black/5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." className="w-full sm:w-64" />
          <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" className="w-full sm:w-48" />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => setSelectedRequest(row)}
          emptyMessage="No requests found"
        />
      </motion.div>

      {/* Request Detail Modal */}
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Request Details" size="lg">
        {selectedRequest && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-sm font-medium text-gdd-black">{selectedRequest.customerName}</p>
                <p className="font-equip text-xs text-gdd-black/40 mt-0.5">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <StatusBadge status={selectedRequest.status} />
            </div>

            {/* Original message */}
            <div>
              <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                Original Message {selectedRequest.languageFlag}
              </p>
              <div className="p-4 bg-sand-light/50 rounded-sm">
                <p className="font-equip text-sm text-gdd-black leading-relaxed">{selectedRequest.message}</p>
              </div>
            </div>

            {/* Translated message */}
            {isDifferentLanguage && (
              <div>
                <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                  Translated Message (English)
                </p>
                <div className="p-4 bg-gold/5 rounded-sm border border-gold/10">
                  <p className="font-equip text-sm text-gdd-black leading-relaxed">{selectedRequest.translatedMessage}</p>
                </div>
              </div>
            )}

            {/* Booking reference */}
            <div>
              <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">
                Booking Reference
              </p>
              <span className="inline-block px-3 py-1 bg-gdd-black/5 rounded-sm font-equip text-xs font-medium tracking-widest-plus uppercase text-gdd-black">
                {selectedRequest.bookingId}
              </span>
            </div>

            {/* Status workflow buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-gdd-black/5">
              {selectedRequest.status === 'new' && (
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'in-progress')}
                  className="px-5 py-2 bg-gold text-white font-equip text-sm rounded-sm hover:bg-gold-deep transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              {selectedRequest.status === 'in-progress' && (
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'resolved')}
                  className="px-5 py-2 bg-status-green text-white font-equip text-sm rounded-sm hover:bg-status-green/90 transition-colors"
                >
                  Mark Resolved
                </button>
              )}
              {selectedRequest.status === 'resolved' && (
                <span className="font-equip text-xs text-gdd-black/30">This request has been resolved.</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
