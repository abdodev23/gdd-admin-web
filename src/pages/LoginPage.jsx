import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/useAuthStore'
import { toast } from '@/store/useToastStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, role, loading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If already signed in as admin, redirect to where they were going
  useEffect(() => {
    if (!loading && role) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [role, loading, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!email.trim() || !password) {
      toast.warning('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (!result.success) {
      toast.error(result.error || 'Sign-in failed.')
    }
    // On success, the useEffect above redirects.
  }

  return (
    <>
      <Helmet>
        <title>Sign In — GDD Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gdd-black flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="font-medino uppercase text-white" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>
              GDD Admin
            </h1>
            <div className="w-20 h-px bg-gold mx-auto mt-3 mb-3" />
            <p className="font-equip text-xs tracking-widest-plus uppercase text-white/40">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 space-y-5">
            <div>
              <label className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gdd-black/10 bg-sand-light/50 px-4 py-3 font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="font-equip text-[10px] tracking-widest-plus uppercase text-gdd-black/40 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gdd-black/10 bg-sand-light/50 px-4 py-3 font-equip text-sm text-gdd-black focus:outline-none focus:ring-1 focus:ring-gold"
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-gdd-black text-white font-equip text-xs tracking-widest-plus uppercase py-4 hover:bg-gdd-black/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="font-equip text-[10px] text-white/30 text-center mt-6">
            Admin access only. Customer accounts cannot sign in here.
          </p>
        </motion.div>
      </div>
    </>
  )
}
