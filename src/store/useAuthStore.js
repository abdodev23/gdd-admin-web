import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import client from '@/api/client'

const ADMIN_ROLES = ['super-admin', 'admin', 'manager', 'viewer']

/**
 * Admin auth store.
 *
 * - `loading` is true until Firebase has resolved the initial auth state
 *   AND we've fetched the user's role from the backend.
 * - `user` holds Firebase user info; `dbUser` holds the MongoDB User doc.
 * - `role` is null until dbUser is loaded.
 * - `signIn` rejects (and signs out) any account whose role is not in
 *   ADMIN_ROLES — that's the "regular users can't access admin" gate.
 */
const useAuthStore = create((set, get) => ({
  user:    null,
  dbUser:  null,
  role:    null,
  loading: true,

  // Called once on app mount. Subscribes to Firebase auth state and keeps
  // dbUser/role in sync. Returns the unsubscribe function.
  initAuth: () => {
    if (!auth) {
      set({ loading: false })
      return () => {}
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, dbUser: null, role: null, loading: false })
        return
      }

      // Firebase user resolved — now fetch the role from the backend
      try {
        const { data: dbUser } = await client.get('/users/me')

        // If the role isn't admin-level, sign them right back out.
        // This is the "regular users can't log in" gate.
        if (!ADMIN_ROLES.includes(dbUser?.role)) {
          await fbSignOut(auth)
          set({ user: null, dbUser: null, role: null, loading: false })
          return
        }

        set({
          user: {
            uid:           firebaseUser.uid,
            email:         firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
          },
          dbUser,
          role:    dbUser.role,
          loading: false,
        })
      } catch (err) {
        // Backend unreachable or no User doc — sign out for safety
        console.error('Failed to fetch /users/me:', err.message)
        await fbSignOut(auth)
        set({ user: null, dbUser: null, role: null, loading: false })
      }
    })
  },

  // Sign in. Returns { success: true } or { success: false, error }.
  // The role check happens automatically via the onAuthStateChanged listener
  // above — we just have to wait for it to settle.
  signIn: async (email, password) => {
    if (!auth) return { success: false, error: 'Firebase not configured' }
    try {
      await signInWithEmailAndPassword(auth, email, password)

      // Wait briefly for the auth state listener to fetch the role and
      // either accept or reject. We poll up to 5 seconds.
      for (let i = 0; i < 50; i++) {
        await new Promise((r) => setTimeout(r, 100))
        const { role, loading } = get()
        if (loading) continue
        if (role) return { success: true }
        return { success: false, error: 'This account does not have admin access.' }
      }
      return { success: false, error: 'Sign-in timed out. Please try again.' }
    } catch (err) {
      return { success: false, error: friendlyError(err.code) }
    }
  },

  signOut: async () => {
    if (auth) await fbSignOut(auth)
    set({ user: null, dbUser: null, role: null })
  },

  // Convenience: check if current role can perform an action
  hasRole: (...allowed) => allowed.includes(get().role),
}))

const friendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-email':       return 'Invalid email address.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':  return 'Invalid email or password.'
    case 'auth/too-many-requests':   return 'Too many attempts. Please try again later.'
    default:                         return 'Sign-in failed. Please try again.'
  }
}

export default useAuthStore
