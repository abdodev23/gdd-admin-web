import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — GDD Admin</title>
      </Helmet>

      <div className="min-h-screen bg-sand-light flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-medino uppercase text-gold" style={{ fontSize: 'clamp(56px, 8vw, 88px)', lineHeight: 1 }}>
            404
          </p>
          <h1 className="font-medino uppercase text-gdd-black mt-2" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>
            Page Not Found
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mt-4 mb-4" />
          <p className="font-equip text-sm text-gdd-black/60">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/"
              className="font-equip text-xs tracking-widest-plus uppercase px-6 py-3 bg-gdd-black text-white hover:bg-gdd-black/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
