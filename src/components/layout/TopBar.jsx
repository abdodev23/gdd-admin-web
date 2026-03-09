import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import useAdminStore from '@/store/useAdminStore'
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
  '/requests': 'Special Requests',
  '/users': 'Users & Roles',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const { toggleSidebar, searchQuery, setSearchQuery, notifications } = useAdminStore()
  const unreadCount = notifications.filter((n) => !n.read).length
  const pageName = pageNames[location.pathname] || 'Dashboard'

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

        <div className="w-8 h-8 rounded-full bg-gdd-black flex items-center justify-center">
          <span className="font-equip text-xs font-medium text-gold">AH</span>
        </div>
      </div>
    </header>
  )
}
