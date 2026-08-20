import { apiFetch } from '../services/api'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  FileText,
  Search,
  Users,
} from 'lucide-react'

interface Student {
  id: number
  name: string
  roll_number: string
}

interface ReportEntry {
  id: number
  student_id: number
  name: string
  roll_number: string
  timestamp: string
  match_distance: number
}

interface ReportResponse {
  total_entries: number
  unique_students: number
  entries: ReportEntry[]
}

function Reports() {
  const today = new Date()
    .toLocaleDateString('en-CA', {
      timeZone: 'Asia/Karachi',
    })

  const [startDate, setStartDate] =
    useState(today)

  const [endDate, setEndDate] =
    useState(today)

  const [studentId, setStudentId] =
    useState('')

  const [students, setStudents] =
    useState<Student[]>([])

  const [report, setReport] =
    useState<ReportResponse | null>(
      null,
    )

  const [isLoadingStudents, setIsLoadingStudents] =
    useState(true)

  const [isLoadingReport, setIsLoadingReport] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    fetchReport()
  }, [])

  async function fetchStudents() {
    setIsLoadingStudents(true)

    try {
      const response =
        await apiFetch('/students')

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Failed to load students.',
        )

        return
      }

      setStudents(data)
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
      setIsLoadingStudents(false)
    }
  }

  async function fetchReport() {
    if (!startDate || !endDate) {
      return
    }

    setIsLoadingReport(true)
    setError('')

    try {
      const params =
        new URLSearchParams()

      params.set(
        'start_date',
        startDate,
      )

      params.set(
        'end_date',
        endDate,
      )

      if (studentId) {
        params.set(
          'student_id',
          studentId,
        )
      }

      const response =
        await apiFetch(
          `/reports?${params.toString()}`,
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            'Failed to generate report.',
        )

        setReport(null)

        return
      }

      setReport(data)
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

      setReport(null)
    } finally {
      setIsLoadingReport(false)
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

  function handleGenerateReport(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      setError(
        'End date cannot be before start date.',
      )

      return
    }

    fetchReport()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Analyze student entry activity using date and student filters.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Search
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Report Filters
          </h2>
        </div>

        <form
          onSubmit={
            handleGenerateReport
          }
          className="grid gap-4 md:grid-cols-4"
        >
          {/* Start Date */}
          <div>
            <label
              htmlFor="start-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              From
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              To
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          {/* Student */}
          <div>
            <label
              htmlFor="student"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Student
            </label>

            <select
              id="student"
              value={studentId}
              onChange={(event) =>
                setStudentId(
                  event.target.value,
                )
              }
              disabled={
                isLoadingStudents
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            >
              <option value="">
                All Students
              </option>

              {students.map(
                (student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name} —{' '}
                    {
                      student.roll_number
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                isLoadingReport ||
                !startDate ||
                !endDate
              }
              className="h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingReport
                ? 'Generating...'
                : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2.5">
              <FileText
                size={20}
                className="text-slate-700"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Entries
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {isLoadingReport
                  ? '—'
                  : report?.total_entries ??
                    0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2.5">
              <Users
                size={20}
                className="text-slate-700"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Unique Students
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {isLoadingReport
                  ? '—'
                  : report?.unique_students ??
                    0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Entry History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Successful face recognition entries within the selected period.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
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
              {isLoadingReport ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Generating report...
                  </td>
                </tr>
              ) : report &&
                report.entries.length >
                  0 ? (
                report.entries.map(
                  (entry) => {
                    const formatted =
                      formatDateTime(
                        entry.timestamp,
                      )

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {
                              entry.name
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {
                            entry.roll_number
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {
                            formatted.date
                          }
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {
                            formatted.time
                          }
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
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
                    <p className="text-sm font-medium text-slate-700">
                      No entries found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing the date range or student filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports