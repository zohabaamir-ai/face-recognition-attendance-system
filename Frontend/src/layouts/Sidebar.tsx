import {
  BarChart3,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

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
  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '256px',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '24px 12px',
      }}
    >
      <div
        style={{
          padding: '0 12px',
          marginBottom: '32px',
          fontSize: '20px',
          fontWeight: 600,
        }}
      >
        SmartAttendanceSystem
      </div>

      <nav>
        <div
          style={{
            padding: '0 12px',
            marginBottom: '12px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}
        >
          Navigation
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  backgroundColor: isActive ? '#334155' : 'transparent',
                })}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar