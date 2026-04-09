import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Calendar, Ticket, Grid3X3,
  Building2, Compass, MapPin, Car, Tag,
  MessageSquare, Users, Settings, X, BarChart2, ArrowLeftRight, Wallet,
} from 'lucide-react'
import useAdminStore from '@/store/useAdminStore'
import { cn } from '@/utils/cn'

const navItems = [
  { group: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/bookings', icon: BookOpen, label: 'Bookings' },
  ]},
  { group: 'Event', items: [
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/tickets', icon: Ticket, label: 'Tickets' },
    { to: '/seating', icon: Grid3X3, label: 'Seating' },
  ]},
  { group: 'Packages', items: [
    { to: '/hotels', icon: Building2, label: 'Hotels' },
    { to: '/hotels/guests', icon: BarChart2, label: 'Hotels Guests Report' },
    { to: '/packages', icon: Compass, label: 'Packages & Itineraries' },
    { to: '/activities', icon: MapPin, label: 'Activities' },
    { to: '/transfers', icon: Car, label: 'Transfers' },
    { to: '/transfers/requests', icon: ArrowLeftRight, label: 'Requested Transfers' },
  ]},
  { group: 'Marketing', items: [
    { to: '/promos', icon: Tag, label: 'Promo Codes' },
    // { to: '/marketing', icon: Mail, label: 'Marketing' }, // disabled — not needed now
    // { to: '/vip', icon: Crown, label: 'VIP Management' }, // disabled — not needed now
  ]},
  { group: 'Finance', items: [
    { to: '/financial', icon: Wallet, label: 'Financial Center' },
  ]},
  { group: 'Support', items: [
    { to: '/requests', icon: MessageSquare, label: 'Requests' },
    { to: '/users', icon: Users, label: 'Users & Roles' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
]

function SidebarContent({ onClose }) {
  return (
    <div className="flex flex-col h-full bg-gdd-black">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/images/logos/2026 GDD_Logomark_White.png" alt="GDD" className="h-7" />
          <span className="font-equip text-xs tracking-widest-plus uppercase text-white">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="px-3 mb-2 font-equip text-[9px] tracking-widest-plus uppercase text-white/20">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 mb-0.5 rounded-sm font-equip text-sm transition-all duration-200',
                  isActive
                    ? 'text-gold bg-white/5 border-l-2 border-gold'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03] border-l-2 border-transparent'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="font-equip text-xs font-medium text-gold">AH</span>
          </div>
          <div>
            <p className="font-equip text-xs text-white/70">Ahmed Hassan</p>
            <p className="font-equip text-[10px] text-white/30">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAdminStore()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-gdd-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
