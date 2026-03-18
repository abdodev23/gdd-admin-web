import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Inbox, Loader, CheckCircle, Clock } from 'lucide-react'
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
  { key: 'categories', label: 'Categories', render: (val) => (
    <span className="font-equip text-xs text-gdd-black/60">
      {Array.isArray(val) && val.length > 0 ? val.join(', ') : '—'}
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

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-equip text-xs tracking-widest-plus uppercase transition-colors ${
        active
          ? 'border-b-2 border-gdd-black text-gdd-black'
          : 'text-gdd-black/40 hover:text-gdd-black/70'
      }`}
    >
      {children}
    </button>
  )
}

export default function RequestsPage() {
  const { requests, updateItem, generatePaymentLink, markPaymentLinkPaid, saveProposal } = useDataStore()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [activeTab, setActiveTab] = useState('communication')
  const [proposalForm, setProposalForm] = useState({ description: '', quotationAmount: '' })
  const [copiedLink, setCopiedLink] = useState(false)

  const counts = useMemo(() => ({
    new: requests.filter((r) => r.status === 'new').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
    awaitingPayment: requests.filter((r) => r.paymentLink?.status === 'pending').length,
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

  const openRequest = (row) => {
    setSelectedRequest(row)
    setActiveTab('communication')
    setProposalForm({ description: row.proposal?.description || '', quotationAmount: row.proposal?.quotationAmount || '' })
    setCopiedLink(false)
  }

  const handleSaveProposal = () => {
    if (!proposalForm.description || !selectedRequest) return
    const proposal = { description: proposalForm.description, quotationAmount: parseFloat(proposalForm.quotationAmount) || 0 }
    saveProposal(selectedRequest.id, proposal)
    setSelectedRequest((prev) => prev ? { ...prev, proposal: { ...proposal, createdAt: new Date().toISOString() } } : null)
  }

  const handleGenerateLink = () => {
    if (!selectedRequest?.proposal) return
    const link = generatePaymentLink(selectedRequest.id, selectedRequest.proposal.quotationAmount)
    setSelectedRequest((prev) => prev ? { ...prev, paymentLink: link } : null)
  }

  const handleMarkPaid = () => {
    if (!selectedRequest) return
    markPaymentLinkPaid(selectedRequest.id)
    setSelectedRequest((prev) =>
      prev ? { ...prev, paymentLink: { ...prev.paymentLink, status: 'paid' } } : null
    )
  }

  const handleCopyLink = () => {
    if (!selectedRequest?.paymentLink) return
    navigator.clipboard.writeText(selectedRequest.paymentLink.url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Get live request data from store
  const liveRequest = selectedRequest ? requests.find((r) => r.id === selectedRequest.id) || selectedRequest : null

  const statCards = [
    { label: 'New', count: counts.new, icon: Inbox, color: 'text-gdd-black/30' },
    { label: 'In Progress', count: counts['in-progress'], icon: Loader, color: 'text-gold-deep' },
    { label: 'Resolved', count: counts.resolved, icon: CheckCircle, color: 'text-status-green' },
    { label: 'Awaiting Payment', count: counts.awaitingPayment, icon: Clock, color: 'text-status-blue' },
  ]

  const isDifferentLanguage = liveRequest && liveRequest.originalLanguage !== 'en'

  return (
    <div>
      <PageHeader
        title="Special Requests"
        subtitle={`${requests.length} total requests`}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
          <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." className="w-full sm:w-64" />
          <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" className="w-full sm:w-48" />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={openRequest}
          emptyMessage="No requests found"
        />
      </motion.div>

      {/* Request Detail Modal */}
      <Modal isOpen={!!liveRequest} onClose={() => setSelectedRequest(null)} title="Request Details" size="lg">
        {liveRequest && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-equip text-sm font-medium text-gdd-black">{liveRequest.customerName}</p>
                <p className="font-equip text-xs text-gdd-black/40 mt-0.5">
                  {new Date(liveRequest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {liveRequest.categories?.length > 0 && (
                  <div className="flex gap-1.5">
                    {liveRequest.categories.map((cat) => (
                      <span key={cat} className="px-2 py-0.5 bg-gold/10 text-gold-deep font-equip text-[10px] tracking-widest-plus uppercase rounded-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <StatusBadge status={liveRequest.status} />
              </div>
            </div>

            {/* Workflow Tabs */}
            <div className="border-b border-gdd-black/5">
              <div className="flex gap-1">
                <TabButton active={activeTab === 'communication'} onClick={() => setActiveTab('communication')}>
                  Communication
                </TabButton>
                <TabButton active={activeTab === 'proposal'} onClick={() => setActiveTab('proposal')}>
                  Proposal
                </TabButton>
                <TabButton active={activeTab === 'payment'} onClick={() => setActiveTab('payment')}>
                  Payment Link
                  {liveRequest.paymentLink?.status === 'pending' && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold-deep" />
                  )}
                </TabButton>
              </div>
            </div>

            {/* Tab: Communication */}
            {activeTab === 'communication' && (
              <div className="space-y-4">
                {/* SGI Email badge */}
                {liveRequest.emailSentToSGI && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-status-green/10 rounded-sm">
                    <CheckCircle className="w-4 h-4 text-status-green shrink-0" />
                    <div>
                      <p className="font-equip text-xs font-medium text-status-green">Email sent to SGI</p>
                      {liveRequest.emailSentAt && (
                        <p className="font-equip text-[10px] text-gdd-black/40 mt-0.5">
                          {new Date(liveRequest.emailSentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Original message */}
                <div>
                  <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                    Original Message {liveRequest.languageFlag}
                  </p>
                  <div className="p-4 bg-sand-light/50 rounded-sm">
                    <p className="font-equip text-sm text-gdd-black leading-relaxed">{liveRequest.message}</p>
                  </div>
                </div>

                {isDifferentLanguage && (
                  <div>
                    <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">
                      Translated Message (English)
                    </p>
                    <div className="p-4 bg-gold/5 rounded-sm border border-gold/10">
                      <p className="font-equip text-sm text-gdd-black leading-relaxed">{liveRequest.translatedMessage}</p>
                    </div>
                  </div>
                )}

                {/* Booking reference */}
                <div>
                  <p className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">
                    Booking Reference
                  </p>
                  <span className="inline-block px-3 py-1 bg-gdd-black/5 rounded-sm font-equip text-xs font-medium tracking-widest-plus uppercase text-gdd-black">
                    {liveRequest.bookingId}
                  </span>
                </div>

                {/* Status actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-gdd-black/5">
                  {liveRequest.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(liveRequest.id, 'in-progress')}
                      className="px-5 py-2 bg-gold text-white font-equip text-sm rounded-sm hover:bg-gold-deep transition-colors"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {liveRequest.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusChange(liveRequest.id, 'resolved')}
                      className="px-5 py-2 bg-status-green text-white font-equip text-sm rounded-sm hover:bg-status-green/90 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {liveRequest.status === 'resolved' && (
                    <span className="font-equip text-xs text-gdd-black/30">This request has been resolved.</span>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Proposal */}
            {activeTab === 'proposal' && (
              <div className="space-y-4">
                <p className="font-equip text-xs text-gdd-black/50 leading-relaxed">
                  After communicating with the client off-platform, log the agreed proposal and quotation here.
                </p>

                {liveRequest.proposal && (
                  <div className="p-4 bg-gold/5 border border-gold/20 rounded-sm">
                    <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gold-deep mb-2">Saved Proposal</p>
                    <p className="font-equip text-sm text-gdd-black mb-1">{liveRequest.proposal.description}</p>
                    <p className="font-equip text-xs text-gdd-black/50">
                      Quotation: <strong>${liveRequest.proposal.quotationAmount.toLocaleString()}</strong>
                    </p>
                    <p className="font-equip text-[10px] text-gdd-black/30 mt-1">
                      Saved {new Date(liveRequest.proposal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 block mb-1.5">
                      Proposal Description
                    </label>
                    <textarea
                      value={proposalForm.description}
                      onChange={(e) => setProposalForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe the agreed solution..."
                      className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 block mb-1.5">
                      Quotation Amount ($)
                    </label>
                    <input
                      type="number"
                      value={proposalForm.quotationAmount}
                      onChange={(e) => setProposalForm((p) => ({ ...p, quotationAmount: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-2 bg-white border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <button
                    onClick={handleSaveProposal}
                    disabled={!proposalForm.description}
                    className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-30"
                  >
                    Save Proposal
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Payment Link */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                {!liveRequest.proposal ? (
                  <div className="p-4 bg-sand-light/50 rounded-sm text-center">
                    <p className="font-equip text-sm text-gdd-black/50">Save a proposal first before generating a payment link.</p>
                    <button
                      onClick={() => setActiveTab('proposal')}
                      className="font-equip text-xs text-gold mt-2 underline underline-offset-2 hover:text-gold-deep"
                    >
                      Go to Proposal tab →
                    </button>
                  </div>
                ) : !liveRequest.paymentLink ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gold/5 border border-gold/20 rounded-sm">
                      <p className="font-equip text-xs text-gdd-black/60">Proposal amount</p>
                      <p className="font-equip font-medium text-2xl text-gdd-black">${liveRequest.proposal.quotationAmount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={handleGenerateLink}
                      className="w-full px-5 py-2.5 bg-gold text-white font-equip text-sm rounded-sm hover:bg-gold-deep transition-colors"
                    >
                      Generate Payment Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-sm border ${liveRequest.paymentLink.status === 'paid' ? 'bg-status-green/5 border-status-green/20' : 'bg-gold/5 border-gold/20'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Payment Status</p>
                        <span className={`font-equip text-xs font-medium px-2 py-0.5 rounded-full ${liveRequest.paymentLink.status === 'paid' ? 'bg-status-green/10 text-status-green' : 'bg-gold/10 text-gold-deep'}`}>
                          {liveRequest.paymentLink.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <p className="font-equip font-medium text-xl text-gdd-black">${liveRequest.paymentLink.amount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Payment Link</p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={liveRequest.paymentLink.url}
                          className="flex-1 px-3 py-2 border border-gdd-black/10 bg-gdd-black/2 font-equip text-xs text-gdd-black/60 rounded-sm"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-4 py-2 border border-gdd-black/20 font-equip text-xs text-gdd-black hover:bg-gdd-black/5 transition-colors rounded-sm shrink-0"
                        >
                          {copiedLink ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {liveRequest.paymentLink.status === 'pending' && (
                      <button
                        onClick={handleMarkPaid}
                        className="w-full px-5 py-2.5 bg-status-green text-white font-equip text-sm rounded-sm hover:bg-status-green/90 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}

                    {liveRequest.paymentLink.status === 'paid' && (
                      <div className="flex items-center gap-2 text-status-green">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-equip text-sm">Payment received</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
