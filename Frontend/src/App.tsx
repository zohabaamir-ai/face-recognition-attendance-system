import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/students"
            element={<Students />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App