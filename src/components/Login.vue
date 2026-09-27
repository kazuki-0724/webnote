<template>
  <div class="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <div class="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/80 bg-white/90 p-8 shadow-[0_14px_44px_rgba(37,99,235,0.08),0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <Favicon width="44" height="44" alt="WebNote" />
      <h1 class="text-xl font-bold tracking-tight text-slate-900">WebNote</h1>
      <p class="text-center text-sm text-slate-500">Google アカウントでログインしてください</p>
      <button
        type="button"
        class="w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
        :disabled="isLoading"
        @click="handleLogin"
      >
        {{ isLoading ? 'ログイン中...' : 'Googleでログイン' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Favicon from '../assets/icons/favicon.svg'

const router = useRouter()
const { user, isLoading, loginWithGoogle } = useAuth()

async function handleLogin() {
  const currentUser = await loginWithGoogle()

  if (currentUser) {
    router.replace('/home')
  }
}

watch(
  user,
  (currentUser) => {
    if (currentUser) {
      router.replace('/home')
    }
  },
  { immediate: true }
)
</script>