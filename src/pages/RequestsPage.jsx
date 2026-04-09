import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import SpecialRequestModal from '@/components/requests/SpecialRequestModal'
import CancellationModal from '@/components/requests/CancellationModal'
import ContactModal from '@/components/requests/ContactModal'
import BookingModificationModal from '@/components/requests/BookingModificationModal'
import { useSpecialRequests } from '@/api/hooks/useSpecialRequests'
import { useCancellations } from '@/api/hooks/useCancellations'
import { useContactSubmissions } from '@/api/hooks/useContact'
import { useWaitlist, useDeleteWaitlistEntry, downloadWaitlistCsv } from '@/api/hooks/useWaitlist'
import { useBookingModifications } from '@/api/hooks/useBookingModifications'

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
  // Persist the active tab in the URL so refresh / browser-back keeps the
  // user on the same view.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const activeTab = TABS.find((t) => t.id === tabFromUrl)?.id || 'special'
  const setActiveTab = (id) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

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
      {activeTab === 'modifications' && <ModificationsTab />}
      {activeTab === 'cancellations' && <CancellationsTab />}
      {activeTab === 'contact' && <ContactTab />}
      {activeTab === 'waitlist' && <WaitlistTab />}
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
// Cancellations tab
// ---------------------------------------------------------------------------

const cancellationStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
]

const cancellationColumns = [
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
    key: 'reason',
    label: 'Reason',
    render: (val) => (
      <span className="text-gdd-black/60 line-clamp-1 max-w-[280px] block" title={val}>
        {val?.length > 80 ? `${val.slice(0, 80)}…` : val}
      </span>
    ),
  },
  {
    key: 'refundAmount',
    label: 'Refund',
    render: (val, row) =>
      val != null ? `${val} ${row.refundCurrency || 'USD'}` : '—',
  },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  {
    key: 'createdAt',
    label: 'Date',
    render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  },
]

function CancellationsTab() {
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

  const { data, isLoading, isError, refetch } = useCancellations(params)
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
          placeholder="Search ref, guest, reason…"
          className="w-full sm:w-80"
        />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          options={cancellationStatusOptions}
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
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load cancellations.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <DataTable
            columns={cancellationColumns}
            data={rows}
            loading={isLoading}
            onRowClick={(row) => setSelectedId(row._id)}
            emptyMessage="No cancellation requests yet"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <CancellationModal requestId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Contact tab
// ---------------------------------------------------------------------------

const contactStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in-review', label: 'In Review' },
  { value: 'handled', label: 'Handled' },
]

const contactColumns = [
  { key: 'name', label: 'Name', cellClassName: 'font-medium text-gdd-black' },
  {
    key: 'email',
    label: 'Email',
    render: (val) => (
      <span className="max-w-[200px] truncate block" title={val}>{val}</span>
    ),
  },
  {
    key: 'subject',
    label: 'Subject',
    render: (val) => (
      <span className="max-w-[200px] truncate block" title={val}>{val || '(no subject)'}</span>
    ),
  },
  {
    key: 'message',
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

function ContactTab() {
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

  const { data, isLoading, isError, refetch } = useContactSubmissions(params)
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
          placeholder="Search name, email, message…"
          className="w-full sm:w-80"
        />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          options={contactStatusOptions}
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
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load contact submissions.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <DataTable
            columns={contactColumns}
            data={rows}
            loading={isLoading}
            onRowClick={(row) => setSelectedId(row._id)}
            emptyMessage="No contact submissions yet"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <ContactModal submissionId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Waitlist tab
// ---------------------------------------------------------------------------

const waitlistTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'package', label: 'Package' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'activity', label: 'Activity' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'ticket', label: 'Ticket' },
]

function WaitlistTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [itemType, setItemType] = useState('')
  const deleteEntry = useDeleteWaitlistEntry()

  const params = {
    page,
    limit: 25,
    ...(search && { search }),
    ...(itemType && { itemType }),
  }

  const { data, isLoading, isError, refetch } = useWaitlist(params)
  const rows = data?.data || []
  const total = data?.total || 0

  const clearFilters = () => {
    setSearch('')
    setItemType('')
    setPage(1)
  }
  const hasFilters = search || itemType

  const handleDelete = (id) => {
    if (window.confirm('Remove this waitlist entry?')) {
      deleteEntry.mutate(id)
    }
  }

  const handleExport = () => {
    downloadWaitlistCsv({
      ...(itemType && { itemType }),
    })
  }

  const waitlistColumns = [
    { key: 'name', label: 'Name', cellClassName: 'font-medium text-gdd-black' },
    {
      key: 'email',
      label: 'Email',
      render: (val) => (
        <span className="max-w-[200px] truncate block" title={val}>{val}</span>
      ),
    },
    {
      key: 'itemType',
      label: 'Type',
      render: (val) => (
        <span className="font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60">{val || '—'}</span>
      ),
    },
    { key: 'itemId', label: 'Item', render: (val) => val || '—' },
    { key: 'groupSize', label: 'Group', render: (val) => val ?? 1 },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      key: '_actions',
      label: '',
      render: (_val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(row._id) }}
          className="px-3 py-1 border border-red-200 font-equip text-[10px] uppercase tracking-widest-plus text-red-500 rounded-sm hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search name or email…"
          className="w-full sm:w-80"
        />
        <Select
          value={itemType}
          onChange={(v) => { setItemType(v); setPage(1) }}
          options={waitlistTypeOptions}
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
        <button
          onClick={handleExport}
          className="ml-auto px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm">
        {isError ? (
          <div className="py-16 text-center">
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load waitlist.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <DataTable
            columns={waitlistColumns}
            data={rows}
            loading={isLoading}
            emptyMessage="No waitlist entries yet"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Booking Modifications tab
// ---------------------------------------------------------------------------

const modificationStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'awaiting-payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'applied', label: 'Applied' },
  { value: 'denied', label: 'Denied' },
  { value: 'expired', label: 'Expired' },
]

const modificationSectionOptions = [
  { value: '', label: 'All Sections' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'dates', label: 'Dates' },
  { value: 'addons', label: 'Add-ons' },
  { value: 'activities', label: 'Activities' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'persons', label: 'Persons' },
  { value: 'seats', label: 'Seats' },
  { value: 'notes', label: 'Notes' },
]

const modificationColumns = [
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
    key: 'section',
    label: 'Section',
    render: (val) => (
      <span className="font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60">{val}</span>
    ),
  },
  {
    key: 'customerNote',
    label: 'Request',
    render: (val) => (
      <span className="text-gdd-black/60 line-clamp-1 max-w-[260px] block" title={val}>
        {val?.length > 80 ? `${val.slice(0, 80)}…` : val}
      </span>
    ),
  },
  {
    key: 'finalDelta',
    label: 'Δ',
    render: (val, row) =>
      val != null
        ? `${val} ${row.paymentLink?.currency || 'USD'}`
        : row.estimatedDelta != null
          ? `~${row.estimatedDelta}`
          : '—',
  },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
  {
    key: 'createdAt',
    label: 'Date',
    render: (val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  },
]

function ModificationsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [section, setSection] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const params = {
    page,
    limit: 25,
    ...(search && { search }),
    ...(status && { status }),
    ...(section && { section }),
  }

  const { data, isLoading, isError, refetch } = useBookingModifications(params)
  const rows = data?.data || []
  const total = data?.total || 0

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setSection('')
    setPage(1)
  }
  const hasFilters = search || status || section

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search ref, guest, request…"
          className="w-full sm:w-72"
        />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          options={modificationStatusOptions}
          placeholder=""
          className="w-full sm:w-44"
        />
        <Select
          value={section}
          onChange={(v) => { setSection(v); setPage(1) }}
          options={modificationSectionOptions}
          placeholder=""
          className="w-full sm:w-40"
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
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load modifications.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <DataTable
            columns={modificationColumns}
            data={rows}
            loading={isLoading}
            onRowClick={(row) => setSelectedId(row._id)}
            emptyMessage="No modification requests yet"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <BookingModificationModal requestId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}
