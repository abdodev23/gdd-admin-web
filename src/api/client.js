import axios from 'axios'
import { auth } from '@/config/firebase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Attach a fresh Firebase ID token on every request. We deliberately do NOT
// cache the token in localStorage — Firebase handles refresh internally and
// always returns a valid one via getIdToken().
client.interceptors.request.use(async (config) => {
  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    } catch (err) {
      console.warn('Failed to get Firebase ID token:', err.message)
    }
  }
  return config
})

// Surface backend errors to the toast store. The store is imported lazily
// to avoid a circular dependency at module-load time.
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response) {
      const { status, data } = err.response
      const message = data?.error || data?.message || err.message || 'Request failed'

      // Don't toast 401s — they happen during normal sign-in flow
      if (status !== 401) {
        try {
          const { toast } = await import('@/store/useToastStore')
          toast.error(message)
        } catch {
          console.error(`[API ${status}]`, message)
        }
      }
    }
    return Promise.reject(err)
  }
)

export default client
