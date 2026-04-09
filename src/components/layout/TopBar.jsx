import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import useAdminStore from '@/store/useAdminStore'
import useAuthStore from '@/store/useAuthStore'
import SearchInput from '@/components/ui/SearchInput'

const pageNames = {
  '/': 'Dashboard',
  '/bookings': 'Bookings',
  '/events': 'Events',
  '/tickets': 'Tickets',
  '/seating': 'Seating',
  '/hotels': 'Hotels',
  '/experiences': 'Experiences',
  '/activities': 'Activities',
  '/transfers': 'Transfers',
  '/promos': 'Promo Codes',
  '/marketing': 'Marketing',
  '/vip': 'VIP Management',
  '/requests': 'Requests',
  '/users': 'Users & Roles',
  '/settings': 'Settings',
}

const roleLabels = {
  'super-admin': 'Super Admin',
  'admin':       'Admin',
  'manager':     'Manager',
  'viewer':      'Viewer',
}

const initials = (email) => {
  if (!email) return '?'
  const [name] = email.split('@')
  const parts = name.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function TopBar() {
  const location = useLocation()
  const { toggleSidebar, searchQuery, setSearchQuery, notifications } = useAdminStore()
  const { user, role, signOut } = useAuthStore()

  const unreadCount = notifications.filter((n) => !n.read).length
  const pageName = pageNames[location.pathname] || 'Dashboard'

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gdd-black/5 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 text-gdd-black/50 hover:text-gdd-black transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-equip font-medium text-lg text-gdd-black">{pageName}</h2>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
          className="hidden md:block w-64"
        />

        <button className="relative p-2 text-gdd-black/40 hover:text-gdd-black transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-status-red rounded-full flex items-center justify-center">
              <span className="text-[9px] font-equip font-medium text-white">{unreadCount}</span>
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-3 group"
          >
            <div className="hidden sm:block text-right">
              <p className="font-equip text-xs text-gdd-black leading-tight">
                {user?.email || 'Not signed in'}
              </p>
              <p className="font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/40 leading-tight">
                {roleLabels[role] || role || '—'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gdd-black flex items-center justify-center group-hover:bg-gold-deep transition-colors">
              <span className="font-equip text-xs font-medium text-gold">
                {initials(user?.email)}
              </span>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gdd-black/10 shadow-lg rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gdd-black/5">
                <p className="font-equip text-xs text-gdd-black truncate">{user?.email}</p>
                <p className="font-equip text-[9px] tracking-widest-plus uppercase text-gdd-black/40 mt-0.5">
                  {roleLabels[role] || role}
                </p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  signOut()
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-left font-equip text-xs text-gdd-black hover:bg-sand-light transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
