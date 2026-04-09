import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import RoleGate from '@/components/auth/RoleGate'
import LoginPage from '@/pages/LoginPage'
import ForbiddenPage from '@/pages/ForbiddenPage'
import DashboardPage from '@/pages/DashboardPage'
import BookingsPage from '@/pages/BookingsPage'
import EventsPage from '@/pages/EventsPage'
import TicketsPage from '@/pages/TicketsPage'
import SeatingPage from '@/pages/SeatingPage'
import HotelsPage from '@/pages/HotelsPage'
import PackagesPage from '@/pages/PackagesPage'
import ActivitiesPage from '@/pages/ActivitiesPage'
import TransfersPage from '@/pages/TransfersPage'
import PromosPage from '@/pages/PromosPage'
// import MarketingPage from '@/pages/MarketingPage' // disabled — not needed now
// import VipPage from '@/pages/VipPage' // disabled — not needed now
import RequestsPage from '@/pages/RequestsPage'
import GuestReportPage from '@/pages/GuestReportPage'
import RequestedTransfersPage from '@/pages/RequestedTransfersPage'
import UsersPage from '@/pages/UsersPage'
import FinancialCenterPage from '@/pages/FinancialCenterPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Per the role permission matrix in the implementation plan.
// Default (no `roles` prop) allows all admin tiers.
const adminOnly = ['super-admin', 'admin']
const superAdminOnly = ['super-admin']
const managerAndUp = ['super-admin', 'admin', 'manager']

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forbidden', element: <ForbiddenPage /> },
  {
    element: (
      <RoleGate>
        <AdminLayout />
      </RoleGate>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'bookings', element: <RoleGate roles={managerAndUp}><BookingsPage /></RoleGate> },
      { path: 'events', element: <EventsPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'seating', element: <RoleGate roles={managerAndUp}><SeatingPage /></RoleGate> },
      { path: 'hotels', element: <HotelsPage /> },
      { path: 'packages', element: <PackagesPage /> },
      // Legacy alias — old `/experiences` route still resolves to PackagesPage
      { path: 'experiences', element: <PackagesPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'transfers', element: <TransfersPage /> },
      { path: 'promos', element: <PromosPage /> },
      // { path: 'marketing', element: <MarketingPage /> }, // disabled — not needed now
      // { path: 'vip', element: <VipPage /> }, // disabled — not needed now
      { path: 'requests', element: <RoleGate roles={managerAndUp}><RequestsPage /></RoleGate> },
      { path: 'hotels/guests', element: <GuestReportPage /> },
      { path: 'transfers/requests', element: <RequestedTransfersPage /> },
      { path: 'financial', element: <FinancialCenterPage /> },
      { path: 'users', element: <RoleGate roles={adminOnly}><UsersPage /></RoleGate> },
      { path: 'settings', element: <RoleGate roles={superAdminOnly}><SettingsPage /></RoleGate> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
