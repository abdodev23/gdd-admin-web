import { create } from 'zustand'

const useAdminStore = create((set) => ({
  sidebarOpen: false,
  searchQuery: '',
  notifications: [
    { id: 1, message: 'New VIP booking from James Anderson', time: '5 min ago', read: false },
    { id: 2, message: 'Promo code GALA10 reaching usage limit', time: '1 hour ago', read: false },
    { id: 3, message: 'Special request requires translation', time: '3 hours ago', read: true },
    { id: 4, message: 'New VVIP allocation confirmed', time: '5 hours ago', read: true },
  ],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}))

export default useAdminStore
