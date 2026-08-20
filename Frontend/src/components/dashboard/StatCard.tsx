import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="min-h-10">
            <p className="text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">
              {title}
            </p>
          </div>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs">
        {trend && (
          <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}

        <span className="text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </div>
    </div>
  )
}

export default StatCard