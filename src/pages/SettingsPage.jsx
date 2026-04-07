import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Calendar, DollarSign, RefreshCw, Mail } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { useConfig, useUpdateConfig } from '@/api/hooks/useConfig'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

function SectionCard({ icon: Icon, title, index, children, onSave, saving }) {
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
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gdd-black text-white font-equip text-sm rounded-sm hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </motion.div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
      <label className="sm:w-48 flex-shrink-0 font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
    />
  )
}

function EmailListInput({ value = [], onChange, placeholder }) {
  // Comma-separated email entry (simple). Saves as array.
  const [text, setText] = useState(value.join(', '))
  useEffect(() => { setText((value || []).join(', ')) }, [value])
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
        onChange(list)
      }}
      placeholder={placeholder || 'email1@example.com, email2@example.com'}
      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
    />
  )
}

export default function SettingsPage() {
  const { data: config, isLoading, isError, refetch } = useConfig()
  const updateConfig = useUpdateConfig()

  // Local form state, hydrated from server
  const [event, setEvent] = useState({})
  const [pricing, setPricing] = useState({})
  const [overrides, setOverrides] = useState({ USD: '', EUR: '', GBP: '', AED: '' })
  const [recipients, setRecipients] = useState({ sgi: [], finance: [], ops: [] })

  useEffect(() => {
    if (!config) return
    setEvent(config.event || {})
    setPricing(config.pricing || {})
    // Normalize Map → plain object for the form
    const o = {}
    if (config.exchangeRateOverrides) {
      for (const [k, v] of Object.entries(config.exchangeRateOverrides)) o[k] = v
    }
    setOverrides({ USD: o.USD || '', EUR: o.EUR || '', GBP: o.GBP || '', AED: o.AED || '' })
    setRecipients(config.notificationRecipients || { sgi: [], finance: [], ops: [] })
  }, [config])

  const saveEvent = () => updateConfig.mutate({ event })
  const savePricing = () => updateConfig.mutate({ pricing })
  const saveOverrides = () => {
    // Strip empty strings before sending
    const clean = {}
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== '' && v !== null && !isNaN(Number(v))) clean[k] = Number(v)
    }
    updateConfig.mutate({ exchangeRateOverrides: clean })
  }
  const saveRecipients = () => updateConfig.mutate({ notificationRecipients: recipients })

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Manage event configuration and system preferences" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Manage event configuration and system preferences" />
        <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
          <p className="font-equip text-sm text-red-600">Could not load settings.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 font-equip text-xs tracking-widest-plus uppercase px-4 py-2 bg-gdd-black text-white rounded-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage event configuration and system preferences" />

      <div className="space-y-6">
        {/* Event details */}
        <SectionCard icon={Calendar} title="Event Details" index={0} onSave={saveEvent} saving={updateConfig.isPending}>
          <FieldRow label="Event Name">
            <TextInput value={event.name} onChange={(v) => setEvent({ ...event, name: v })} />
          </FieldRow>
          <FieldRow label="Event Date">
            <TextInput type="date" value={event.date} onChange={(v) => setEvent({ ...event, date: v })} />
          </FieldRow>
          <FieldRow label="Event Time">
            <TextInput type="time" value={event.time} onChange={(v) => setEvent({ ...event, time: v })} />
          </FieldRow>
          <FieldRow label="Venue Name">
            <TextInput value={event.venueName} onChange={(v) => setEvent({ ...event, venueName: v })} />
          </FieldRow>
          <FieldRow label="Venue Address">
            <TextInput value={event.venueAddress} onChange={(v) => setEvent({ ...event, venueAddress: v })} />
          </FieldRow>
        </SectionCard>

        {/* Pricing controls */}
        <SectionCard icon={DollarSign} title="Pricing Controls" index={1} onSave={savePricing} saving={updateConfig.isPending}>
          <FieldRow label="Insurance Price (USD)">
            <TextInput type="number" value={pricing.insurancePrice} onChange={(v) => setPricing({ ...pricing, insurancePrice: v })} />
          </FieldRow>
          <FieldRow label="Child Age Threshold">
            <TextInput type="number" value={pricing.childAgeThreshold} onChange={(v) => setPricing({ ...pricing, childAgeThreshold: v })} />
          </FieldRow>
          <FieldRow label="Modification Cutoff (hours)">
            <TextInput type="number" value={pricing.modificationCutoffHours} onChange={(v) => setPricing({ ...pricing, modificationCutoffHours: v })} />
          </FieldRow>
          <FieldRow label="Default Commission (%)">
            <TextInput type="number" value={pricing.defaultCommission} onChange={(v) => setPricing({ ...pricing, defaultCommission: v })} />
          </FieldRow>
        </SectionCard>

        {/* Exchange rate overrides */}
        <SectionCard icon={RefreshCw} title="Exchange Rate Overrides" index={2} onSave={saveOverrides} saving={updateConfig.isPending}>
          <p className="font-equip text-[11px] text-gdd-black/40 -mt-1 mb-2">
            Leave blank to use the live exchange rate. Set a value to lock the rate (useful during sales).
          </p>
          {['USD', 'EUR', 'GBP', 'AED'].map((code) => (
            <FieldRow key={code} label={`${code} Override`}>
              <TextInput
                type="number"
                value={overrides[code]}
                onChange={(v) => setOverrides({ ...overrides, [code]: v })}
                placeholder="Live rate"
              />
            </FieldRow>
          ))}
        </SectionCard>

        {/* Notification recipients */}
        <SectionCard icon={Mail} title="Notification Recipients" index={3} onSave={saveRecipients} saving={updateConfig.isPending}>
          <p className="font-equip text-[11px] text-gdd-black/40 -mt-1 mb-2">
            Comma-separated emails. These addresses receive automated notifications via the email system.
          </p>
          <FieldRow label="SGI Team">
            <EmailListInput value={recipients.sgi} onChange={(v) => setRecipients({ ...recipients, sgi: v })} />
          </FieldRow>
          <FieldRow label="Finance Team">
            <EmailListInput value={recipients.finance} onChange={(v) => setRecipients({ ...recipients, finance: v })} />
          </FieldRow>
          <FieldRow label="Operations Team">
            <EmailListInput value={recipients.ops} onChange={(v) => setRecipients({ ...recipients, ops: v })} />
          </FieldRow>
        </SectionCard>
      </div>
    </div>
  )
}
