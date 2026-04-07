import { create } from 'zustand'

const DEFAULT_DURATION = 5000

let nextId = 1

const useToastStore = create((set, get) => ({
  toasts: [], // [{ id, type, message, duration }]

  push: (message, { type = 'error', duration = DEFAULT_DURATION } = {}) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, type, message, duration }] }))
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
    return id
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}))

// Convenience helpers
export const toast = {
  error:   (msg, opts) => useToastStore.getState().push(msg, { ...opts, type: 'error' }),
  success: (msg, opts) => useToastStore.getState().push(msg, { ...opts, type: 'success' }),
  info:    (msg, opts) => useToastStore.getState().push(msg, { ...opts, type: 'info' }),
  warning: (msg, opts) => useToastStore.getState().push(msg, { ...opts, type: 'warning' }),
  dismiss: (id) => useToastStore.getState().dismiss(id),
}

export default useToastStore
