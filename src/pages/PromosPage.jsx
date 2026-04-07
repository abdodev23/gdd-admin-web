import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, RotateCcw, PowerOff } from 'lucide-react'
import {
  usePromos,
  useCreatePromo,
  useUpdatePromo,
  useDeactivatePromo,
  useReactivatePromo,
  useDeletePromo,
} from '@/api/hooks/usePromos'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import StatusFilter from '@/components/ui/StatusFilter'
import { cn } from '@/utils/cn'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const emptyPromo = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  usageLimit: '',
  minOrderAmount: '',
  applicableTiers: [],
  expiryDate: '',
  isActive: true,
}

const TIER_OPTIONS = ['general', 'premium', 'vip']

const formatDate = (iso) => {
  if (!iso) return '—'
  try { return new Date(iso).toISOString().slice(0, 10) } catch { return iso }
}

export default function PromosPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('active')

  const [editPromo, setEditPromo] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyPromo })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data, isLoading, isError } = usePromos({
    page,
    limit: 25,
    search: search || undefined,
    status,
  })
  const promos = data?.data || []

  const createPromo     = useCreatePromo()
  const updatePromo     = useUpdatePromo()
  const deactivatePromo = useDeactivatePromo()
  const reactivatePromo = useReactivatePromo()
  const deletePromo     = useDeletePromo()

  const handleAdd = () => {
    setForm({ ...emptyPromo })
    setIsAdding(true)
  }

  const handleEdit = (promo) => {
    setForm({
      code: promo.code || '',
      discountType: promo.discountType || 'percentage',
      discountValue: promo.discountValue ?? '',
      usageLimit: promo.usageLimit ?? '',
      minOrderAmount: promo.minOrderAmount ?? '',
      applicableTiers: promo.applicableTiers || [],
      expiryDate: promo.expiryDate ? formatDate(promo.expiryDate) : '',
      isActive: promo.isActive !== false,
    })
    setEditPromo(promo)
  }

  const handleSave = () => {
    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue) || 0,
      usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : undefined,
      minOrderAmount: form.minOrderAmount !== '' ? Number(form.minOrderAmount) : 0,
      applicableTiers: form.applicableTiers,
      expiryDate: form.expiryDate || undefined,
      isActive: form.isActive,
    }
    if (isAdding) {
      createPromo.mutate(payload, { onSuccess: () => setIsAdding(false) })
    } else {
      updatePromo.mutate({ id: editPromo._id, ...payload }, { onSuccess: () => setEditPromo(null) })
    }
  }

  const closeModal = () => {
    setEditPromo(null)
    setIsAdding(false)
  }

  const toggleTier = (tier) => {
    setForm((f) => ({
      ...f,
      applicableTiers: f.applicableTiers.includes(tier)
        ? f.applicableTiers.filter((t) => t !== tier)
        : [...f.applicableTiers, tier],
    }))
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (val, row) => (
        <span className={cn(
          'font-mono font-bold tracking-wide',
          row.isActive ? 'text-gdd-black' : 'text-gdd-black/40'
        )}>
          {val}
        </span>
      ),
    },
    {
      key: 'discountValue',
      label: 'Discount',
      render: (val, row) => (
        <span className="font-equip text-sm font-medium text-gold-deep">
          {row.discountType === 'percentage' ? `${val}%` : `$${val}`}
        </span>
      ),
    },
    {
      key: 'usageCount',
      label: 'Usage',
      render: (val, row) => {
        const limit = row.usageLimit
        const used = val || 0
        if (!limit) {
          return <span className="font-equip text-xs text-gdd-black/60">{used} / ∞</span>
        }
        const progress = Math.round((used / limit) * 100)
        const isHigh = progress >= 80
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-equip text-xs text-gdd-black/60">{used} / {limit}</span>
            </div>
            <div className="w-full h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', isHigh ? 'bg-status-red' : 'bg-gold')}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (val) => <span className="font-equip text-sm text-gdd-black/60">{formatDate(val)}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span className={cn(
          'inline-flex px-2 py-0.5 text-[10px] font-equip uppercase tracking-widest-plus rounded-full',
          val ? 'bg-status-green/10 text-status-green' : 'bg-gdd-black/10 text-gdd-black/40'
        )}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row) }}
            className="p-1.5 text-gdd-black/30 hover:text-gold transition-colors"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {row.isActive ? (
            <button
              onClick={(e) => { e.stopPropagation(); deactivatePromo.mutate(row._id) }}
              className="p-1.5 text-gdd-black/30 hover:text-orange transition-colors"
              title="Deactivate (admin still sees it)"
            >
              <PowerOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); reactivatePromo.mutate(row._id) }}
              className="p-1.5 text-gdd-black/30 hover:text-green-600 transition-colors"
              title="Reactivate"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(row) }}
            className="p-1.5 text-gdd-black/30 hover:text-red-500 transition-colors"
            title="Delete (hidden from admin too)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Promo Codes"
        subtitle={data ? `${data.total} total codes` : 'Loading…'}
        action={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Code
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by code..."
          className="flex-1"
        />
        <StatusFilter value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
      </div>

      {isError ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load promo codes.</p>
        </div>
      ) : (
        <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <DataTable
            columns={columns}
            data={promos}
            loading={isLoading}
            emptyMessage="No promo codes match the current filter."
            page={data?.page}
            limit={data?.limit}
            total={data?.total}
            onPageChange={setPage}
          />
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!editPromo || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Promo Code' : 'Edit Promo Code'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. GALA10"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-mono text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold uppercase tracking-wide"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Discount Value</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Usage Limit (blank = unlimited)</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Min Order Amount ($)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-2">Applicable Tiers (none = all)</label>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => toggleTier(tier)}
                  className={cn(
                    'px-3 py-1.5 font-equip text-xs uppercase tracking-widest-plus rounded-sm border transition-colors',
                    form.applicableTiers.includes(tier)
                      ? 'bg-gdd-black text-white border-gdd-black'
                      : 'bg-white text-gdd-black/60 border-gdd-black/10 hover:border-gdd-black/30'
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={closeModal}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createPromo.isPending || updatePromo.isPending}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {createPromo.isPending || updatePromo.isPending ? 'Saving…' : (isAdding ? 'Add Code' : 'Save Changes')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Promo Code"
        size="sm"
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-2">
          Permanently delete <strong>{deleteConfirm?.code}</strong>?
        </p>
        <p className="font-equip text-xs text-gdd-black/40 mb-6">
          The code will be hidden from BOTH the customer site and admin views. The record stays in the database but won't appear anywhere. Use Deactivate instead if you might want it back later.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deletePromo.mutate(deleteConfirm._id, { onSuccess: () => setDeleteConfirm(null) })
            }}
            disabled={deletePromo.isPending}
            className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deletePromo.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
