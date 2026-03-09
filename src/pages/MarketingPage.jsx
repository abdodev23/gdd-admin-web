import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Eye, MousePointerClick, Plus } from 'lucide-react'
import useDataStore from '@/store/useDataStore'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/ui/StatsCard'
import StatusBadge from '@/components/ui/StatusBadge'
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

const templateColors = {
  promotion: 'bg-gold/10 text-gold-deep',
  announcement: 'bg-status-blue/10 text-status-blue',
  informational: 'bg-status-green/10 text-status-green',
  reminder: 'bg-gdd-black/5 text-gdd-black/60',
}

const templateOptions = [
  { value: 'promotion', label: 'Promotion' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'informational', label: 'Informational' },
  { value: 'reminder', label: 'Reminder' },
]

const recipientOptions = [
  { value: 'All Subscribers', label: 'All Subscribers' },
  { value: 'Premium & VIP Ticket Holders', label: 'Premium & VIP Ticket Holders' },
  { value: 'International Ticket Holders', label: 'International Ticket Holders' },
  { value: 'Uninsured Ticket Holders', label: 'Uninsured Ticket Holders' },
]

const emptyCampaign = {
  subject: '',
  template: 'promotion',
  recipientList: 'All Subscribers',
  recipientCount: 0,
  status: 'draft',
  scheduledAt: '',
  sentAt: null,
  openRate: 0,
  clickRate: 0,
}

export default function MarketingPage() {
  const { emails, addItem } = useDataStore()
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ ...emptyCampaign })

  const stats = useMemo(() => {
    const sentEmails = emails.filter((e) => e.status === 'sent')
    const totalSent = sentEmails.reduce((sum, e) => sum + e.recipientCount, 0)
    const avgOpenRate = sentEmails.length > 0
      ? (sentEmails.reduce((sum, e) => sum + e.openRate, 0) / sentEmails.length).toFixed(1)
      : 0
    const avgClickRate = sentEmails.length > 0
      ? (sentEmails.reduce((sum, e) => sum + e.clickRate, 0) / sentEmails.length).toFixed(1)
      : 0
    const activeCampaigns = emails.filter((e) => e.status === 'scheduled' || e.status === 'draft').length
    return { totalSent, avgOpenRate, avgClickRate, activeCampaigns }
  }, [emails])

  const handleCreate = () => {
    setForm({ ...emptyCampaign })
    setIsCreating(true)
  }

  const handleSave = () => {
    const recipientCounts = {
      'All Subscribers': 5200,
      'Premium & VIP Ticket Holders': 270,
      'International Ticket Holders': 892,
      'Uninsured Ticket Holders': 680,
    }
    addItem('emails', {
      ...form,
      recipientCount: recipientCounts[form.recipientList] || 0,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
    })
    setIsCreating(false)
  }

  const closeModal = () => {
    setSelectedEmail(null)
    setIsCreating(false)
  }

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      cellClassName: 'font-medium text-gdd-black max-w-[240px]',
      render: (val) => (
        <span className="font-equip text-sm font-medium text-gdd-black truncate block max-w-[240px]">{val}</span>
      ),
    },
    {
      key: 'template',
      label: 'Template',
      render: (val) => {
        const color = templateColors[val] || templateColors.reminder
        return (
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
            color
          )}>
            {val}
          </span>
        )
      },
    },
    {
      key: 'recipientList',
      label: 'Recipients',
      render: (val, row) => (
        <div>
          <span className="font-equip text-sm text-gdd-black/70 block">{val}</span>
          <span className="font-equip text-xs text-gdd-black/40">{row.recipientCount.toLocaleString()} recipients</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      render: (val) => val ? (
        <span className="font-equip text-sm text-gdd-black/60">
          {new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ) : (
        <span className="font-equip text-xs text-gdd-black/25">--</span>
      ),
    },
    {
      key: 'openRate',
      label: 'Open Rate',
      render: (val) => (
        <div className="min-w-[80px]">
          <span className="font-equip text-xs text-gdd-black/60 block mb-1">{val}%</span>
          <div className="w-full h-1 bg-gdd-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-green rounded-full transition-all duration-500"
              style={{ width: `${Math.min(val, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'clickRate',
      label: 'Click Rate',
      render: (val) => (
        <div className="min-w-[80px]">
          <span className="font-equip text-xs text-gdd-black/60 block mb-1">{val}%</span>
          <div className="w-full h-1 bg-gdd-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-blue rounded-full transition-all duration-500"
              style={{ width: `${Math.min(val * 2, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Marketing"
        subtitle="Email campaigns and engagement analytics"
        action={
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Send} label="Total Sent" value={stats.totalSent.toLocaleString()} index={0} />
        <StatsCard icon={Eye} label="Avg Open Rate" value={`${stats.avgOpenRate}%`} index={1} />
        <StatsCard icon={MousePointerClick} label="Avg Click Rate" value={`${stats.avgClickRate}%`} index={2} />
        <StatsCard icon={Mail} label="Active Campaigns" value={stats.activeCampaigns} index={3} />
      </div>

      {/* Campaigns Table */}
      <motion.div
        className="bg-white rounded-sm shadow-sm"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <div className="px-6 py-4 border-b border-gdd-black/5">
          <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
            All Campaigns
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={emails}
          onRowClick={(row) => setSelectedEmail(row)}
          emptyMessage="No campaigns yet"
        />
      </motion.div>

      {/* Campaign Detail Modal */}
      <Modal
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
        title="Campaign Details"
        size="lg"
      >
        {selectedEmail && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medino text-lg text-gdd-black mb-1">{selectedEmail.subject}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 text-[10px] font-equip font-medium uppercase tracking-widest-plus rounded-full',
                  templateColors[selectedEmail.template] || templateColors.reminder
                )}>
                  {selectedEmail.template}
                </span>
                <StatusBadge status={selectedEmail.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-sand-light/30 rounded-sm">
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mb-1">Recipients</p>
                <p className="font-equip text-sm font-medium text-gdd-black">{selectedEmail.recipientList}</p>
                <p className="font-equip text-xs text-gdd-black/40">{selectedEmail.recipientCount.toLocaleString()} recipients</p>
              </div>
              <div className="p-4 bg-sand-light/30 rounded-sm">
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 mb-1">Scheduled</p>
                <p className="font-equip text-sm font-medium text-gdd-black">
                  {selectedEmail.scheduledAt
                    ? new Date(selectedEmail.scheduledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Not scheduled'}
                </p>
              </div>
            </div>

            {selectedEmail.status === 'sent' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gdd-black/5 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-status-green" />
                    <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Open Rate</p>
                  </div>
                  <p className="font-medino text-2xl text-gdd-black">{selectedEmail.openRate}%</p>
                  <div className="w-full h-2 bg-gdd-black/5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-status-green rounded-full"
                      style={{ width: `${selectedEmail.openRate}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 border border-gdd-black/5 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-status-blue" />
                    <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Click Rate</p>
                  </div>
                  <p className="font-medino text-2xl text-gdd-black">{selectedEmail.clickRate}%</p>
                  <div className="w-full h-2 bg-gdd-black/5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-status-blue rounded-full"
                      style={{ width: `${selectedEmail.clickRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="border border-gdd-black/10 rounded-sm overflow-hidden">
              <div className="px-4 py-3 bg-gdd-black/[0.02] border-b border-gdd-black/5">
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Email Preview</p>
              </div>
              <div className="p-6">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <h4 className="font-medino text-lg text-gdd-black mb-2">{selectedEmail.subject}</h4>
                  <p className="font-equip text-sm text-gdd-black/50 leading-relaxed">
                    This is a preview of the <span className="font-medium">{selectedEmail.template}</span> email
                    sent to <span className="font-medium">{selectedEmail.recipientList}</span>.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm">
                    Call to Action
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="New Campaign"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Enter email subject line..."
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Template
            </label>
            <select
              value={form.template}
              onChange={(e) => setForm({ ...form, template: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {templateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Recipient List
            </label>
            <select
              value={form.recipientList}
              onChange={(e) => setForm({ ...form, recipientList: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {recipientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
              Schedule Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
