import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  useCancellation,
  useUpdateCancellation,
  useApproveCancellation,
  useDenyCancellation,
} from '@/api/hooks/useCancellations'

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

const isTerminal = (status) => ['approved', 'denied'].includes(status)

/**
 * Modal that walks an admin through the CancellationRequest state machine.
 *
 * Sections: booking summary, customer reason (read-only), refund inputs (only
 * editable while pending/in-review), notes timeline. Footer has the
 * Approve / Mark In Review / Deny buttons.
 *
 * Approve writes the refund FinancialLog row, frees seats, and flips the
 * booking to cancelled+refunded server-side.
 */
export default function CancellationModal({ requestId, onClose }) {
  const { data: req, isLoading, isError } = useCancellation(requestId)
  const update = useUpdateCancellation()
  const approve = useApproveCancellation()
  const deny = useDenyCancellation()

  const [refundAmount, setRefundAmount] = useState('')
  const [refundCurrency, setRefundCurrency] = useState('USD')
  const [refundNotes, setRefundNotes] = useState('')
  const [denyReason, setDenyReason] = useState('')
  const [showDeny, setShowDeny] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (req) {
      setRefundAmount(req.refundAmount ?? '')
      setRefundCurrency(req.refundCurrency || 'USD')
      setRefundNotes(req.refundNotes || '')
      setShowDeny(false)
      setDenyReason('')
      setNewNote('')
    }
  }, [req])

  const advanceToInReview = () => {
    if (!req) return
    update.mutate({ id: req._id, status: 'in-review' })
  }

  const handleApprove = () => {
    if (!req) return
    if (refundAmount === '' || isNaN(Number(refundAmount)) || Number(refundAmount) < 0) return
    approve.mutate({
      id: req._id,
      refundAmount: Number(refundAmount),
      refundCurrency,
      refundNotes,
    })
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
    ? `Cancellation — ${req.bookingRef || req._id?.slice(-6)}`
    : 'Cancellation'

  return (
    <Modal
      isOpen={!!requestId}
      onClose={onClose}
      title={title}
      size="xl"
      footer={req && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {req.status === 'pending' && (
              <button
                onClick={advanceToInReview}
                disabled={update.isPending}
                className="px-4 py-2 border border-gdd-black/20 font-equip text-xs uppercase tracking-widest-plus text-gdd-black rounded-sm hover:bg-sand-light/50 disabled:opacity-40 transition-colors"
              >
                Mark In Review
              </button>
            )}
            {!isTerminal(req.status) && (
              <button
                onClick={handleApprove}
                disabled={
                  approve.isPending ||
                  refundAmount === '' ||
                  isNaN(Number(refundAmount)) ||
                  Number(refundAmount) < 0
                }
                className="px-4 py-2 bg-status-green text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-status-green/90 disabled:opacity-40 transition-colors"
              >
                {approve.isPending ? 'Approving…' : 'Approve & Refund'}
              </button>
            )}
            {!isTerminal(req.status) && !showDeny && (
              <button
                onClick={() => setShowDeny(true)}
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
          {/* Header / booking summary */}
          <div className="flex items-start justify-between border-b border-gdd-black/5 pb-4">
            <div>
              <p className="font-equip text-sm font-medium text-gdd-black">{req.guestName || '—'}</p>
              <p className="font-equip text-xs text-gdd-black/40 mt-0.5">{req.guestEmail || '—'}</p>
              {req.bookingRef && (
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30 mt-1">
                  Booking {req.bookingRef}
                </p>
              )}
              {req.bookingId?.total != null && (
                <p className="font-equip text-[11px] text-gdd-black/50 mt-1">
                  Booking total: {req.bookingId.total} {req.bookingId.currency || 'USD'}
                </p>
              )}
            </div>
            <StatusBadge status={req.status} />
          </div>

          {/* Customer reason */}
          <Section title="Customer's Reason">
            <div className="bg-sand-light/40 p-4 rounded-sm">
              <p className="font-equip text-sm text-gdd-black/70 italic whitespace-pre-wrap">
                "{req.reason}"
              </p>
            </div>
          </Section>

          {/* Refund inputs */}
          <Section title="Refund Amount">
            {isTerminal(req.status) ? (
              <div className="bg-sand-light/40 p-4 rounded-sm">
                {req.status === 'approved' ? (
                  <>
                    <p className="font-equip text-sm text-gdd-black">
                      Refunded <strong>{req.refundAmount}</strong> {req.refundCurrency || 'USD'}
                    </p>
                    {req.refundNotes && (
                      <p className="font-equip text-xs text-gdd-black/50 mt-1">{req.refundNotes}</p>
                    )}
                    {req.approvedAt && (
                      <p className="font-equip text-[10px] text-gdd-black/40 mt-2">
                        Approved {new Date(req.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-equip text-sm text-red-700">Denied</p>
                    {req.denyReason && (
                      <p className="font-equip text-xs text-gdd-black/50 mt-1 italic">"{req.denyReason}"</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Currency</label>
                    <select
                      value={refundCurrency}
                      onChange={(e) => setRefundCurrency(e.target.value)}
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
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Internal notes about the refund (which tier policy applied, etc.)"
                  rows={2}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <p className="font-equip text-[10px] text-gdd-black/40">
                  Approving will free the booking's seats, mark the booking <code>cancelled</code> +{' '}
                  <code>refunded</code>, write a refund FinancialLog row, and email the guest. Enter <code>0</code>{' '}
                  for a no-refund cancellation.
                </p>
              </div>
            )}
          </Section>

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
            <div className="border border-red-200 bg-red-50/50 p-4 rounded-sm space-y-2">
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-red-700/70">
                Deny Reason
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={2}
                placeholder="Why are you denying this cancellation? (Booking will revert to confirmed.)"
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
