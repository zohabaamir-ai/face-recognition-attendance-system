import {
  BarChart3,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAppPreferences } from '../context/useAppPreferences'

const navigation = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Students',
    path: '/students',
    icon: Users,
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: ClipboardCheck,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

function Sidebar() {
  const {
    sidebarCollapsed,
  } = useAppPreferences()

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-800 bg-slate-900 text-white transition-all duration-200 ${
        sidebarCollapsed
          ? 'w-20'
          : 'w-64'
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-800 ${
          sidebarCollapsed
            ? 'justify-center px-2'
            : 'px-6'
        }`}
      >
        {sidebarCollapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-900">
            SA
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold tracking-tight">
              SmartAttendanceSystem
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Administration
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {!sidebarCollapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Navigation
          </p>
        )}

        <div className="space-y-1">
          {navigation.map(
            (item) => {
              const Icon =
                item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={
                    sidebarCollapsed
                      ? item.name
                      : undefined
                  }
                  className={({ isActive }) =>
                    `group flex items-center rounded-lg text-sm font-medium transition ${
                      sidebarCollapsed
                        ? 'justify-center px-2 py-3'
                        : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  {!sidebarCollapsed && (
                    <span>
                      {item.name}
                    </span>
                  )}
                </NavLink>
              )
            },
          )}
        </div>
      </nav>

      {/* Footer */}
      <div
        className={`shrink-0 border-t border-slate-800 ${
          sidebarCollapsed
            ? 'p-3'
            : 'px-6 py-4'
        }`}
      >
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
              A
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-slate-300">
              Administrator
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              System Admin
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar