import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  useContactSubmission,
  useUpdateContactSubmission,
} from '@/api/hooks/useContact'

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
      {title}
    </h3>
    {children}
  </div>
)

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in-review', label: 'In Review' },
  { value: 'handled', label: 'Handled' },
]

/**
 * Read + lightly mutate a single ContactSubmission. Admin can flip the
 * status, append internal notes, and (when status is set to handled) the
 * server stamps handledAt/handledBy automatically.
 */
export default function ContactModal({ submissionId, onClose }) {
  const { data: doc, isLoading, isError } = useContactSubmission(submissionId)
  const update = useUpdateContactSubmission()

  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (doc) setNewNote('')
  }, [doc])

  const handleStatus = (status) => {
    if (!doc || status === doc.status) return
    update.mutate({ id: doc._id, status })
  }

  const handleAddNote = () => {
    if (!doc || !newNote.trim()) return
    update.mutate(
      { id: doc._id, note: newNote.trim() },
      { onSuccess: () => setNewNote('') }
    )
  }

  const title = doc
    ? `Contact — ${doc.name}`
    : 'Contact'

  return (
    <Modal
      isOpen={!!submissionId}
      onClose={onClose}
      title={title}
      size="xl"
      footer={doc && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatus(opt.value)}
                disabled={update.isPending || doc.status === opt.value}
                className={`px-4 py-2 border font-equip text-xs uppercase tracking-widest-plus rounded-sm transition-colors ${
                  doc.status === opt.value
                    ? 'bg-gdd-black text-white border-gdd-black'
                    : 'border-gdd-black/20 text-gdd-black hover:bg-sand-light/50'
                } disabled:opacity-40`}
              >
                {opt.label}
              </button>
            ))}
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
        <div className="py-12 text-center font-equip text-sm text-red-500">Failed to load submission.</div>
      )}
      {doc && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gdd-black/5 pb-4">
            <div>
              <p className="font-equip text-sm font-medium text-gdd-black">{doc.name}</p>
              <p className="font-equip text-xs text-gdd-black/40 mt-0.5">
                <a href={`mailto:${doc.email}`} className="hover:text-gdd-black">{doc.email}</a>
              </p>
              <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30 mt-1">
                Received {new Date(doc.createdAt).toLocaleString()}
              </p>
              {doc.handledAt && (
                <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/30 mt-1">
                  Handled {new Date(doc.handledAt).toLocaleString()}
                  {doc.handledBy?.email ? ` · ${doc.handledBy.email}` : ''}
                </p>
              )}
            </div>
            <StatusBadge status={doc.status} />
          </div>

          {/* Subject */}
          <Section title="Subject">
            <p className="font-equip text-sm text-gdd-black">{doc.subject || '(no subject)'}</p>
          </Section>

          {/* Message */}
          <Section title="Message">
            <div className="bg-sand-light/40 p-4 rounded-sm">
              <p className="font-equip text-sm text-gdd-black/80 whitespace-pre-wrap">
                {doc.message}
              </p>
            </div>
          </Section>

          {/* Notes */}
          <Section title={`Notes (${doc.adminNotes?.length || 0})`}>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {doc.adminNotes?.length > 0 ? (
                doc.adminNotes.map((n, i) => (
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
        </div>
      )}
    </Modal>
  )
}
