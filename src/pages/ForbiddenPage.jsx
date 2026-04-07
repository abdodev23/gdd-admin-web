import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import useAuthStore from '@/store/useAuthStore'

export default function ForbiddenPage() {
  const { role, signOut } = useAuthStore()

  return (
    <>
      <Helmet>
        <title>Access Denied — GDD Admin</title>
      </Helmet>

      <div className="min-h-screen bg-sand-light flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-medino uppercase text-gdd-black" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Access Denied
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mt-4 mb-4" />
          <p className="font-equip text-sm text-gdd-black/60">
            Your role ({role || 'unknown'}) does not have permission to view this page.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="font-equip text-xs tracking-widest-plus uppercase px-6 py-3 bg-gdd-black text-white hover:bg-gdd-black/90 transition-colors"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={signOut}
              className="font-equip text-xs tracking-widest-plus uppercase px-6 py-3 border border-gdd-black/20 text-gdd-black/60 hover:bg-gdd-black hover:text-white hover:border-gdd-black transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
