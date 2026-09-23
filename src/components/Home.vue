<template>
  <div class="relative bg-slate-50 bg-mesh text-slate-800 overflow-hidden select-none h-screen w-screen antialiased" style="font-family: 'Inter', sans-serif;">
        <div class="relative h-full w-full flex">
            <SidebarPane :user="user" @logout="logout" />
            <EditorPane />
        </div>
        <ModalCreateNote />
        <DeleteModalConfirm />
        <ShareModalConfirm />
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '../store/notes'
import { useAuth } from '../composables/useAuth'
import SidebarPane from './SidebarPane.vue'
import EditorPane from './EditorPane.vue'
import ModalCreateNote from './ModalCreateNote.vue'
import DeleteModalConfirm from './DeleteModalConfirm.vue'
import ShareModalConfirm from './ShareModalConfirm.vue'

const router = useRouter()
const { user, initializeAuth, logoutWithGoogle } = useAuth()
const store = useNotesStore()

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
  lockHomeHistory()
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
  window.removeEventListener('popstate', handleHomePopState)
  window.removeEventListener('beforeunload', flushPendingChanges)
  window.removeEventListener('pagehide', flushPendingChanges)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
