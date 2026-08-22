import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Monitor,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import SystemLogo from '../components/branding/SystemLogo'
import { useAppPreferences } from '../context/useAppPreferences'

type NavigationItem = {
  name: string
  path: string
  icon: typeof LayoutDashboard
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Persons',
    path: '/persons',
    icon: Users,
  },
  {
    name: 'Terminals',
    path: '/terminals',
    icon: Monitor,
  },
  {
    name: 'Activity',
    path: '/activity',
    icon: Activity,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
]

function AppSidebar() {
  const {
    sidebarCollapsed,
  } = useAppPreferences()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-950 text-white transition-[width] duration-200 ease-in-out ${
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
            : 'px-5'
        }`}
      >
        {sidebarCollapsed ? (
          <SystemLogo
            variant="mark"
            size="sm"
            light
          />
        ) : (
          <SystemLogo
            variant="full"
            size="md"
            light
          />
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-6"
      >
        <div className="space-y-1.5">
          {navigation.map(
            (item) => {
              const Icon = item.icon

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
                    [
                      'group relative flex items-center rounded-xl text-sm font-medium',
                      'transition-all duration-150',
                      sidebarCollapsed
                        ? 'justify-center px-2 py-3'
                        : 'gap-3 px-3 py-3',
                      isActive
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-blue-400 ${
                          isActive
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                        aria-hidden="true"
                      />

                      <Icon
                        size={19}
                        strokeWidth={
                          isActive
                            ? 2.2
                            : 1.8
                        }
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? 'text-blue-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />

                      {!sidebarCollapsed && (
                        <span>
                          {item.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            },
          )}
        </div>
      </nav>
    </aside>
  )
}

export default AppSidebar