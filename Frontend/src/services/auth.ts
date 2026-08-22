import { jwtDecode } from 'jwt-decode'

export interface AccessTokenPayload {
  sub: string
  username: string
  role: string
  must_change_password: boolean
  exp: number
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getTokenPayload(): AccessTokenPayload | null {
  const token = getAccessToken()

  if (!token) {
    return null
  }

  try {
    return jwtDecode<AccessTokenPayload>(token)
  } catch {
    return null
  }
}

export function getCurrentUsername(): string | null {
  const payload = getTokenPayload()

  return payload?.username ?? null
}

export function mustChangePassword(): boolean {
  const payload = getTokenPayload()

  return payload?.must_change_password === true
}

export function logout() {
  localStorage.removeItem('access_token')

  window.location.href = '/login'
}