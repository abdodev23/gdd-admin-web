import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatCurrency } from '@/utils/formatCurrency'
import {
  useSpecialRequest,
  useUpdateSpecialRequest,
  useProposeSpecialRequest,
  useMarkSpecialRequestPaid,
  useEmailSpecialRequestSGI,
  useDeclineSpecialRequest,
  useFulfillSpecialRequest,
} from '@/api/hooks/useSpecialRequests'

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

const isTerminal = (status) => ['fulfilled', 'declined'].includes(status)

/**
 * Modal that walks an admin through the SpecialRequest state machine.
 *
 * Layout: booking summary at top, then sections for the original message
 * (with translation editor), proposal/payment, SGI forwarding, notes
 * timeline, and finally a row of state-machine action buttons.
 *
 * Each action button calls a dedicated mutation hook so React Query
 * invalidations + toasts come for free.
 */
export default function SpecialRequestModal({ requestId, onClose }) {
  const { data: req, isLoading, isError } = useSpecialRequest(requestId)
  const update = useUpdateSpecialRequest()
  const propose = useProposeSpecialRequest()
  const markPaid = useMarkSpecialRequestPaid()
  const emailSGI = useEmailSpecialRequestSGI()
  const decline = useDeclineSpecialRequest()
  const fulfill = useFulfillSpecialRequest()

  const [translation, setTranslation] = useState('')
  const [proposalAmount, setProposalAmount] = useState('')
  const [proposalCurrency, setProposalCurrency] = useState('USD')
  const [proposalMessage, setProposalMessage] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (req) {
      setTranslation(req.translatedMessage || '')
      setProposalAmount(req.paymentLink?.amount || '')
      setProposalCurrency(req.paymentLink?.currency || 'USD')
      setShowDecline(false)
      setDeclineReason('')
      setNewNote('')
    }
  }, [req])

  const saveTranslation = () => {
    if (!req || translation === req.translatedMessage) return
    update.mutate({ id: req._id, translatedMessage: translation })
  }

  const advanceToInReview = () => {
    if (!req) return
    update.mutate({ id: req._id, status: 'in-review' })
  }

  const sendProposal = () => {
    if (!req || !proposalAmount) return
    propose.mutate(
      {
        id: req._id,
        amount: Number(proposalAmount),
        currency: proposalCurrency,
        message: proposalMessage,
      },
      { onSuccess: () => setProposalMessage('') }
    )
  }

  const handleMarkPaid = () => {
    if (!req) return
    markPaid.mutate(req._id)
  }

  const handleEmailSGI = () => {
    if (!req) return
    emailSGI.mutate(req._id)
  }

  const handleDecline = () => {
    if (!req) return
    decline.mutate(
      { id: req._id, reason: declineReason },
      { onSuccess: () => setShowDecline(false) }
    )
  }

  const handleFulfill = () => {
    if (!req) return
    fulfill.mutate({ id: req._id, note: 'Marked fulfilled by admin' })
  }

  const handleAddNote = () => {
    if (!req || !newNote.trim()) return
    update.mutate(
      { id: req._id, note: newNote.trim() },
      { onSuccess: () => setNewNote('') }
    )
  }

  const title = req
    ? `Special Request — ${req.bookingRef || req._id?.slice(-6)}`
    : 'Special Request'

  return (
    <Modal
      isOpen={!!requestId}
      onClose={onClose}
      title={title}
      size="xl"
      footer={req && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {req.status === 'new' && (
              <button
                onClick={advanceToInReview}
                disabled={update.isPending}
                className="px-4 py-2 border border-gdd-black/20 font-equip text-xs uppercase tracking-widest-plus text-gdd-black rounded-sm hover:bg-sand-light/50 disabled:opacity-40 transition-colors"
              >
                Mark In Review
              </button>
            )}
            {!isTerminal(req.status) && req.status !== 'new' && (
              <button
                onClick={handleFulfill}
                disabled={fulfill.isPending}
                className="px-4 py-2 bg-status-green text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-status-green/90 disabled:opacity-40 transition-colors"
              >
                {fulfill.isPending ? 'Saving…' : 'Mark Fulfilled'}
              </button>
            )}
            {!isTerminal(req.status) && !showDecline && (
              <button
                onClick={() => setShowDecline(true)}
                className="px-4 py-2 border border-red-200 font-equip text-xs uppercase tracking-widest-plus text-red-500 rounded-sm hover:bg-red-50 transition-colors"
              >
                Decline
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
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={req.status} />
              {req.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {req.categories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-gold/10 text-gold-deep font-equip text-[10px] tracking-widest-plus uppercase rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Original message */}
          <Section
            title={`Original Message ${req.languageFlag ? req.languageFlag : ''} ${req.originalLanguage?.toUpperCase() || ''}`}
          >
            <div className="bg-sand-light/40 p-4 rounded-sm">
              <p className="font-equip text-sm text-gdd-black/70 italic whitespace-pre-wrap">
                "{req.originalMessage}"
              </p>
            </div>
          </Section>

          {/* Translation */}
          <Section title="Translation (English)">
            <textarea
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              onBlur={saveTranslation}
              placeholder={req.originalLanguage === 'en' ? '(no translation needed)' : 'Paste an English translation here…'}
              rows={3}
              disabled={isTerminal(req.status)}
              className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold disabled:bg-sand-light/30 disabled:cursor-not-allowed"
            />
            <p className="font-equip text-[10px] text-gdd-black/30 mt-1">Auto-saves on blur.</p>
          </Section>

          {/* Proposal & Payment */}
          {!isTerminal(req.status) && (
            <Section title="Proposal & Payment Link">
              {req.paymentLink?.url ? (
                <div className="bg-sand-light/40 p-4 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-equip text-sm text-gdd-black">
                      {formatCurrency(req.paymentLink.amount)} {req.paymentLink.currency}
                    </span>
                    <StatusBadge status={req.paymentLink.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-1.5 bg-white border border-gdd-black/10 rounded-sm font-equip text-[11px] text-gdd-black/70 truncate">
                      {req.paymentLink.url}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(req.paymentLink.url)}
                      className="px-3 py-1.5 border border-gdd-black/10 font-equip text-[10px] uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  {req.paymentLink.status === 'pending' && (
                    <button
                      onClick={handleMarkPaid}
                      disabled={markPaid.isPending}
                      className="w-full mt-2 px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
                    >
                      {markPaid.isPending ? 'Marking…' : 'Mark as Paid'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Amount</label>
                      <input
                        type="number"
                        value={proposalAmount}
                        onChange={(e) => setProposalAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1">Currency</label>
                      <select
                        value={proposalCurrency}
                        onChange={(e) => setProposalCurrency(e.target.value)}
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
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    placeholder="Optional message to the guest…"
                    rows={2}
                    className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    onClick={sendProposal}
                    disabled={!proposalAmount || propose.isPending}
                    className="w-full px-4 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 transition-colors"
                  >
                    {propose.isPending ? 'Sending…' : 'Send Proposal & Generate Link'}
                  </button>
                </div>
              )}
            </Section>
          )}

          {/* SGI forwarding */}
          {!isTerminal(req.status) && (
            <Section title="SGI Operations">
              {req.emailSentToSGI ? (
                <div className="bg-status-green/10 px-4 py-3 rounded-sm">
                  <p className="font-equip text-xs text-status-green font-medium">
                    Forwarded to SGI on {req.emailSentAt ? new Date(req.emailSentAt).toLocaleString() : '—'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleEmailSGI}
                  disabled={emailSGI.isPending}
                  className="w-full px-4 py-2 border border-gdd-black/20 font-equip text-xs uppercase tracking-widest-plus text-gdd-black rounded-sm hover:bg-sand-light/50 disabled:opacity-40 transition-colors"
                >
                  {emailSGI.isPending ? 'Sending…' : 'Forward to SGI Team'}
                </button>
              )}
            </Section>
          )}

          {/* Notes */}
          <Section title={`Notes (${req.notes?.length || 0})`}>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {req.notes?.length > 0 ? (
                req.notes.map((n, i) => (
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

          {/* Decline form */}
          {showDecline && (
            <div className="border border-red-200 bg-red-50/50 p-4 rounded-sm space-y-2">
              <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-red-700/70">
                Decline Reason
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={2}
                placeholder="Why are you declining this request?"
                className="w-full px-3 py-2 border border-red-200 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-red-300"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDecline(false)}
                  className="px-3 py-1.5 font-equip text-[10px] uppercase tracking-widest-plus text-gdd-black/50 hover:text-gdd-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  disabled={decline.isPending}
                  className="px-4 py-1.5 bg-red-600 text-white font-equip text-[10px] uppercase tracking-widest-plus rounded-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  {decline.isPending ? 'Declining…' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </Modal>
  )
}
