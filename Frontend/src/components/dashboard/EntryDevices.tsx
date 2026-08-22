import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  MonitorSmartphone,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { getDevices, type Device } from '../../services/deviceService'

const DEVICE_ONLINE_THRESHOLD = 30_000

function EntryDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchDevices() {
    try {
      setError('')

      const data = await getDevices()

      setDevices(data)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'AUTHENTICATION_EXPIRED'
      ) {
        return
      }

      setError('Unable to load entry devices.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()

    const intervalId = window.setInterval(
      fetchDevices,
      15_000,
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  function getDeviceStatus(device: Device) {
    if (!device.is_active) {
      return 'disabled'
    }

    if (!device.last_seen) {
      return 'offline'
    }

    const lastSeen =
      new Date(device.last_seen).getTime()

    const now = Date.now()

    if (
      now - lastSeen <=
      DEVICE_ONLINE_THRESHOLD
    ) {
      return 'active'
    }

    return 'offline'
  }

  function formatLastSeen(
    timestamp: string | null,
  ) {
    if (!timestamp) {
      return 'Never connected'
    }

    const lastSeen =
      new Date(timestamp).getTime()

    const difference =
      Math.max(
        0,
        Date.now() - lastSeen,
      )

    const seconds = Math.floor(
      difference / 1000,
    )

    if (seconds < 10) {
      return 'Just now'
    }

    if (seconds < 60) {
      return `${seconds} seconds ago`
    }

    const minutes = Math.floor(
      seconds / 60,
    )

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1
          ? 'minute'
          : 'minutes'
      } ago`
    }

    const hours = Math.floor(
      minutes / 60,
    )

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? 'hour'
          : 'hours'
      } ago`
    }

    const days = Math.floor(
      hours / 24,
    )

    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    } ago`
  }

  function getStatusLabel(
    status: string,
  ) {
    if (status === 'active') {
      return 'Active'
    }

    if (status === 'disabled') {
      return 'Disabled'
    }

    return 'Offline'
  }

  function getStatusClasses(
    status: string,
  ) {
    if (status === 'active') {
      return {
        badge:
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
        icon:
          'text-emerald-500 dark:text-emerald-400',
        dot:
          'bg-emerald-500',
      }
    }

    if (status === 'disabled') {
      return {
        badge:
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        icon:
          'text-slate-400 dark:text-slate-500',
        dot:
          'bg-slate-400',
      }
    }

    return {
      badge:
        'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
      icon:
        'text-red-500 dark:text-red-400',
      dot:
        'bg-red-500',
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Entry Devices
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor connected entry terminals and their current availability.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <MonitorSmartphone size={20} />
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="mt-5 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <RefreshCw
              size={16}
              className="animate-spin"
            />

            Loading entry devices...
          </div>
        </div>
      ) : devices.length === 0 ? (
        /* Empty */
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/60">
          <MonitorSmartphone
            size={24}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            No entry devices registered
          </p>

          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Registered terminals will appear here.
          </p>
        </div>
      ) : (
        /* Devices */
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {devices.map((device) => {
            const status =
              getDeviceStatus(device)

            const statusClasses =
              getStatusClasses(status)

            return (
              <div
                key={device.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-700 dark:bg-slate-800/60"
              >

                {/* Device header */}
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                      <MonitorSmartphone
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {device.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {device.location}
                      </p>
                    </div>

                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusClasses.dot}`}
                    />

                    {getStatusLabel(status)}
                  </span>

                </div>

                {/* Device status */}
                <div className="mt-5 space-y-3">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      {status === 'active' ? (
                        <CheckCircle2
                          size={16}
                          className={
                            statusClasses.icon
                          }
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className={
                            statusClasses.icon
                          }
                        />
                      )}

                      <span>
                        Connection
                      </span>
                    </div>

                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {getStatusLabel(
                        status,
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 size={16} />

                      <span>
                        Last seen
                      </span>
                    </div>

                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatLastSeen(
                        device.last_seen,
                      )}
                    </span>

                  </div>

                </div>

              </div>
            )
          })}

        </div>
      )}

    </section>
  )
}

export default EntryDevices