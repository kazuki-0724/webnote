<template>
  <div class="relative bg-slate-50 bg-mesh text-slate-800 overflow-hidden select-none h-screen w-screen antialiased" style="font-family: 'Inter', sans-serif;">
    <div v-if="showUserBadge" class="hidden md:flex absolute right-4 top-4 z-10 items-center gap-3">
      <span class="text-sm text-slate-600">{{ user.displayName || 'Google User' }}</span>
      <button
        class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        @click="logout"
      >
        ログアウト
      </button>
    </div>
        <div class="relative h-full w-full flex">
            <SidebarPane />
            <EditorPane />
        </div>
        <ModalCreateNote />
        <ModalConfirm />
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '../store/notes'
import { useAuth } from '../composables/useAuth'
import SidebarPane from './SidebarPane.vue'
import EditorPane from './EditorPane.vue'
import ModalCreateNote from './ModalCreateNote.vue'
import ModalConfirm from './ModalConfirm.vue'

const router = useRouter()
const { user, initializeAuth, logoutWithGoogle } = useAuth()
const store = useNotesStore()
const isMobile = ref(false)

const showUserBadge = computed(() => {
  if (!user.value) return false
  if (!isMobile.value) return true
  return store.mobileView === 'sidebar'
})

watch(
  () => store.selectedNote?.type,
  (noteType) => {
    if (noteType === 'whiteboard' && router.currentRoute.value.path !== '/whiteboard') {
      router.replace('/whiteboard')
    }
  },
  { immediate: true }
)

function lockHomeHistory() {
  if (router.currentRoute.value.path !== '/home') return

  window.history.pushState(null, '', '/home')
}

function handleHomePopState() {
  if (router.currentRoute.value.path === '/home') {
    window.history.pushState(null, '', '/home')
    return
  }

  router.replace('/home')
}

function updateViewportState() {
  isMobile.value = window.innerWidth < 768
}

function flushPendingChanges() {
  store.flushPendingSaves()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    flushPendingChanges()
  }
}

async function logout() {
  await logoutWithGoogle()
  store.stopNotesSync()
  router.replace('/login')
}

onMounted(async () => {
  updateViewportState()
  lockHomeHistory()
  window.addEventListener('resize', updateViewportState)
  window.addEventListener('popstate', handleHomePopState)
  window.addEventListener('beforeunload', flushPendingChanges)
  window.addEventListener('pagehide', flushPendingChanges)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  await initializeAuth()

  if (user.value) {
    store.initNotesStore(user.value?.uid)
  } else {
    store.stopNotesSync()
  }
})

onBeforeUnmount(() => {
  flushPendingChanges()
  window.removeEventListener('resize', updateViewportState)
  window.removeEventListener('popstate', handleHomePopState)
  window.removeEventListener('beforeunload', flushPendingChanges)
  window.removeEventListener('pagehide', flushPendingChanges)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
