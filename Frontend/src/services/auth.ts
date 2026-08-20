import { jwtDecode } from 'jwt-decode'

interface AccessTokenPayload {
  sub: string
  username: string
  exp: number
}

export function getCurrentUsername(): string | null {
  const token =
    localStorage.getItem('access_token')

  if (!token) {
    return null
  }

  try {
    const payload =
      jwtDecode<AccessTokenPayload>(token)

    if (!payload.username) {
      return null
    }

    return payload.username
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('access_token')

  window.location.href = '/login'
}