import { useState, useMemo } from 'react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { formatCurrency } from '@/utils/formatCurrency'

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const tierOptions = [
  { value: 'all', label: 'All Tiers' },
  { value: 'general', label: 'General' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
]

const paymentOptions = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const columns = [
  { key: 'id', label: 'ID', cellClassName: 'font-medium text-gdd-black' },
  { key: 'customerName', label: 'Customer' },
  {
    key: 'email',
    label: 'Email',
    render: (val) => (
      <span className="max-w-[160px] truncate block" title={val}>
        {val}
      </span>
    ),
  },
  {
    key: 'ticketTier',
    label: 'Tier',
    render: (val) => (
      <span className="font-equip text-xs font-medium uppercase tracking-widest-plus">
        {val}
      </span>
    ),
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
  const { bookings } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        !search ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesTier = tierFilter === 'all' || b.ticketTier === tierFilter
      const matchesPayment =
        paymentFilter === 'all' || b.paymentStatus === paymentFilter
      return matchesSearch && matchesStatus && matchesTier && matchesPayment
    })
  }, [bookings, search, statusFilter, tierFilter, paymentFilter])

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle={`${bookings.length} total bookings`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name or email..."
          className="w-full sm:w-64"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder=""
          className="w-full sm:w-44"
        />
        <Select
          value={tierFilter}
          onChange={setTierFilter}
          options={tierOptions}
          placeholder=""
          className="w-full sm:w-40"
        />
        <Select
          value={paymentFilter}
          onChange={setPaymentFilter}
          options={paymentOptions}
          placeholder=""
          className="w-full sm:w-44"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm">
        <DataTable
          columns={columns}
          data={filteredBookings}
          onRowClick={(row) => setSelectedBooking(row)}
          emptyMessage="No bookings match your filters"
        />
      </div>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Booking ${selectedBooking?.id}`}
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Name" value={selectedBooking.customerName} />
                <DetailRow label="Email" value={selectedBooking.email} />
                <DetailRow label="Phone" value={selectedBooking.phone} />
                <DetailRow label="Country" value={selectedBooking.country} />
              </div>
            </div>

            {/* Ticket Details */}
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Ticket Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Tier"
                  value={selectedBooking.ticketTier?.toUpperCase()}
                />
                <DetailRow label="Seat" value={selectedBooking.seatId} />
                <DetailRow
                  label="Experience"
                  value={selectedBooking.experiencePath || 'None'}
                />
                <DetailRow
                  label="Status"
                  value={<StatusBadge status={selectedBooking.status} />}
                />
              </div>
            </div>

            {/* Hotel */}
            {selectedBooking.hotel && (
              <div>
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Hotel
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Hotel" value={selectedBooking.hotel} />
                  <DetailRow
                    label="Nights"
                    value={selectedBooking.hotelNights}
                  />
                </div>
              </div>
            )}

            {/* Activities */}
            {selectedBooking.activities?.length > 0 && (
              <div>
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                  Activities
                </h3>
                <ul className="space-y-1">
                  {selectedBooking.activities.map((a, i) => (
                    <li
                      key={i}
                      className="font-equip text-sm text-gdd-black/70 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transfer & Insurance */}
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Extras
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Transfer"
                  value={selectedBooking.transfer?.toUpperCase() || 'None'}
                />
                <DetailRow
                  label="Insurance"
                  value={selectedBooking.insurance ? 'Yes' : 'No'}
                />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
                Pricing Breakdown
              </h3>
              <div className="space-y-2 bg-sand-light/30 p-4 rounded-sm">
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedBooking.subtotal)}</span>
                </div>
                {selectedBooking.promoCode && (
                  <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>
                      Promo Code{' '}
                      <span className="text-gold-deep font-medium">
                        {selectedBooking.promoCode}
                      </span>
                    </span>
                    <span className="text-status-red">
                      -{formatCurrency(selectedBooking.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-equip text-sm font-medium text-gdd-black border-t border-gdd-black/10 pt-2">
                  <span>Total</span>
                  <span className="font-medino text-lg">
                    {formatCurrency(selectedBooking.total)}
                  </span>
                </div>
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Payment</span>
                  <StatusBadge status={selectedBooking.paymentStatus} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
        {label}
      </p>
      <div className="font-equip text-sm text-gdd-black mt-0.5">{value}</div>
    </div>
  )
}
