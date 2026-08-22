import { Outlet } from 'react-router-dom'

import Header from './AppHeader'
import Sidebar from './AppSidebar'

import { useAppPreferences } from '../context/useAppPreferences'

function DashboardLayout() {
  const {
    sidebarCollapsed,
    compactMode,
  } = useAppPreferences()

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">

      <Sidebar />

      <main
        className={`min-h-screen transition-all duration-200 ${
          sidebarCollapsed
            ? 'ml-20'
            : 'ml-64'
        }`}
      >

        <Header />

        <section
          className={
            compactMode
              ? 'p-4'
              : 'p-6'
          }
        >
          <Outlet />
        </section>

      </main>

    </div>
  )
}

export default DashboardLayout