import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'

/**
 * RoleGate — wraps a route (or subtree) and only renders children if the
 * current user is signed in AND has one of the allowed roles.
 *
 *   <RoleGate><AdminLayout /></RoleGate>           // any admin role
 *   <RoleGate roles={['super-admin']}><Foo /></RoleGate>
 *
 * Default allowed roles: every admin tier (super-admin, admin, manager, viewer).
 */
const DEFAULT_ROLES = ['super-admin', 'admin', 'manager', 'viewer']

export default function RoleGate({ children, roles = DEFAULT_ROLES }) {
  const { role, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(role)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
