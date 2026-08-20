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
        'Unable to connect to the attendance server.',
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
          Overview of registered students and today's entry activity.
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
          title="Registered Students"
          value={
            isLoading
              ? '—'
              : String(
                  dashboard?.total_students ??
                    0,
                )
          }
          description="Students registered in the system"
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
          title="Unique Students Today"
          value={
            isLoading
              ? '—'
              : String(
                  dashboard?.unique_students_today ??
                    0,
                )
          }
          description="Different students who entered today"
          icon={UserRoundCheck}
        />

        <StatCard
          title="Avg. Match Distance"
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

      {/* Entry Overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Entry Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Current entry activity based on successful face recognition.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
          </div>

          <div className="rounded-lg bg-slate-50 p-5 transition-colors dark:bg-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Users size={17} />

              <span className="text-sm">
                Unique Students
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading
                ? '—'
                : dashboard?.unique_students_today ??
                  0}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-5 transition-colors dark:bg-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Gauge size={17} />

              <span className="text-sm">
                Average Match
              </span>
            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {isLoading
                ? '—'
                : formatMatchDistance(
                    dashboard?.average_match_distance ??
                      null,
                  )}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Entry Activity */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Recent Entry Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest successful student entries.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-6 py-3 font-medium">
                  Student
                </th>

                <th className="px-6 py-3 font-medium">
                  Roll Number
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
                    Loading dashboard data...
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