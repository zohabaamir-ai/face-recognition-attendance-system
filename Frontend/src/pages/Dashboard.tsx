import {
  CalendarCheck,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'

const recentAttendance = [
  {
    name: 'Ahmed Khan',
    id: 'ST-1001',
    time: '08:12 AM',
    status: 'Present',
  },
  {
    name: 'Sara Ahmed',
    id: 'ST-1002',
    time: '08:15 AM',
    status: 'Present',
  },
  {
    name: 'Hamza Ali',
    id: 'ST-1003',
    time: '08:21 AM',
    status: 'Present',
  },
  {
    name: 'Ayesha Malik',
    id: 'ST-1004',
    time: '08:47 AM',
    status: 'Late',
  },
  {
    name: 'Usman Tariq',
    id: 'ST-1005',
    time: '--',
    status: 'Absent',
  },
]

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with attendance today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value="248"
          description="Registered students"
          icon={Users}
        />

        <StatCard
          title="Present Today"
          value="219"
          description="Compared with yesterday"
          icon={UserCheck}
          trend="+4.2%"
        />

        <StatCard
          title="Absent Today"
          value="29"
          description="Students absent"
          icon={UserMinus}
        />

        <StatCard
          title="Attendance Rate"
          value="88.3%"
          description="Today's attendance"
          icon={CalendarCheck}
          trend="+2.1%"
        />
      </div>

      {/* Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Attendance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <h2 className="font-semibold text-slate-900">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Attendance performance over the last 7 days.
            </p>
          </div>

          <div className="mt-6 flex h-64 items-end gap-4 rounded-lg bg-slate-50 px-6 pb-6 pt-8">
            {[82, 76, 91, 87, 94, 88, 88].map((value, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="text-xs font-medium text-slate-500">
                  {value}%
                </div>

                <div className="flex h-40 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-slate-800 transition-all"
                    style={{ height: `${value}%` }}
                  />
                </div>

                <span className="text-xs text-slate-400">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Today's Attendance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current attendance breakdown.
          </p>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-[16px] border-slate-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  88.3%
                </p>

                <p className="text-xs text-slate-500">
                  Present
                </p>
              </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-4">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-slate-500">
                  Present
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  219
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-slate-500">
                  Absent
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  29
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest attendance activity.
            </p>
          </div>

          <button
            type="button"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">
                  Student
                </th>

                <th className="px-6 py-3 font-medium">
                  Student ID
                </th>

                <th className="px-6 py-3 font-medium">
                  Time
                </th>

                <th className="px-6 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {record.name}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {record.id}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {record.time}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        record.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : record.status === 'Late'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard