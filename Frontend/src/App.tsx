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
import Persons from './pages/Persons'
import Terminals from './pages/Terminals'
import Activity from './pages/Activity'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import EntryTerminal from './pages/EntryTerminal'

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

  return children
}

function LoginRoute() {
  const token =
    localStorage.getItem(
      'access_token',
    )

  if (token) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Login />
}

function App() {
  return (
    <AppPreferencesProvider>
      <BrowserRouter>
        <Routes>

          {/* =================================================
              AUTHENTICATION
          ================================================= */}

          <Route
            path="/login"
            element={<LoginRoute />}
          />

          {/* =================================================
              PHYSICAL ENTRY TERMINAL
              
              This is the external/device interface.
              It is intentionally NOT part of the
              management-system sidebar.
          ================================================= */}

          <Route
            path="/terminal"
            element={
              <ProtectedRoute>
                <EntryTerminal />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MANAGEMENT APPLICATION
          ================================================= */}

          <Route
            element={
              <ProtectedRoute>
                <NotificationProvider>
                  <DashboardLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >

            {/* Root */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Persons */}
            <Route
              path="/persons"
              element={<Persons />}
            />

            {/* Terminal Management */}
            <Route
              path="/terminals"
              element={<Terminals />}
            />

            {/* Activity */}
            <Route
              path="/activity"
              element={<Activity />}
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* Settings */}
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