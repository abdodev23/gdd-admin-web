import { create } from 'zustand'
import { mockBookings } from '@/data/mockBookings'
import { tickets } from '@/data/tickets'
import { hotels } from '@/data/hotels'
import { activities } from '@/data/activities'
import { transfers } from '@/data/transfers'
import { sightseeing } from '@/data/sightseeing'
import { experiences, bespokePackage } from '@/data/experiences'
import { mockEvents } from '@/data/mockEvents'
import { mockPromos } from '@/data/mockPromos'
import { mockEmails } from '@/data/mockEmails'
import { mockVipAllocations } from '@/data/mockVipAllocations'
import { mockRequests } from '@/data/mockRequests'
import { mockUsers } from '@/data/mockUsers'

const useDataStore = create((set, get) => ({
  bookings: [...mockBookings],
  events: [...mockEvents],
  tickets: [...tickets],
  hotels: [...hotels],
  activities: [...activities],
  transfers: [...transfers],
  sightseeing: [...sightseeing],
  experiences: [...experiences],
  bespokePackage,
  promos: [...mockPromos],
  emails: [...mockEmails],
  vipAllocations: [...mockVipAllocations],
  requests: [...mockRequests],
  users: [...mockUsers],
  paymentLinks: [],

  generatePaymentLink: (requestId, amount) => {
    const url = `https://pay.galadedanza.com/link/${requestId}`
    const link = { url, amount, status: 'pending', createdAt: new Date().toISOString() }
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, paymentLink: link } : r
      ),
      paymentLinks: [...state.paymentLinks, { id: `pl-${Date.now()}`, requestId, ...link }],
    }))
    return link
  },

  markPaymentLinkPaid: (requestId) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId && r.paymentLink
          ? { ...r, paymentLink: { ...r.paymentLink, status: 'paid' } }
          : r
      ),
      paymentLinks: state.paymentLinks.map((pl) =>
        pl.requestId === requestId ? { ...pl, status: 'paid' } : pl
      ),
    })),

  saveProposal: (requestId, proposal) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId
          ? { ...r, proposal: { ...proposal, createdAt: new Date().toISOString() } }
          : r
      ),
    })),

  addItem: (collection, item) =>
    set((state) => ({
      [collection]: [...state[collection], { ...item, id: `${collection}-${Date.now()}` }],
    })),

  updateItem: (collection, id, updates) =>
    set((state) => ({
      [collection]: state[collection].map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  deleteItem: (collection, id) =>
    set((state) => ({
      [collection]: state[collection].filter((item) => item.id !== id),
    })),

  getStats: () => {
    const state = get()
    const paidBookings = state.bookings.filter((b) => b.paymentStatus === 'paid')
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.total, 0)
    const totalBookings = state.bookings.length
    const ticketsSold = state.tickets.reduce((sum, t) => sum + t.sold, 0)
    const totalSeats = state.tickets.reduce((sum, t) => sum + t.totalSeats, 0)
    const seatOccupancy = totalSeats > 0 ? Math.round((ticketsSold / totalSeats) * 100) : 0
    const confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed').length
    const pendingBookings = state.bookings.filter((b) => b.status === 'pending').length
    const vipAllocated = state.vipAllocations.filter((v) => v.status !== 'unassigned').length

    return {
      totalRevenue,
      totalBookings,
      ticketsSold,
      totalSeats,
      seatOccupancy,
      confirmedBookings,
      pendingBookings,
      vipAllocated,
      vipTotal: 150,
    }
  },
}))

export default useDataStore
