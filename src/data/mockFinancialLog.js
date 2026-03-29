import { mockBookings } from './mockBookings'

const tierPrices = { general: 75, premium: 150, vip: 1000 }
const nightlyRates = {
  'Four Seasons Nile Plaza': 350,
  'Kempinski Nile Hotel': 280,
  'Marriott Mena House': 220,
  'Hyatt Centric Cairo West': 180,
  'Sofitel Cairo Nile El Gezirah': 300,
  'Steigenberger Hotel El Tahrir': 160,
  'Le Meridien Pyramids Hotel & Spa': 200,
}
const activityPrices = {
  'Pyramids of Giza Guided Tour': 85,
  'Nile Felucca Sunset Ride': 60,
  'Old Cairo Walking Tour': 45,
  'Khan el-Khalili Bazaar Experience': 40,
  'Egyptian Cooking Class': 55,
  'Sound & Light Show at Pyramids': 70,
  'Saqqara & Memphis Day Trip': 95,
  'Egyptian Museum of Antiquities': 50,
  'Citadel of Saladin & Mohamed Ali Mosque': 65,
  'Sphinx & Solar Boat Museum': 55,
  'Al-Azhar Park Sunset Experience': 35,
}
const transferPrices = { vip: 120, basic: 60 }
const insurancePrice = 45

const admins = ['Ahmed Hassan', 'Sarah Mitchell']
const actions = ['Payment confirmed', 'Booking created', 'Status updated', 'Invoice generated', 'Record reviewed']

function pickAdmin(index) {
  return admins[index % admins.length]
}

function pickAction(index) {
  return actions[index % actions.length]
}

const counters = { TK: 0, HT: 0, ACT: 0, TRF: 0, INS: 0 }

function nextId(prefix) {
  counters[prefix] += 1
  return `${prefix}-${String(counters[prefix]).padStart(3, '0')}`
}

function buildEntry(booking, type, prefix, description, amount, idx) {
  const id = nextId(prefix)
  const isDiscounted = !!booking.promoCode
  const discountPct = booking.subtotal > 0 ? booking.discount / booking.subtotal : 0
  const discountAmount = isDiscounted ? Math.round(amount * discountPct) : 0

  return {
    id,
    bookingRef: booking.id,
    type,
    customerName: booking.customerName,
    email: booking.email,
    description,
    amount,
    status: booking.paymentStatus,
    isDiscounted,
    discountMethod: isDiscounted ? `Promo Code: ${booking.promoCode}` : null,
    discountAmount,
    lastActivity: {
      admin: pickAdmin(idx),
      action: pickAction(idx),
      date: booking.createdAt,
    },
    paymentInvoice: booking.paymentStatus === 'paid' ? `https://pay.galadedanza.com/invoice/${id}` : null,
    createdAt: booking.createdAt,
  }
}

let entryIdx = 0
export const financialLog = mockBookings.flatMap((booking) => {
  const entries = []

  // Ticket entry
  const ticketPrice = tierPrices[booking.ticketTier] || 75
  entries.push(buildEntry(booking, 'Ticket', 'TK', `${booking.ticketTier.charAt(0).toUpperCase() + booking.ticketTier.slice(1)} ticket — ${booking.seatId}`, ticketPrice, entryIdx++))

  // Hotel entry
  if (booking.hotel) {
    const rate = nightlyRates[booking.hotel] || 200
    const hotelAmount = booking.hotelNights * rate
    entries.push(buildEntry(booking, 'Hotel', 'HT', `${booking.hotel} — ${booking.hotelNights} nights`, hotelAmount, entryIdx++))
  }

  // Activity entries
  if (booking.activities && booking.activities.length > 0) {
    booking.activities.forEach((activity) => {
      const actPrice = activityPrices[activity] || 50
      entries.push(buildEntry(booking, 'Activity', 'ACT', activity, actPrice, entryIdx++))
    })
  }

  // Transfer entry
  if (booking.transfer) {
    const trfPrice = transferPrices[booking.transfer] || 60
    entries.push(buildEntry(booking, 'Transfer', 'TRF', `${booking.transfer.charAt(0).toUpperCase() + booking.transfer.slice(1)} transfer`, trfPrice, entryIdx++))
  }

  // Insurance entry
  if (booking.insurance === true) {
    entries.push(buildEntry(booking, 'Insurance', 'INS', 'Travel insurance', insurancePrice, entryIdx++))
  }

  return entries
})
