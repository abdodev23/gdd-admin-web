import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import DashboardPage from '@/pages/DashboardPage'
import BookingsPage from '@/pages/BookingsPage'
import EventsPage from '@/pages/EventsPage'
import TicketsPage from '@/pages/TicketsPage'
import SeatingPage from '@/pages/SeatingPage'
import HotelsPage from '@/pages/HotelsPage'
import ExperiencesPage from '@/pages/ExperiencesPage'
import ActivitiesPage from '@/pages/ActivitiesPage'
import TransfersPage from '@/pages/TransfersPage'
import PromosPage from '@/pages/PromosPage'
import MarketingPage from '@/pages/MarketingPage'
import VipPage from '@/pages/VipPage'
import RequestsPage from '@/pages/RequestsPage'
import GuestReportPage from '@/pages/GuestReportPage'
import RequestedTransfersPage from '@/pages/RequestedTransfersPage'
import UsersPage from '@/pages/UsersPage'
import SettingsPage from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'seating', element: <SeatingPage /> },
      { path: 'hotels', element: <HotelsPage /> },
      { path: 'experiences', element: <ExperiencesPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'transfers', element: <TransfersPage /> },
      { path: 'promos', element: <PromosPage /> },
      { path: 'marketing', element: <MarketingPage /> },
      { path: 'vip', element: <VipPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'hotels/guests', element: <GuestReportPage /> },
      { path: 'transfers/requests', element: <RequestedTransfersPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
