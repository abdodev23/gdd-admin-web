import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, FileText, TrendingDown, Download, RefreshCw } from 'lucide-react'
import { useFinances, useFinancesSummary, downloadFinancesCsv, useBackfillFinances } from '@/api/hooks/useFinances'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

// Each tab maps to a finances filter. `all` omits category + action.
const tabs = [
  { value: 'all',       label: 'All' },
  { value: 'ticket',    label: 'Tickets' },
  { value: 'package',   label: 'Packages' },
  { value: 'hotel',     label: 'Hotels' },
  { value: 'activity',  label: 'Activities' },
  { value: 'transfer',  label: 'Transfers' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'discount',  label: 'Discounts' },
  { value: 'refund',    label: 'Refunds' },
]

const categoryBadgeColors = {
  ticket:    'bg-gold/10 text-gold-deep',
  package:   'bg-gold/10 text-gold-deep',
  hotel:     'bg-status-blue/10 text-status-blue',
  activity:  'bg-status-green/10 text-status-green',
  transfer:  'bg-purple-100 text-purple-700',
  insurance: 'bg-orange-100 text-orange-700',
  discount:  'bg-gdd-black/10 text-gdd-black/70',
  refund:    'bg-red-100 text-red-700',
}

const actionOptions = [
  { value: '',        label: 'All Actions' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'refund',  label: 'Refund' },
]

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const columns = [
  {
    key: 'processedAt',
    label: 'Date',
    render: (val) => (
      <span className="font-equip text-xs text-gdd-black/70">{formatDate(val)}</span>
    ),
  },
  {
    key: 'bookingRef',
    label: 'Booking',
    cellClassName: 'font-medium text-gdd-black',
    render: (val) => (
      <span className="font-equip text-xs font-medium tracking-widest-plus uppercase">
        {val || '—'}
      </span>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    render: (val) => (
      <span
        className={cn(
          'inline-block px-2 py-0.5 rounded-sm font-equip text-[10px] font-medium tracking-widest-plus uppercase',
          categoryBadgeColors[val] || 'bg-gdd-black/5 text-gdd-black/60'
        )}
      >
        {val || '—'}
      </span>
    ),
  },
  {
    key: 'itemLabel',
    label: 'Description',
    render: (val) => (
      <span className="max-w-[260px] truncate block" title={val}>{val || '—'}</span>
    ),
  },
  {
    key: 'vendor',
    label: 'Vendor',
    render: (val) => <span className="font-equip text-xs text-gdd-black/60">{val || '—'}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (val, row) => (
      <span className={cn('font-equip text-sm font-medium', val < 0 ? 'text-red-600' : 'text-gdd-black')}>
        {val < 0 ? '-' : ''}{formatCurrency(Math.abs(val))}{row.currency && row.currency !== 'USD' ? ` ${row.currency}` : ''}
      </span>
    ),
  },
]

export default function FinancialCenterPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [action, setAction] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  // Build filter params shared by list + summary so the header numbers always
  // match what's in the table.
  const filterParams = useMemo(() => ({
    ...(search && { search }),
    ...(activeTab !== 'all' && { category: activeTab }),
    ...(action && { action }),
  }), [search, activeTab, action])

  const listParams = { page, limit: 25, ...filterParams }

  const { data, isLoading, isError, refetch } = useFinances(listParams)
  const { data: summary } = useFinancesSummary(filterParams)
  const backfill = useBackfillFinances()

  const rows = data?.data || []
  const total = data?.total || 0

  const totals = summary?.totals || { gross: 0, refunds: 0, net: 0, rows: 0 }

  const hasFilters = search || activeTab !== 'all' || action
  const clearFilters = () => {
    setSearch('')
    setActiveTab('all')
    setAction('')
    setPage(1)
  }

  const handleExport = () => {
    downloadFinancesCsv(filterParams).catch((err) => {
      console.error('CSV export failed', err)
    })
  }

  return (
    <div>
      <PageHeader
        title="Financial Center"
        subtitle="Revenue, refunds and invoices — generated from confirmed bookings"
        action={
          <button
            onClick={() => backfill.mutate()}
            disabled={backfill.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/70 rounded-sm hover:bg-sand-light/50 transition-colors disabled:opacity-50"
            title="Generate revenue rows for any pre-existing bookings that don't have them yet. Safe to re-run."
          >
            <RefreshCw className={cn('w-3.5 h-3.5', backfill.isPending && 'animate-spin')} />
            {backfill.isPending ? 'Backfilling…' : 'Backfill Historical'}
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={DollarSign} label="Gross Revenue" value={formatCurrency(totals.gross)} index={0} />
        <StatsCard icon={TrendingDown} label="Refunds" value={formatCurrency(Math.abs(totals.refunds))} index={1} />
        <StatsCard icon={DollarSign} label="Net" value={formatCurrency(totals.net)} index={2} />
        <StatsCard icon={FileText} label="Rows" value={totals.rows} index={3} />
      </div>

      {/* Filter Tabs + Search + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gdd-black/5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1) }}
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
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <Select
              value={action}
              onChange={(v) => { setAction(v); setPage(1) }}
              options={actionOptions}
              placeholder=""
              className="w-36"
            />
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1) }}
              placeholder="Booking ref, label, vendor…"
              className="w-full sm:w-72"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>

        {isError ? (
          <div className="py-16 text-center">
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load financial log.</p>
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
            onRowClick={(row) => setSelectedRow(row)}
            emptyMessage="No financial rows match your filters"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        title={`Financial Row — ${selectedRow?.bookingRef || selectedRow?._id || ''}`}
        size="lg"
      >
        {selectedRow && (
          <div className="space-y-6">
            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Row</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Booking Ref" value={selectedRow.bookingRef || '—'} />
                <DetailRow
                  label="Category"
                  value={
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-sm font-equip text-[10px] font-medium tracking-widest-plus uppercase',
                        categoryBadgeColors[selectedRow.category] || 'bg-gdd-black/5 text-gdd-black/60'
                      )}
                    >
                      {selectedRow.category || '—'}
                    </span>
                  }
                />
                <DetailRow label="Action" value={selectedRow.action || '—'} />
                <DetailRow label="Currency" value={selectedRow.currency || 'USD'} />
              </div>
            </div>

            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Financial</h3>
              <div className="space-y-2 bg-sand-light/30 p-4 rounded-sm">
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Description</span>
                  <span className="text-right max-w-[60%]">{selectedRow.itemLabel}</span>
                </div>
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Amount</span>
                  <span className={cn('font-medium', selectedRow.amount < 0 ? 'text-red-600' : 'text-gdd-black')}>
                    {selectedRow.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(selectedRow.amount))}
                  </span>
                </div>
                {!!selectedRow.commission && (
                  <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>Commission</span>
                    <span>{formatCurrency(selectedRow.commission)}</span>
                  </div>
                )}
                {selectedRow.vendor && (
                  <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>Vendor</span>
                    <span>{selectedRow.vendor}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Audit</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Processed By" value={selectedRow.processedBy || 'system'} />
                <DetailRow label="Processed At" value={formatDateTime(selectedRow.processedAt)} />
                <DetailRow label="Created At" value={formatDateTime(selectedRow.createdAt)} />
                <DetailRow label="Updated At" value={formatDateTime(selectedRow.updatedAt)} />
              </div>
            </div>

            {selectedRow.meta && Object.keys(selectedRow.meta).length > 0 && (
              <div>
                <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">Meta</h3>
                <pre className="bg-sand-light/30 p-4 rounded-sm font-equip text-xs text-gdd-black/70 overflow-x-auto">
{JSON.stringify(selectedRow.meta, null, 2)}
                </pre>
              </div>
            )}
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
