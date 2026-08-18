import Cookies from 'js-cookie'

export const COOKIE_NAME = 'webnote_session_token'

export function setAuthCookie() {
  Cookies.set(COOKIE_NAME, '1', {
    expires: 7,
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:',
    path: '/',
  })
}

export function validateAuthCookie() {
  const value = Cookies.get(COOKIE_NAME)
  return value === '1'
}

export function clearAuthCookie() {
  Cookies.remove(COOKIE_NAME, { path: '/' })
}