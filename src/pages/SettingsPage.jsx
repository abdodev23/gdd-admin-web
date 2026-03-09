import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Server, CreditCard, Bell, Settings } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import Toggle from '@/components/ui/Toggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

function SectionCard({ icon: Icon, title, index, children, onSave }) {
  return (
    <motion.div className="bg-white rounded-sm shadow-sm" variants={fadeUp} initial="hidden" animate="visible" custom={index}>
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gdd-black/5">
        <Icon className="w-4 h-4 text-gold" />
        <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{title}</h3>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
      {onSave && (
        <div className="px-6 py-4 border-t border-gdd-black/5 flex justify-end">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      )}
    </motion.div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
      <label className="sm:w-40 flex-shrink-0 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', masked = false }) {
  return (
    <input
      type={masked ? 'password' : type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
    />
  )
}

export default function SettingsPage() {
  const [general, setGeneral] = useState({
    eventName: 'Gala de Danza 2026',
    eventDate: 'November 3-6, 2026',
    venue: 'Grand Egyptian Museum, Cairo',
  })

  const [payment, setPayment] = useState({
    provider: 'Arab African International Bank',
    apiKey: 'sk_live_••••••••••••••••••••',
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    bookingAlerts: true,
    vipAlerts: false,
  })

  const handleSave = () => {
    alert('Settings saved successfully.')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage event configuration and system preferences" />

      <div className="space-y-6">
        {/* General */}
        <SectionCard icon={Settings} title="General" index={0} onSave={handleSave}>
          <FieldRow label="Event Name">
            <TextInput value={general.eventName} onChange={(v) => setGeneral({ ...general, eventName: v })} />
          </FieldRow>
          <FieldRow label="Event Date">
            <TextInput value={general.eventDate} onChange={(v) => setGeneral({ ...general, eventDate: v })} />
          </FieldRow>
          <FieldRow label="Venue">
            <TextInput value={general.venue} onChange={(v) => setGeneral({ ...general, venue: v })} />
          </FieldRow>
        </SectionCard>

        {/* Payment Gateway */}
        <SectionCard icon={CreditCard} title="Payment Gateway" index={1} onSave={handleSave}>
          <FieldRow label="Provider">
            <TextInput value={payment.provider} onChange={(v) => setPayment({ ...payment, provider: v })} />
          </FieldRow>
          <FieldRow label="Status">
            <StatusBadge status="active" />
          </FieldRow>
          <FieldRow label="API Key">
            <TextInput value={payment.apiKey} onChange={(v) => setPayment({ ...payment, apiKey: v })} masked />
          </FieldRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications" index={2} onSave={handleSave}>
          <FieldRow label="Email">
            <Toggle checked={notifications.email} onChange={(v) => setNotifications({ ...notifications, email: v })} label="Email notifications" />
          </FieldRow>
          <FieldRow label="SMS">
            <Toggle checked={notifications.sms} onChange={(v) => setNotifications({ ...notifications, sms: v })} label="SMS notifications" />
          </FieldRow>
          <FieldRow label="Bookings">
            <Toggle checked={notifications.bookingAlerts} onChange={(v) => setNotifications({ ...notifications, bookingAlerts: v })} label="Booking alerts" />
          </FieldRow>
          <FieldRow label="VIP">
            <Toggle checked={notifications.vipAlerts} onChange={(v) => setNotifications({ ...notifications, vipAlerts: v })} label="VIP alerts" />
          </FieldRow>
        </SectionCard>

        {/* System Info */}
        <SectionCard icon={Server} title="System Info" index={3}>
          <FieldRow label="Platform">
            <p className="font-equip text-sm text-gdd-black">GDD Admin v1.0.0</p>
          </FieldRow>
          <FieldRow label="Last Backup">
            <p className="font-equip text-sm text-gdd-black">March 9, 2026 — 02:00 AM</p>
          </FieldRow>
          <FieldRow label="Database">
            <StatusBadge status="active" />
          </FieldRow>
        </SectionCard>
      </div>
    </div>
  )
}
