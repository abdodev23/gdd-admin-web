import { useEffect, useRef, useState } from 'react'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  useBookingModification,
  useUpdateBookingModification,
  useApproveBookingModification,
  useMarkBookingModificationPaid,
  useApplyBookingModification,
  useDenyBookingModification,
} from '@/api/hooks/useBookingModifications'

const Section = ({ title, children, action }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40">
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
)

const isTerminal = (status) => ['applied', 'denied', 'expired'].includes(status)

// Pretty key labels for the diff view. Anything not in the map gets a
// fallback humanizer (camelCase → "Camel Case").
const FIELD_LABELS = {
  hotelId:               'Hotel',
  hotelName:             'Hotel',
  hotelNights:           'Nights',
  hotelPricePerNight:    'Price / Night',
  rooms:                 'Rooms',
  dateRange:             'Travel Dates',
  addons:                'Add-ons',
  activities:            'Activities',
  daySchedule:           'Day Schedule',
  transfers:             'Transfers',
  insurance:             'Insurance',
  insurancePrice:        'Insurance Price',
  adults:                'Adults',
  children:              'Children',
  seats:                 'Seats',
  specialRequestMessage: 'Special Request Note',
  flightNumber:          'Flight Number',
  notes:                 'Customer Notes',
}

const humanizeKey = (key) =>
  FIELD_LABELS[key] ||
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

// Render a value of any shape as compact, human-readable text. Arrays of
// objects (rooms, seats, transfers…) get one line per row; flat objects
// (dateRange) become inline; primitives are stringified directly.
function formatValue(value) {
  if (value === null || value === undefined || value === '') return <span className="text-gdd-black/30">—</span>
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gdd-black/30">None</span>
    return (
      <ul className="space-y-1">
        {value.map((item, i) => (
          <li key={i} className="font-equip text-[12px] text-gdd-black/70">
            {typeof item === 'object' && item !== null ? formatObjectInline(item) : String(item)}
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') return formatObjectInline(value)
  return String(value)
}

function formatObjectInline(obj) {
  const entries = Object.entries(obj).filter(([k]) => k !== '_id' && k !== '__v')
  if (!entries.length) return <span className="text-gdd-black/30">—</span>
  return (
    <span className="font-equip text-[12px] text-gdd-black/70">
      {entries.map(([k, v], i) => (
        <span key={k}>
          {i > 0 && <span className="text-gdd-black/30"> · </span>}
          <span className="text-gdd-black/40">{humanizeKey(k)}:</span>{' '}
          <span>{v === null || v === undefined || v === '' ? '—' : (typeof v === 'object' ? JSON.stringify(v) : String(v))}</span>
        </span>
      ))}
    </span>
  )
}

const ReadableBlock = ({ value }) => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length === 0) {
    return (
      <div className="bg-sand-light/40 p-3 rounded-sm font-equip text-[12px] text-gdd-black/40">—</div>
    )
  }
  return (
    <div className="bg-sand-light/40 p-3 rounded-sm space-y-2">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="flex flex-col">
          <span className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
            {humanizeKey(key)}
          </span>
          <div className="font-equip text-[12px] text-gdd-black/80">{formatValue(val)}</div>
        </div>
      ))}
    </div>
  )
}

/**
 * Modal that walks an admin through the BookingModificationRequest state machine.
 *
 * Workflow buttons in the footer:
 *   pending/in-review  →  Approve, Deny
 *   awaiting-payment   →  Mark Paid, Deny
 *   approved / paid    →  Apply, Deny
 *   applied/denied     →  (terminal — read-only)
 */
export default function BookingModificationModal({ requestId, onClose }) {
  const { data: req, isLoading, isError } = useBookingModification(requestId)
  const update = useUpdateBookingModification()
  const approve = useApproveBookingModification()
  const markPaid = useMarkBookingModificationPaid()
  const apply = useApplyBookingModification()
  const deny = useDenyBookingModification()

  const [finalDelta, setFinalDelta] = useState('')
  const [finalDeltaNotes, setFinalDeltaNotes] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [denyReason, setDenyReason] = useState('')
  const [showDeny, setShowDeny] = useState(false)
  const [newNote, setNewNote] = useState('')
  const denySectionRef = useRef(null)

  useEffect(() => {
    if (req) {
      setFinalDelta(req.finalDelta ?? req.estimatedDelta ?? '')
      setFinalDeltaNotes(req.finalDeltaNotes || '')
      setCurrency(req.paymentLink?.currency || 'USD')
      setShowDeny(false)
      setDenyReason('')
      setNewNote('')
    }
  }, [req])

  const handleApprove = () => {
    if (!req) return
    if (finalDelta === '' || isNaN(Number(finalDelta))) return
    approve.mutate({
      id: req._id,
      finalDelta: Number(finalDelta),
      finalDeltaNotes,
      currency,
    })
  }

  const handleMarkPaid = () => {
    if (!req) return
    markPaid.mutate(req._id)
  }

  const handleApply = () => {
    if (!req) return
    apply.mutate(req._id)
  }

  const handleDeny = () => {
    if (!req || !denyReason.trim()) return
    deny.mutate(
      { id: req._id, reason: denyReason.trim() },
      { onSuccess: () => setShowDeny(false) }
    )
  }

  const handleAddNote = () => {
    if (!req || !newNote.trim()) return
    update.mutate(
      { id: req._id, note: newNote.trim() },
      { onSuccess: () => setNewNote('') }
    )
  }

  const title = req
    ? `Modification — ${req.bookingRef || req._id?.slice(-6)} · ${req.section}`
    : 'Modification'

  const stage = req?.status

  return (
    <Modal
      isOpen={!!requestId}
      onClose={onClose}
      title={title}
      size="xl"
      footer={req && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(stage === 'pending' || stage === 'in-review') && (
              <button
                onClick={handleApprove}
                disabled={approve.isPending || finalDelta === '' || isNaN(Number(finalDelta))}
                className="px-4 py-2 bg-status-green text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-status-green/90 disabled:opacity-40 transition-colors"
              >
                {approve.isPending ? 'Approving…' : 'Approve'}
              </button>
            )}
            {stage === 'awaiting-payment' && (
              <button
                onClick={handleMarkPaid}
                disabled={markPaid.isPending}
                className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
              >
                {markPaid.isPending ? 'Marking…' : 'Mark Paid'}
              </button>
            )}
            {(stage === 'approved' || stage === 'paid') && (
              <button
                onClick={handleApply}
                disabled={apply.isPending}
                className="px-4 py-2 bg-status-green text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-status-green/90 disabled:opacity-40 transition-colors"
              >
                {apply.isPending ? 'Applying…' : 'Apply to Booking'}
              </button>
            )}
            {!isTerminal(stage) && !showDeny && (
              <button
                onClick={() => {
                  setShowDeny(true)
                  // Wait for the deny section to mount, then scroll the modal
                  // body so the admin sees the reason textarea immediately.
                  requestAnimationFrame(() => {
                    denySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  })
                }}
                className="px-4 py-2 border border-red-200 font-equip text-xs uppercase tracking-widest-plus text-red-500 rounded-sm hover:bg-red-50 transition-colors"
              >
                Deny
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/50 hover:text-gdd-black transition-colors"
          >
            Close
          </button>
        </div>
      )}
    >
      {isLoading && (
        <div className="py-12 text-center font-equip text-sm text-gdd-black/40">Loading…</div>
      )}
      {isError && (
        <div className="py-12 text-center font-equip text-sm text-red-500">Failed to load request.</div>
      )}
      {req && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gdd-black/5 pb-4">
            <div>
              <p className="font-equip text-sm font-medium text-gdd-black">{req.guestName || '—'}</p>
              <p className="font-equip text-xs text-gdd-black/40 mt-0.5">{req.guestEmail || '—'}</p>
              {req.bookingRef && (
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30 mt-1">
                  Booking {req.bookingRef} · Section {req.section}
                </p>
              )}
              {req.expiresAt && !isTerminal(stage) && (
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-amber-600 mt-1">
                  Expires {new Date(req.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
            <StatusBadge status={req.status} />
          </div>

          {/* Customer note */}
          {req.customerNote && (
            <Section title="Customer's Request">
              <div className="bg-sand-light/40 p-4 rounded-sm">
                <p className="font-equip text-sm text-gdd-black/70 italic whitespace-pre-wrap">
                  "{req.customerNote}"
                </p>
                {req.estimatedDelta != null && (
                  <p className="font-equip text-[10px] text-gdd-black/40 mt-2">
                    Customer estimate: {req.estimatedDelta} {currency}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section title="Current">
              <ReadableBlock value={req.currentSnapshot} />
            </Section>
            <Section title="Proposed">
              <ReadableBlock value={req.proposedChanges} />
            </Section>
          </div>

          {/* Seat lists for seats section */}
          {req.section === 'seats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Section title="Seats Released">
                <p className="font-equip text-xs text-gdd-black/60">
                  {req.releasedSeatIds?.length ? req.releasedSeatIds.join(', ') : '—'}
                </p>
              </Section>
              <Section title="Seats Held (replacement)">
                <p className="font-equip text-xs text-gdd-black/60">
                  {req.heldSeatIds?.length ? req.heldSeatIds.join(', ') : '—'}
                </p>
              </Section>
            </div>
          )}

          {/* Final delta editor */}
          <Section title="Final Price Delta">
            {isTerminal(stage) ? (
              <div className="bg-sand-light/40 p-4 rounded-sm">
                <p className="font-equip text-sm text-gdd-black">
                  {req.finalDelta != null
                    ? <>Delta: <strong>{req.finalDelta}</strong> {req.paymentLink?.currency || 'USD'}</>
                    : 'No delta recorded'}
                </p>
                {req.finalDeltaNotes && (
                  <p className="font-equip text-xs text-gdd-black/50 mt-1">{req.finalDeltaNotes}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Delta (positive = customer owes)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={finalDelta}
                      onChange={(e) => setFinalDelta(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>AED</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={finalDeltaNotes}
                  onChange={(e) => setFinalDeltaNotes(e.target.value)}
                  placeholder="Notes for the customer about the price difference"
                  rows={2}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <p className="font-equip text-[10px] text-gdd-black/40">
                  Approving with delta &gt; 0 generates a payment link and flips status to{' '}
                  <code>awaiting-payment</code>. Approving with delta ≤ 0 jumps straight to{' '}
                  <code>approved</code> — ready to apply.
                </p>
              </div>
            )}
          </Section>

          {/* Payment link surface */}
          {req.paymentLink && (
            <Section title="Payment">
              <div className="bg-sand-light/40 p-4 rounded-sm">
                <p className="font-equip text-sm text-gdd-black">
                  {req.paymentLink.amount} {req.paymentLink.currency} · status{' '}
                  <code>{req.paymentLink.status}</code>
                </p>
                {req.paymentLink.url && (
                  <p className="font-equip text-[11px] text-gdd-black/50 mt-1 break-all">
                    Link: {req.paymentLink.url}
                  </p>
                )}
                {req.paymentLink.paidAt && (
                  <p className="font-equip text-[10px] text-gdd-black/40 mt-1">
                    Paid {new Date(req.paymentLink.paidAt).toLocaleString()}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Notes */}
          <Section title={`Notes (${req.adminNotes?.length || 0})`}>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {req.adminNotes?.length > 0 ? (
                req.adminNotes.map((n, i) => (
                  <div key={i} className="bg-sand-light/30 px-3 py-2 rounded-sm">
                    <p className="font-equip text-sm text-gdd-black/80">{n.text}</p>
                    <p className="font-equip text-[10px] text-gdd-black/40 mt-1">
                      {n.by || 'system'} · {n.at ? new Date(n.at).toLocaleString() : ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-equip text-xs text-gdd-black/30 italic">No notes yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note…"
                className="flex-1 px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || update.isPending}
                className="px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </Section>

          {/* Deny form */}
          {showDeny && (
            <div ref={denySectionRef} className="border border-red-200 bg-red-50/50 p-4 rounded-sm space-y-2">
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-red-700/70">
                Deny Reason
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={2}
                placeholder="Why are you denying this modification?"
                className="w-full px-3 py-2 border border-red-200 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-red-300"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeny(false)}
                  className="px-3 py-1.5 font-equip text-[10px] uppercase tracking-widest-plus text-gdd-black/50 hover:text-gdd-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeny}
                  disabled={!denyReason.trim() || deny.isPending}
                  className="px-4 py-1.5 bg-red-600 text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  {deny.isPending ? 'Denying…' : 'Confirm Deny'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
