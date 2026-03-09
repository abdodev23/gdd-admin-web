import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-sand-light">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
