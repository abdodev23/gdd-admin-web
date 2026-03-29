import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldCheck, Briefcase, Eye, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
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

const roleColors = {
  'super-admin': 'bg-gold-deep/10 text-gold-deep',
  admin: 'bg-gold/10 text-gold-deep',
  manager: 'bg-status-blue/10 text-status-blue',
  viewer: 'bg-gdd-black/5 text-gdd-black/50',
}

const roleLabels = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
}

const roles = [
  { key: 'super-admin', label: 'Super Admin', icon: ShieldCheck, desc: 'Full system access. Manage users, settings, and all data.' },
  { key: 'admin', label: 'Admin', icon: Shield, desc: 'Manage bookings, VIP allocations, promos, and requests.' },
  { key: 'manager', label: 'Manager', icon: Briefcase, desc: 'View and edit bookings, handle requests. No user management.' },
  { key: 'viewer', label: 'Viewer', icon: Eye, desc: 'Read-only access to dashboards and reports.' },
]

const roleOptions = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'viewer', label: 'Viewer' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRelativeTime(dateStr) {
  const now = new Date('2026-03-09T15:00:00Z')
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHr < 24) return `${diffHr} hours ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const columns = [
  {
    key: 'name',
    label: 'Name',
    cellClassName: 'font-medium text-gdd-black',
    render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="font-equip text-[10px] font-medium text-gold-deep tracking-widest-plus">{getInitials(val)}</span>
        </div>
        <span>{val}</span>
      </div>
    ),
  },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (val) => (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full', roleColors[val])}>
        {roleLabels[val]}
      </span>
    ),
  },
  { key: 'lastActive', label: 'Last Active', render: (val) => getRelativeTime(val) },
  { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
]

export default function UsersPage() {
  const { users, addItem, updateItem, deleteItem } = useDataStore()
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'viewer' })
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  }, [users, search])

  const handleRowClick = (user) => {
    setEditUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, status: user.status })
  }

  const handleAddUser = () => {
    if (!addForm.name.trim() || !addForm.email.trim()) return
    addItem('users', {
      name: addForm.name,
      email: addForm.email,
      role: addForm.role,
      avatar: null,
      lastActive: new Date().toISOString(),
      status: 'active',
    })
    setAddForm({ name: '', email: '', role: 'viewer' })
    setAddModalOpen(false)
  }

  const handleUpdateUser = () => {
    if (!editUser) return
    updateItem('users', editUser.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      status: editForm.status,
    })
    setEditUser(null)
  }

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle={`${users.length} team members`}
        action={
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        }
      />

      {/* Role Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {roles.map((role, i) => (
          <motion.div
            key={role.key}
            className="bg-white p-4 rounded-sm shadow-sm"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="flex items-center gap-2 mb-2">
              <role.icon className="w-4 h-4 text-gold" />
              <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full', roleColors[role.key])}>
                {role.label}
              </span>
            </div>
            <p className="font-equip text-xs text-gdd-black/50 leading-relaxed">{role.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <div className="px-6 py-4 border-b border-gdd-black/5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="w-full sm:w-64" />
        </div>
        <DataTable columns={columns} data={filtered} onRowClick={handleRowClick} emptyMessage="No users found" />
      </motion.div>

      {/* Add User Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add User">
        <div className="space-y-4">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Name</label>
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Email</label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Role</label>
            <Select value={addForm.role} onChange={(val) => setAddForm({ ...addForm, role: val })} options={roleOptions} placeholder="" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors">Cancel</button>
            <button onClick={handleAddUser} className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors">Add User</button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gdd-black/5">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="font-equip text-sm font-medium text-gold-deep tracking-widest-plus">{editUser ? getInitials(editUser.name) : ''}</span>
            </div>
            <div>
              <p className="font-equip text-sm font-medium text-gdd-black">{editUser?.name}</p>
              <p className="font-equip text-xs text-gdd-black/40">{editUser?.email}</p>
            </div>
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Role</label>
            <Select value={editForm.role} onChange={(val) => setEditForm({ ...editForm, role: val })} options={roleOptions} placeholder="" />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Status</label>
            <Select value={editForm.status} onChange={(val) => setEditForm({ ...editForm, status: val })} options={statusOptions} placeholder="" />
          </div>
          <div className="flex justify-between pt-2">
            <button
              onClick={() => {
                setDeleteConfirm(editUser)
                setEditUser(null)
              }}
              className="px-3 py-1.5 border border-red-200 font-equip text-[10px] uppercase tracking-widest-plus text-red-500 rounded-sm hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-3">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors">Cancel</button>
              <button onClick={handleUpdateUser} className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User"
        size="sm"
      >
        <p className="font-equip text-sm text-gdd-black/70 mb-6">
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
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
              deleteItem('users', deleteConfirm.id)
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
