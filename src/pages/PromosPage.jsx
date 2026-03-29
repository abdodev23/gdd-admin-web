import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, Tag } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
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
  usageCount: 0,
  expiryDate: '',
  isPreSale: false,
  isActive: true,
  createdAt: new Date().toISOString().split('T')[0],
}

export default function PromosPage() {
  const { promos, addItem, updateItem, deleteItem } = useDataStore()
  const [editPromo, setEditPromo] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyPromo })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleAdd = () => {
    setForm({ ...emptyPromo })
    setIsAdding(true)
  }

  const handleEdit = (promo) => {
    setForm({ ...promo })
    setEditPromo(promo)
  }

  const handleSave = () => {
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      usageLimit: Number(form.usageLimit),
      usageCount: Number(form.usageCount || 0),
    }
    if (isAdding) {
      addItem('promos', payload)
      setIsAdding(false)
    } else {
      updateItem('promos', editPromo.id, payload)
      setEditPromo(null)
    }
  }

  const closeModal = () => {
    setEditPromo(null)
    setIsAdding(false)
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      cellClassName: 'font-mono font-bold text-gdd-black',
      render: (val) => (
        <span className="font-mono font-bold text-gdd-black tracking-wide">{val}</span>
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
        const progress = row.usageLimit > 0 ? Math.round((val / row.usageLimit) * 100) : 0
        const isHigh = progress >= 80
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-equip text-xs text-gdd-black/60">
                {val} / {row.usageLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gdd-black/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isHigh ? 'bg-status-red' : 'bg-gold'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (val) => (
        <span className="font-equip text-sm text-gdd-black/60">{val}</span>
      ),
    },
    {
      key: 'isPreSale',
      label: 'Pre-Sale',
      render: (val) => val ? (
        <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full bg-status-blue/10 text-status-blue">
          Pre-Sale
        </span>
      ) : (
        <span className="font-equip text-xs text-gdd-black/25">--</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            updateItem('promos', row.id, { isActive: !val })
          }}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            val ? 'bg-status-green' : 'bg-gdd-black/15'
          )}
        >
          <span
            className={cn(
              'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
              val ? 'translate-x-[18px]' : 'translate-x-[3px]'
            )}
          />
        </button>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            className="p-1.5 text-gdd-black/30 hover:text-gold transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteConfirm(row)
            }}
            className="p-1.5 text-gdd-black/30 hover:text-red-500 transition-colors"
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
        subtitle={`${promos.filter((p) => p.isActive).length} active codes`}
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

      <motion.div
        className="bg-white rounded-sm shadow-sm"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <DataTable
          columns={columns}
          data={promos}
          emptyMessage="No promo codes yet"
        />
      </motion.div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={!!editPromo || isAdding}
        onClose={closeModal}
        title={isAdding ? 'Add Promo Code' : 'Edit Promo Code'}
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Code
            </label>
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
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Discount Type
              </label>
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
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Discount Value
              </label>
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
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPreSale}
                onChange={(e) => setForm({ ...form, isPreSale: e.target.checked })}
                className="w-4 h-4 border-gdd-black/20 rounded text-gold focus:ring-gold"
              />
              <span className="font-equip text-sm text-gdd-black/70">Pre-Sale Code</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 border-gdd-black/20 rounded text-gold focus:ring-gold"
              />
              <span className="font-equip text-sm text-gdd-black/70">Active</span>
            </label>
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
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              {isAdding ? 'Add Code' : 'Save Changes'}
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
        <p className="font-equip text-sm text-gdd-black/70 mb-6">
          Are you sure you want to delete <strong>{deleteConfirm?.code}</strong>? This cannot be undone.
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
              deleteItem('promos', deleteConfirm.id)
              setDeleteConfirm(null)
            }}
            className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
