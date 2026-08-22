import { apiFetch } from '../services/api'

import { useEffect, useState } from 'react'

import {
  Activity,
  Clock3,
  Gauge,
  Users,
  UserRoundCheck,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import EntryDevices from '../components/dashboard/EntryDevices'

interface DashboardRecentEntry {
  id: number
  student_id: number
  name: string
  roll_number: string
  timestamp: string
  match_distance: number
}

interface DashboardResponse {
  total_students: number
  todays_entries: number
  unique_students_today: number
  average_match_distance: number | null
  recent_entries: DashboardRecentEntry[]
}

function Dashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    setIsLoading(true)
    setError('')

    try {
      const response =
        await apiFetch('/dashboard')

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Failed to load dashboard data.',
        )

        return
      }

      setDashboard(data)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          'AUTHENTICATION_EXPIRED'
      ) {
        return
      }

      setError(
        'Unable to connect to the entry server.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function formatDateTime(
    timestamp: string,
  ) {
    const date =
      new Date(timestamp)

    return {
      date:
        date.toLocaleDateString(
          'en-GB',
          {
            timeZone:
              'Asia/Karachi',
          },
        ),

      time:
        date.toLocaleTimeString(
          'en-US',
          {
            timeZone:
              'Asia/Karachi',
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
    }
  }

  function formatMatchDistance(
    distance: number | null,
  ) {
    if (distance === null) {
      return '—'
    }

    return distance.toFixed(3)
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor today's entry activity and system performance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Registered Persons"
          value={
            isLoading
              ? '—'
              : String(
                  dashboard?.total_students ??
                    0,
                )
          }
          description="People registered in the system"
          icon={Users}
        />

        <StatCard
          title="Today's Entries"
          value={
            isLoading
              ? '—'
              : String(
                  dashboard?.todays_entries ??
                    0,
                )
          }
          description="Successful entries recorded today"
          icon={Activity}
        />

        <StatCard
          title="Unique Entries"
          value={
            isLoading
              ? '—'
              : String(
                  dashboard?.unique_students_today ??
                    0,
                )
          }
          description="Different people entering today"
          icon={UserRoundCheck}
        />

        <StatCard
          title="Average Match"
          value={
            isLoading
              ? '—'
              : formatMatchDistance(
                  dashboard?.average_match_distance ??
                    null,
                )
          }
          description="Lower distance indicates a closer match"
          icon={Gauge}
        />

      </div>

      {/* Today's Activity */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">

        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Today's Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A quick overview of today's entry activity.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">

          {/* Today's Entries */}
          <div className="rounded-lg bg-slate-50 p-5 transition-colors dark:bg-slate-800">

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Activity size={17} />

              <span className="text-sm">
                Today's Entries
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading
                ? '—'
                : dashboard?.todays_entries ??
                  0}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Successful entry events
            </p>

          </div>

          {/* Unique Entries */}
          <div className="rounded-lg bg-slate-50 p-5 transition-colors dark:bg-slate-800">

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Users size={17} />

              <span className="text-sm">
                Unique Entries
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading
                ? '—'
                : dashboard?.unique_students_today ??
                  0}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Different people entering today
            </p>

          </div>

          {/* Latest Entry */}
          <div className="rounded-lg bg-slate-50 p-5 transition-colors dark:bg-slate-800">

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock3 size={17} />

              <span className="text-sm">
                Latest Entry
              </span>
            </div>

            {isLoading ? (
              <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                —
              </p>
            ) : dashboard?.recent_entries &&
              dashboard.recent_entries.length >
                0 ? (
              <>
                <p className="mt-3 truncate text-xl font-semibold text-slate-900 dark:text-white">
                  {
                    dashboard
                      .recent_entries[0]
                      .name
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {
                    formatDateTime(
                      dashboard
                        .recent_entries[0]
                        .timestamp,
                    ).time
                  }
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  No entries
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No successful entries yet
                </p>
              </>
            )}

          </div>

        </div>
      </section>

      {/* Entry Devices */}
      <EntryDevices />

      {/* Recent Entry Activity */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Recent Entry Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest successful entries recorded by the system.
            </p>
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-175 text-left">

            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">

                <th className="px-6 py-3 font-medium">
                  Person
                </th>

                <th className="px-6 py-3 font-medium">
                  Identifier
                </th>

                <th className="px-6 py-3 font-medium">
                  Date
                </th>

                <th className="px-6 py-3 font-medium">
                  Time
                </th>

                <th className="px-6 py-3 font-medium">
                  Match Distance
                </th>

              </tr>
            </thead>

            <tbody>

              {isLoading ? (
                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Loading entry data...
                  </td>

                </tr>
              ) : dashboard?.recent_entries &&
                dashboard.recent_entries.length >
                  0 ? (

                dashboard.recent_entries.map(
                  (entry) => {
                    const formatted =
                      formatDateTime(
                        entry.timestamp,
                      )

                    return (
                      <tr
                        key={
                          entry.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >

                        <td className="px-6 py-4">

                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {
                              entry.name
                            }
                          </p>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {
                            entry.roll_number
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {
                            formatted.date
                          }
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">

                            <Clock3
                              size={
                                15
                              }
                            />

                            {
                              formatted.time
                            }

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {entry.match_distance.toFixed(
                              3,
                            )}
                          </span>

                        </td>

                      </tr>
                    )
                  },
                )

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No entry activity yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                      Successful recognitions will appear here.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        <div className="border-t border-slate-100 px-6 py-3 dark:border-slate-800">

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing the latest{' '}
            {
              dashboard?.recent_entries
                .length ?? 0
            }{' '}
            entries
          </p>

        </div>

      </section>

    </div>
  )
}

export default Dashboard