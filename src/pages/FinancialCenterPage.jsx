import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, FileText, Clock, AlertCircle } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchInput from '@/components/ui/SearchInput'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'rejected', label: 'Rejected' },
]

const statusMap = {
  paid: 'confirmed',
  pending: 'pending',
  failed: 'cancelled',
  refunded: 'refunded',
  rejected: 'cancelled',
}

const typeBadgeColors = {
  Ticket: 'bg-gold/10 text-gold-deep',
  Hotel: 'bg-status-blue/10 text-status-blue',
  Activity: 'bg-status-green/10 text-status-green',
  Transfer: 'bg-purple-100 text-purple-700',
  Insurance: 'bg-orange-100 text-orange-700',
}

const typePrefixes = {
  Ticket: 'TK',
  Hotel: 'HT',
  Activity: 'ACT',
  Transfer: 'TRF',
  Insurance: 'INS',
}

const columns = [
  { key: 'id', label: 'Log ID', cellClassName: 'font-medium text-gdd-black', render: (val) => (
    <span className="font-equip text-xs font-medium tracking-widest-plus uppercase">{val}</span>
  )},
  { key: 'type', label: 'Type', render: (val) => (
    <span className={cn('inline-block px-2 py-0.5 rounded-sm font-equip text-[10px] font-medium tracking-widest-plus uppercase', typeBadgeColors[val] || 'bg-gdd-black/5 text-gdd-black/60')}>
      {val}
    </span>
  )},
  { key: 'customerName', label: 'Customer' },
  { key: 'description', label: 'Description', render: (val) => (
    <span className="max-w-[200px] truncate block" title={val}>{val}</span>
  )},
  { key: 'amount', label: 'Amount', render: (val) => formatCurrency(val) },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={statusMap[val] || val} /> },
  { key: 'isDiscounted', label: 'Discount', render: (val, row) => val ? (
    <span className="font-equip text-xs text-gold-deep">{row.discountMethod}</span>
  ) : (
    <span className="text-gdd-black/25 italic">--</span>
  )},
  { key: 'lastActivity', label: 'Last Activity', render: (val) => val ? (
    <div>
      <p className="font-equip text-xs text-gdd-black">{val.action}</p>
      <p className="font-equip text-[10px] text-gdd-black/40">{val.admin}</p>
    </div>
  ) : <span className="text-gdd-black/25 italic">--</span> },
  { key: 'paymentInvoice', label: 'Invoice', render: (val) => val ? (
    <a href={val} target="_blank" rel="noopener noreferrer" className="font-equip text-xs text-gold-deep hover:underline" onClick={(e) => e.stopPropagation()}>
      Download
    </a>
  ) : (
    <span className="text-gdd-black/25">&mdash;</span>
  )},
]

export default function FinancialCenterPage() {
  const { financialLog } = useDataStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedEntry, setSelectedEntry] = useState(null)

  const stats = useMemo(() => {
    const paidEntries = financialLog.filter((e) => e.status === 'paid')
    const totalRevenue = paidEntries.reduce((sum, e) => sum + e.amount, 0)
    const paidCount = paidEntries.length
    const pendingCount = financialLog.filter((e) => e.status === 'pending').length
    const failedRejectedCount = financialLog.filter((e) => e.status === 'failed' || e.status === 'rejected').length
    return { totalRevenue, paidCount, pendingCount, failedRejectedCount }
  }, [financialLog])

  const filtered = useMemo(() => {
    let result = [...financialLog]
    if (activeTab !== 'all') result = result.filter((e) => e.status === activeTab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) =>
        e.customerName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.bookingRef.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [financialLog, activeTab, search])

  return (
    <div>
      <PageHeader
        title="Financial Center"
        subtitle="Track all bookings, payments and invoices"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.totalRevenue)} index={0} />
        <StatsCard icon={FileText} label="Paid" value={stats.paidCount} index={1} />
        <StatsCard icon={Clock} label="Pending" value={stats.pendingCount} index={2} />
        <StatsCard icon={AlertCircle} label="Failed / Rejected" value={stats.failedRejectedCount} index={3} />
      </div>

      {/* Filter Tabs + Search + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gdd-black/5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-3 py-1.5 font-equip text-xs rounded-sm transition-colors whitespace-nowrap',
                  activeTab === tab.value
                    ? 'bg-gdd-black text-white'
                    : 'text-gdd-black/50 hover:text-gdd-black hover:bg-gdd-black/5'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID, booking ref..." className="w-full sm:w-72 sm:ml-auto" />
        </div>
        <DataTable columns={columns} data={filtered} onRowClick={(row) => setSelectedEntry(row)} emptyMessage="No financial records found" />
      </motion.div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={`Financial Log — ${selectedEntry?.id}`} size="lg">
        {selectedEntry && (
          <div className="space-y-6">
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Entry Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Log ID" value={selectedEntry.id} />
                <DetailRow label="Booking Ref" value={selectedEntry.bookingRef} />
                <DetailRow label="Type" value={
                  <span className={cn('inline-block px-2 py-0.5 rounded-sm font-equip text-[10px] font-medium tracking-widest-plus uppercase', typeBadgeColors[selectedEntry.type])}>
                    {typePrefixes[selectedEntry.type]}
                  </span>
                } />
                <DetailRow label="Status" value={<StatusBadge status={statusMap[selectedEntry.status] || selectedEntry.status} />} />
              </div>
            </div>

            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Customer</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Name" value={selectedEntry.customerName} />
                <DetailRow label="Email" value={selectedEntry.email} />
              </div>
            </div>

            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Financial</h3>
              <div className="space-y-2 bg-sand-light/30 p-4 rounded-sm">
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Description</span>
                  <span>{selectedEntry.description}</span>
                </div>
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Amount</span>
                  <span className="font-medium text-gdd-black">{formatCurrency(selectedEntry.amount)}</span>
                </div>
                {selectedEntry.isDiscounted && (
                  <>
                    <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                      <span>Discount Method</span>
                      <span className="text-gold-deep">{selectedEntry.discountMethod}</span>
                    </div>
                    <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                      <span>Discount Amount</span>
                      <span className="text-status-red">-{formatCurrency(selectedEntry.discountAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Last Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Admin" value={selectedEntry.lastActivity?.admin || '—'} />
                <DetailRow label="Action" value={selectedEntry.lastActivity?.action || '—'} />
                <DetailRow label="Date" value={selectedEntry.lastActivity?.date ? new Date(selectedEntry.lastActivity.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
              </div>
            </div>

            {selectedEntry.paymentInvoice && (
              <div>
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Invoice</h3>
                <a href={selectedEntry.paymentInvoice} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors">
                  <FileText className="w-4 h-4" />
                  Download Invoice
                </a>
              </div>
            )}

            <DetailRow label="Created At" value={new Date(selectedEntry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">{label}</p>
      <div className="font-equip text-sm text-gdd-black mt-0.5">{value}</div>
    </div>
  )
}
