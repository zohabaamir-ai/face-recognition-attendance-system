import {
  Activity as ActivityIcon,
  Clock3,
} from 'lucide-react'

function Activity() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Activity
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor recognition and access activity across the system.
        </p>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <ActivityIcon size={26} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            No activity yet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Recognition events, access events, terminal activity, and security events will appear here.
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Clock3 size={13} />

            Waiting for system activity
          </div>

        </div>

      </div>

    </div>
  )
}

export default Activity