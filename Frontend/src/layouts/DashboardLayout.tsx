import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Header />

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default DashboardLayout