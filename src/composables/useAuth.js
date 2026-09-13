import { ref, computed } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, logOut } from '../firebase'

const user = ref(null)
const isLoading = ref(false)
const error = ref(null)
const authReady = ref(false)
const currentUid = computed(() => user.value?.uid ?? null)

function syncAuthSession(currentUser) {
  if (currentUser) {
    user.value = currentUser
    return
  }
  user.value = null
}

async function initializeAuth() {

  authReady.value = false

  await auth.authStateReady()

  const currentUser = auth.currentUser
  syncAuthSession(currentUser)
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
      user.value = currentUser
      return currentUser
    }
    return null
  } catch (err) {
    error.value = err
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
    currentUid,
    initializeAuth,
    loginWithGoogle,
    logoutWithGoogle,
  }
}

export { loginWithGoogle, logoutWithGoogle, initializeAuth, authReady }
