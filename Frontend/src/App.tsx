import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { AppPreferencesProvider } from './context/AppPreferencesContext'
import { NotificationProvider } from './context/NotificationContext'

import DashboardLayout from './layouts/DashboardLayout'

import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import EntryTerminal from './pages/EntryTerminal'

import {
  mustChangePassword,
} from './services/auth'

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const token =
    localStorage.getItem(
      'access_token',
    )

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (mustChangePassword()) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    )
  }

  return children
}

function ChangePasswordRoute() {
  const token =
    localStorage.getItem(
      'access_token',
    )

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!mustChangePassword()) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <ChangePassword />
}

function LoginRoute() {
  const token =
    localStorage.getItem(
      'access_token',
    )

  if (!token) {
    return <Login />
  }

  if (mustChangePassword()) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    )
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  )
}

function App() {
  return (
    <AppPreferencesProvider>
      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route
            path="/login"
            element={<LoginRoute />}
          />

          {/* First-login / reset-password flow */}
          <Route
            path="/change-password"
            element={
              <ChangePasswordRoute />
            }
          />

          {/* Entry Terminal */}
          <Route
            path="/terminal"
            element={
              <ProtectedRoute>
                <EntryTerminal />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Application */}
          <Route
            element={
              <ProtectedRoute>
                <NotificationProvider>
                  <DashboardLayout />
                </NotificationProvider>
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
    </AppPreferencesProvider>
  )
}

export default App