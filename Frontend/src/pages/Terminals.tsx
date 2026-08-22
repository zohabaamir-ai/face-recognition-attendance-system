import {
  Monitor,
  Plus,
} from 'lucide-react'

function Terminals() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Terminals
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the physical access terminals connected to the system.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Plus size={17} />

          Add Terminal
        </button>

      </div>

      {/* Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Monitor size={26} />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            No terminals configured
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Registered access terminals will appear here. You will be able to add, configure, activate, and manage terminals from this page.
          </p>

        </div>

      </div>

    </div>
  )
}

export default Terminals