import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import BookingDetailModal from '@/components/bookings/BookingDetailModal'
import { useBookings } from '@/api/hooks/useBookings'
import { formatCurrency } from '@/utils/formatCurrency'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancellation-pending', label: 'Cancellation Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const paymentOptions = [
  { value: '', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const columns = [
  { key: 'ref', label: 'Ref', cellClassName: 'font-medium text-gdd-black' },
  {
    key: 'guest',
    label: 'Guest',
    render: (_v, row) =>
      `${row.guestFirstName || ''} ${row.guestLastName || ''}`.trim() ||
      row.userId?.firstName ||
      '—',
  },
  {
    key: 'guestEmail',
    label: 'Email',
    render: (val, row) => (
      <span className="max-w-[200px] truncate block" title={val || row.userId?.email}>
        {val || row.userId?.email || '—'}
      </span>
    ),
  },
  {
    key: 'ticketTier',
    label: 'Tier',
    render: (val) => (
      <span className="font-equip text-xs font-medium uppercase tracking-widest-plus">
        {val || '—'}
      </span>
    ),
  },
  {
    key: 'seats',
    label: 'Seats',
    render: (val) => val?.length || 0,
  },
  {
    key: 'total',
    label: 'Total',
    render: (val) => formatCurrency(val),
  },
  {
    key: 'paymentStatus',
    label: 'Payment',
    render: (val) => <StatusBadge status={val} />,
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => <StatusBadge status={val} />,
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (val) =>
      new Date(val).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
  },
]

export default function BookingsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPaymentStatus('')
    setFrom('')
    setTo('')
    setPage(1)
  }
  const hasFilters = search || status || paymentStatus || from || to

  const params = {
    page,
    limit: 25,
    ...(search && { search }),
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(from && { from }),
    ...(to && { to }),
  }

  const { data, isLoading, isError, refetch } = useBookings(params)
  const rows = data?.data || []
  const total = data?.total || 0

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${total} total bookings`} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search ref, guest, hotel, package, promo, flight..."
          className="w-full sm:w-80"
        />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1) }}
          options={statusOptions}
          placeholder=""
          className="w-full sm:w-52"
        />
        <Select
          value={paymentStatus}
          onChange={(v) => { setPaymentStatus(v); setPage(1) }}
          options={paymentOptions}
          placeholder=""
          className="w-full sm:w-44"
        />
        <div>
          <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div>
          <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm">
        {isError ? (
          <div className="py-16 text-center">
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load bookings.</p>
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
            emptyMessage="No bookings match your filters"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </div>

      <BookingDetailModal bookingId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
