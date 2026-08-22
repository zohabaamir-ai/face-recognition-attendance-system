import { apiFetch } from './api'

export interface DeviceHeartbeatResponse {
  device_id: number
  name: string
  location: string
  last_seen: string
}

export async function sendDeviceHeartbeat(
  deviceKey: string,
): Promise<DeviceHeartbeatResponse> {
  const response =
    await apiFetch(
      '/devices/heartbeat',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          device_key: deviceKey,
        }),
      },
    )

  if (!response.ok) {
    throw new Error(
      'DEVICE_HEARTBEAT_FAILED',
    )
  }

  return response.json()
}

export interface Device {
  id: number
  name: string
  location: string
  is_active: boolean
  last_seen: string | null
}

export async function getDevices(): Promise<Device[]> {
  const response = await apiFetch(
    '/devices',
  )

  if (!response.ok) {
    throw new Error(
      'Unable to load devices.',
    )
  }

  return response.json()
}