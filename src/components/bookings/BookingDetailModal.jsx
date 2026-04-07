import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import { useBooking, useUpdateBooking } from '@/api/hooks/useBookings'
import { formatCurrency } from '@/utils/formatCurrency'

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancellation-pending', 'cancelled', 'refunded']
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-3">
      {title}
    </h3>
    {children}
  </div>
)

const Field = ({ label, value }) => (
  <div>
    <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
      {label}
    </p>
    <div className="font-equip text-sm text-gdd-black mt-0.5">{value ?? '—'}</div>
  </div>
)

const formatDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return String(d)
  }
}

/**
 * Renders the full real booking shape from the backend (multi-seat, embedded
 * rooms + addons, multi-activity with day-schedule, multi-transfer, special
 * request snapshot, guest info, pricing breakdown). Allows the admin to flip
 * status / paymentStatus inline.
 */
export default function BookingDetailModal({ bookingId, onClose }) {
  const { data: booking, isLoading, isError } = useBooking(bookingId)
  const updateBooking = useUpdateBooking()

  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  useEffect(() => {
    if (booking) {
      setStatus(booking.status || '')
      setPaymentStatus(booking.paymentStatus || '')
    }
  }, [booking])

  const handleSave = () => {
    if (!booking) return
    updateBooking.mutate(
      { id: booking._id, status, paymentStatus },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal isOpen={!!bookingId} onClose={onClose} title={booking ? `Booking ${booking.ref}` : 'Booking'} size="xl">
      {isLoading && (
        <div className="py-12 text-center font-equip text-sm text-gdd-black/40">Loading booking…</div>
      )}
      {isError && (
        <div className="py-12 text-center font-equip text-sm text-red-500">Failed to load booking.</div>
      )}

      {booking && (
        <div className="space-y-6">
          {/* Guest */}
          <Section title="Guest">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Name" value={`${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim()} />
              <Field label="Email" value={booking.guestEmail} />
              <Field label="Phone" value={booking.guestPhone} />
              <Field label="Nationality" value={booking.guestNationality} />
              <Field label="Flight" value={booking.flightNumber} />
              <Field label="Account" value={booking.userId?.email || booking.userId?._id || '—'} />
            </div>
          </Section>

          {/* Ticket / Package */}
          <Section title="Ticket & Package">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Tier" value={booking.ticketTier?.toUpperCase()} />
              <Field label="Ticket Name" value={booking.ticketName} />
              <Field label="Adults / Children" value={`${booking.adults ?? 0} / ${booking.children ?? 0}`} />
              <Field label="Package" value={booking.packageName || 'None'} />
              <Field label="Experience Path" value={booking.experiencePath || 'None'} />
            </div>
          </Section>

          {/* Seats */}
          {booking.seats?.length > 0 && (
            <Section title={`Seats (${booking.seats.length})`}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {booking.seats.map((s, i) => (
                  <div key={s.seatId || i} className="bg-sand-light/40 px-3 py-2 rounded-sm">
                    <p className="font-equip text-sm text-gdd-black">
                      Row {s.row} · Seat {s.number}
                    </p>
                    <p className="font-equip text-[10px] text-gdd-black/40 uppercase tracking-widest-plus">
                      {s.tierName || s.tier} · {formatCurrency(s.ticketPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Hotel */}
          {booking.hotelId && (
            <Section title="Hotel">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <Field label="Hotel" value={booking.hotelName} />
                <Field label="Nights" value={booking.hotelNights} />
                <Field label="Per Night" value={formatCurrency(booking.hotelPricePerNight)} />
                <Field label="Check-in" value={formatDate(booking.dateRange?.from)} />
                <Field label="Check-out" value={formatDate(booking.dateRange?.to)} />
              </div>
              {booking.rooms?.length > 0 && (
                <div className="space-y-2">
                  <p className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">Rooms</p>
                  {booking.rooms.map((r, i) => (
                    <div key={r.roomId || i} className="bg-sand-light/40 px-3 py-2 rounded-sm flex items-center justify-between">
                      <span className="font-equip text-sm text-gdd-black">
                        {r.name} × {r.quantity}
                      </span>
                      <span className="font-equip text-xs text-gdd-black/60">
                        {r.adultsCount}A / {r.childrenCount}C · +{formatCurrency(r.supplementPerNight)}/night
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Addons */}
          {booking.addons?.length > 0 && (
            <Section title="Addons">
              <ul className="space-y-1">
                {booking.addons.map((a, i) => (
                  <li key={a.addonId || i} className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>{a.name}</span>
                    <span>{formatCurrency(a.price)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Activities */}
          {booking.activities?.length > 0 && (
            <Section title="Activities">
              <ul className="space-y-1">
                {booking.activities.map((a, i) => (
                  <li key={a.activityId || i} className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>
                      {a.name}
                      {a.date && <span className="text-gdd-black/40"> · {a.date}</span>}
                      {a.timeSlot && <span className="text-gdd-black/40"> · {a.timeSlot}</span>}
                    </span>
                    <span>
                      {a.adultsCount || 0}A × {formatCurrency(a.price)}
                      {a.childrenCount > 0 && ` + ${a.childrenCount}C × ${formatCurrency(a.childPrice)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Transfers */}
          {booking.transfers?.length > 0 && (
            <Section title="Transfers">
              <ul className="space-y-1">
                {booking.transfers.map((t, i) => (
                  <li key={i} className="flex justify-between font-equip text-sm text-gdd-black/70">
                    <span>{t.routeId} · {t.carName}</span>
                    <span>{formatCurrency(t.price)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Day Schedule */}
          {booking.daySchedule && Object.keys(booking.daySchedule).length > 0 && (
            <Section title="Day Schedule">
              <pre className="bg-sand-light/40 p-3 rounded-sm font-equip text-[11px] text-gdd-black/70 overflow-x-auto">
                {JSON.stringify(booking.daySchedule, null, 2)}
              </pre>
            </Section>
          )}

          {/* Special Request */}
          {(booking.specialRequestMessage || booking.specialRequestCategories?.length > 0) && (
            <Section title="Special Request">
              {booking.specialRequestCategories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {booking.specialRequestCategories.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-gold/10 text-gold-deep font-equip text-[10px] uppercase tracking-widest-plus rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {booking.specialRequestMessage && (
                <p className="font-equip text-sm text-gdd-black/70 italic">"{booking.specialRequestMessage}"</p>
              )}
            </Section>
          )}

          {/* Pricing */}
          <Section title="Pricing Breakdown">
            <div className="space-y-2 bg-sand-light/30 p-4 rounded-sm">
              <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                <span>Subtotal</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.insurance && (
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>Insurance</span>
                  <span>{formatCurrency(booking.insurancePrice)}</span>
                </div>
              )}
              {booking.promoCode && (
                <div className="flex justify-between font-equip text-sm text-gdd-black/70">
                  <span>
                    Promo <span className="text-gold-deep font-medium">{booking.promoCode}</span>
                  </span>
                  <span className="text-red-500">-{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-equip text-sm font-medium text-gdd-black border-t border-gdd-black/10 pt-2">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(booking.total)}</span>
              </div>
            </div>
          </Section>

          {/* Status edit */}
          <Section title="Manage">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-equip text-[10px] font-medium tracking-widest-plus uppercase text-gdd-black/40 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gdd-black/10 rounded-sm font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {PAYMENT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40">
              <span>Current:</span>
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gdd-black/10">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gdd-black/10 font-equip text-xs uppercase tracking-widest-plus text-gdd-black/60 rounded-sm hover:bg-sand-light/50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={updateBooking.isPending || (status === booking.status && paymentStatus === booking.paymentStatus)}
              className="px-5 py-2 bg-gdd-black text-white font-equip text-xs uppercase tracking-widest-plus rounded-sm hover:bg-gdd-black/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {updateBooking.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
