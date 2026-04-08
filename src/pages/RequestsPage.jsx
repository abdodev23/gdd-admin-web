import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import SpecialRequestModal from '@/components/requests/SpecialRequestModal'
import { useSpecialRequests } from '@/api/hooks/useSpecialRequests'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const TABS = [
  { id: 'special', label: 'Special Requests' },
  { id: 'modifications', label: 'Modifications' },
  { id: 'cancellations', label: 'Cancellations' },
  { id: 'contact', label: 'Contact' },
  { id: 'waitlist', label: 'Waitlist' },
]

function TabButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-equip text-xs tracking-widest-plus uppercase transition-colors flex items-center gap-2 ${
        active
          ? 'border-b-2 border-gdd-black text-gdd-black'
          : 'border-b-2 border-transparent text-gdd-black/40 hover:text-gdd-black/70'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
          active ? 'bg-gdd-black text-white' : 'bg-gdd-black/5 text-gdd-black/40'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('special')

  return (
    <div>
      <PageHeader title="Requests" subtitle="Customer requests, modifications, and inbound messages" />

      {/* Tabs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="border-b border-gdd-black/10 mb-6 flex flex-wrap"
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </motion.div>

      {/* Tab content */}
      {activeTab === 'special' && <SpecialRequestsTab />}
      {activeTab === 'modifications' && <PlaceholderTab title="Booking Modifications" message="Coming in Phase 4 Slice E." />}
      {activeTab === 'cancellations' && <PlaceholderTab title="Cancellations" message="Coming in Phase 4 Slice B." />}
      {activeTab === 'contact' && <PlaceholderTab title="Contact" message="Coming in Phase 4 Slice C." />}
      {activeTab === 'waitlist' && <PlaceholderTab title="Waitlist" message="Coming in Phase 4 Slice C." />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Special Requests tab
// ---------------------------------------------------------------------------

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in-review', label: 'In Review' },
  { value: 'awaiting-payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'declined', label: 'Declined' },
]

const columns = [
  { key: 'bookingRef', label: 'Booking', cellClassName: 'font-medium text-gdd-black' },
  { key: 'guestName', label: 'Guest' },
  {
    key: 'guestEmail',
    label: 'Email',
    render: (val) => (
      <span className="max-w-[180px] truncate block" title={val}>{val || '—'}</span>
    ),
  },
  {
    key: 'originalLanguage',
    label: 'Lang',
    render: (val, row) => (
      <span className="font-equip text-xs">
        {row.languageFlag} <span className="uppercase tracking-widest-plus text-gdd-black/40">{val}</span>
      </span>
    ),
  },
  {
    key: 'originalMessage',
    label: 'Message',
    render: (val) => (
      <span className="text-gdd-black/60 line-clamp-1 max-w-[280px] block" title={val}>
        {val?.length > 80 ? `${val.slice(0, 80)}…` : val}
      </span>
    ),
  },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  {
    key: 'createdAt',
    label: 'Date',
    render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  },
]

function SpecialRequestsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const params = {
    page,
    limit: 25,
    ...(search && { search }),
    ...(status && { status }),
  }

  const { data, isLoading, isError, refetch } = useSpecialRequests(params)
  const rows = data?.data || []
  const total = data?.total || 0

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPage(1)
  }
  const hasFilters = search || status

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search ref, guest, message…"
          className="w-full sm:w-80"
        />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          options={statusOptions}
          placeholder=""
          className="w-full sm:w-52"
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-sm shadow-sm">
        {isError ? (
          <div className="py-16 text-center">
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load special requests.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            onRowClick={(row) => setSelectedId(row._id)}
            emptyMessage="No special requests yet"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <SpecialRequestModal requestId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Placeholder for other tabs (filled in by later slices)
// ---------------------------------------------------------------------------

function PlaceholderTab({ title, message }) {
  return (
    <div className="bg-white rounded-sm shadow-sm py-20 text-center">
      <p className="font-medino text-2xl text-gdd-black/40 mb-2">{title}</p>
      <p className="font-equip text-sm text-gdd-black/30">{message}</p>
    </div>
  )
}
