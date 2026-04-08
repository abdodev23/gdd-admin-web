import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldCheck, Briefcase, Eye, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import useAuthStore from '@/store/useAuthStore'
import {
  useUsers,
  useUpdateUser,
  useInviteUser,
  useDeleteUser,
} from '@/api/hooks/useUsers'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const roleColors = {
  'super-admin': 'bg-gold-deep/10 text-gold-deep',
  admin:        'bg-gold/10 text-gold-deep',
  manager:      'bg-status-blue/10 text-status-blue',
  viewer:       'bg-gdd-black/5 text-gdd-black/50',
  user:         'bg-gdd-black/5 text-gdd-black/50',
}

const roleLabels = {
  'super-admin': 'Super Admin',
  admin:         'Admin',
  manager:       'Manager',
  viewer:        'Viewer',
  user:          'User',
}

const roleCards = [
  { key: 'super-admin', label: 'Super Admin', icon: ShieldCheck, desc: 'Full system access. Manage users, settings, and all data.' },
  { key: 'admin',       label: 'Admin',       icon: Shield,      desc: 'Manage bookings, VIP allocations, promos, and requests.' },
  { key: 'manager',     label: 'Manager',     icon: Briefcase,   desc: 'View and edit bookings, handle requests. No user management.' },
  { key: 'viewer',      label: 'Viewer',      icon: Eye,         desc: 'Read-only access to dashboards and reports.' },
]

const allRoleOptions = [
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin',       label: 'Admin' },
  { value: 'manager',     label: 'Manager' },
  { value: 'viewer',      label: 'Viewer' },
]

const filterRoleOptions = [
  { value: '', label: 'All Roles' },
  ...allRoleOptions,
]

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

function getInitials(first, last, email) {
  const fl = `${first || ''}${last || ''}`.trim()
  if (fl) return (first?.[0] || '') + (last?.[0] || '')
  return (email || '?').slice(0, 2).toUpperCase()
}

export default function UsersPage() {
  const currentRole = useAuthStore((s) => s.role)
  const currentUserId = useAuthStore((s) => s.dbUser?._id)
  const isSuperAdmin = currentRole === 'super-admin'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(1)
  }
  const hasFilters = search || roleFilter || statusFilter

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    limit: 25,
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
    ...(statusFilter && { isActive: statusFilter }),
  })
  const rows = data?.data || []
  const total = data?.total || 0

  const updateUser = useUpdateUser()
  const inviteUser = useInviteUser()
  const deleteUser = useDeleteUser()

  // Modals
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', role: 'viewer' })
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: '', isActive: true })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      cellClassName: 'font-medium text-gdd-black',
      render: (_v, row) => {
        const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—'
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <span className="font-equip text-[10px] font-medium text-gold-deep tracking-widest-plus">
                {getInitials(row.firstName, row.lastName, row.email)}
              </span>
            </div>
            <span>{fullName}</span>
          </div>
        )
      },
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full', roleColors[val] || roleColors.user)}>
          {roleLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (val) => val ? new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => <StatusBadge status={val ? 'active' : 'inactive'} />,
    },
  ]

  const openEdit = (user) => {
    setEditUser(user)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
    })
  }

  const handleInvite = () => {
    if (!inviteForm.email.trim()) return
    inviteUser.mutate(inviteForm, {
      onSuccess: () => {
        setInviteForm({ firstName: '', lastName: '', email: '', role: 'viewer' })
        setInviteOpen(false)
      },
    })
  }

  const handleSaveEdit = () => {
    if (!editUser) return
    updateUser.mutate(
      { id: editUser._id, ...editForm },
      { onSuccess: () => setEditUser(null) }
    )
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteUser.mutate(deleteConfirm._id, {
      onSuccess: () => setDeleteConfirm(null),
    })
  }

  // Role-edit guard: non-super-admins can't touch the super-admin row at all
  // and can't promote anyone TO super-admin.
  const canEditRole = (user) => {
    if (isSuperAdmin) return true
    return user.role !== 'super-admin'
  }
  const editableRoleOptions = isSuperAdmin
    ? allRoleOptions
    : allRoleOptions.filter((o) => o.value !== 'super-admin')

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle={`${total} users`}
        action={
          isSuperAdmin && (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Invite Admin
            </button>
          )
        }
      />

      {/* Role Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {roleCards.map((role, i) => (
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

      {/* Search + Filter + Table */}
      <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
        <div className="px-6 py-4 border-b border-gdd-black/5 flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Search name, email, phone, nationality..."
            className="w-full sm:w-80"
          />
          <Select
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPage(1) }}
            options={filterRoleOptions}
            placeholder=""
            className="w-full sm:w-44"
          />
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            options={statusFilterOptions}
            placeholder=""
            className="w-full sm:w-44"
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
        {isError ? (
          <div className="py-16 text-center">
            <p className="font-equip text-sm text-red-500 mb-3">Failed to load users.</p>
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
            onRowClick={openEdit}
            emptyMessage="No users found"
            page={page}
            limit={25}
            total={total}
            onPageChange={setPage}
          />
        )}
      </motion.div>

      {/* Invite Modal — super-admin only */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite New Admin"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviteUser.isPending}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
            >
              {inviteUser.isPending ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">First Name</label>
              <input
                type="text"
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Last Name</label>
              <input
                type="text"
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black placeholder:text-gdd-black/25 focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Role</label>
            <Select
              value={inviteForm.role}
              onChange={(val) => setInviteForm({ ...inviteForm, role: val })}
              options={allRoleOptions}
              placeholder=""
            />
          </div>
          <p className="font-equip text-[11px] text-gdd-black/50 leading-relaxed">
            An invitation email with a password reset link will be sent. The invitee
            must verify their email and set a password before signing in.
          </p>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        footer={editUser && (
          <div className="flex justify-between">
            {isSuperAdmin && editUser._id !== currentUserId ? (
              <button
                onClick={() => {
                  setDeleteConfirm(editUser)
                  setEditUser(null)
                }}
                className="px-3 py-1.5 border border-red-200 font-equip text-[10px] uppercase tracking-widest-plus text-red-500 rounded-sm hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            ) : <span />}
            <div className="flex gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 font-equip text-sm text-gdd-black/50 hover:text-gdd-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateUser.isPending}
                className="px-5 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
              >
                {updateUser.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      >
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gdd-black/5">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="font-equip text-sm font-medium text-gold-deep tracking-widest-plus">
                  {getInitials(editUser.firstName, editUser.lastName, editUser.email)}
                </span>
              </div>
              <div>
                <p className="font-equip text-sm font-medium text-gdd-black">
                  {`${editUser.firstName || ''} ${editUser.lastName || ''}`.trim() || editUser.email}
                </p>
                <p className="font-equip text-xs text-gdd-black/40">{editUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Role</label>
              {canEditRole(editUser) ? (
                <Select
                  value={editForm.role}
                  onChange={(val) => setEditForm({ ...editForm, role: val })}
                  options={editableRoleOptions}
                  placeholder=""
                />
              ) : (
                <p className="font-equip text-sm text-gdd-black/50 italic">
                  Only a super-admin can change the super-admin role.
                </p>
              )}
            </div>
            <div>
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">Status</label>
              <Select
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(val) => setEditForm({ ...editForm, isActive: val === 'active' })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder=""
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="px-5 py-2 bg-red-600 text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              {deleteUser.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="font-equip text-sm text-gdd-black/70">
          Are you sure you want to delete{' '}
          <strong>
            {deleteConfirm
              ? `${deleteConfirm.firstName || ''} ${deleteConfirm.lastName || ''}`.trim() || deleteConfirm.email
              : ''}
          </strong>
          ? This will also delete their Firebase account. This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
