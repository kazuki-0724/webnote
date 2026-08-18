import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, logOut } from '../firebase'
import { validateAuthCookie, setAuthCookie, clearAuthCookie } from '../utils/authCookie'

const user = ref(null)
const isLoading = ref(false)
const error = ref(null)
const authReady = ref(false)

function syncAuthSession(currentUser) {
  const hasCookie = validateAuthCookie()

  if (currentUser && hasCookie) {
    user.value = currentUser
    return
  }

  clearAuthCookie()
  user.value = null
}

async function initializeAuth() {
  const hasCookie = validateAuthCookie()

  if (!hasCookie) {
    clearAuthCookie()
    authReady.value = true
    user.value = null

    onAuthStateChanged(auth, (currentUser) => {
      syncAuthSession(currentUser)
    })
    return
  }

  await auth.authStateReady()
  authReady.value = true

  onAuthStateChanged(auth, (currentUser) => {
    syncAuthSession(currentUser)
  })
}

async function loginWithGoogle() {
  isLoading.value = true
  error.value = null

  try {
    const currentUser = await signInWithGoogle()

    if (currentUser) {
      setAuthCookie()
      user.value = currentUser
      return currentUser
    }

    clearAuthCookie()
    return null
  } catch (err) {
    error.value = err
    clearAuthCookie()
    console.error('Google login failed:', err)
    return null
  } finally {
    isLoading.value = false
  }
}

async function logoutWithGoogle() {
  isLoading.value = true
  error.value = null

  try {
    await logOut()
    clearAuthCookie()
    user.value = null
  } catch (err) {
    error.value = err
    console.error('Logout failed:', err)
  } finally {
    isLoading.value = false
  }
}

export function useAuth() {
  return {
    user,
    isLoading,
    error,
    authReady,
    initializeAuth,
    loginWithGoogle,
    logoutWithGoogle,
  }
}

export { loginWithGoogle, logoutWithGoogle, initializeAuth, authReady }
