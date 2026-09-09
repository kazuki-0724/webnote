<template>
  <div v-if="!authReady" class="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <div class="flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white/90 px-8 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div class="relative flex h-16 w-16 items-center justify-center">
        <div class="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
        <Favicon class="relative h-8 w-8 text-slate-900" />
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold tracking-tight text-slate-800">WebNote</div>
        <div class="mt-1 text-sm text-slate-500">認証状態を確認しています...</div>
      </div>
    </div>
  </div>

  <Login
    v-else-if="!user"
    :isLoading="isLoading"
    @login="handleLogin"
  />

  <div v-else class="relative bg-slate-50 bg-mesh text-slate-800 overflow-hidden select-none h-screen w-screen antialiased" style="font-family: 'Inter', sans-serif;">
    <template v-if="isWhiteboardFullscreen">
      <div class="relative h-full w-full">
        <div v-if="showUserBadge" class="hidden md:flex absolute right-4 top-4 z-20 items-center gap-3">
          <span class="text-sm text-slate-600">{{ user.displayName || 'Google User' }}</span>
          <button
            class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            @click="logout"
          >
            ログアウト
          </button>
        </div>
        <WhiteboardCanvas
          :note="store.selectedNote"
          @stroke-end="handleWhiteboardStroke"
          @clear-canvas="handleClearWhiteboard"
          @back-to-top="handleBackToTop"
        />
      </div>
    </template>

    <template v-else>
      <div class="relative h-full w-full flex">
        <div v-if="showUserBadge" class="hidden md:flex absolute right-4 top-4 z-10 items-center gap-3">
          <span class="text-sm text-slate-600">{{ user.displayName || 'Google User' }}</span>
          <button
            class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            @click="logout"
          >
            ログアウト
          </button>
        </div>
        <SidebarPane />
        <EditorPane />
      </div>
    </template>

    <ModalCreateNote />
    <ModalConfirm />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useNotesStore } from './store/notes'
import { useAuth } from './composables/useAuth'
import SidebarPane from './components/SidebarPane.vue'
import EditorPane from './components/EditorPane.vue'
import WhiteboardCanvas from './components/WhiteboardCanvas.vue'
import ModalCreateNote from './components/ModalCreateNote.vue'
import ModalConfirm from './components/ModalConfirm.vue'
import Login from './components/Login.vue'
import Favicon from './assets/icons/favicon.svg'

const { user, isLoading, authReady, initializeAuth, loginWithGoogle, logoutWithGoogle } = useAuth()
const store = useNotesStore()
const isMobile = ref(false)

const showUserBadge = computed(() => {
  if (!user.value) return false
  if (!isMobile.value) return true
  return store.mobileView === 'sidebar'
})

const isWhiteboardFullscreen = computed(() => {
  return !!store.selectedNote && store.selectedNote.type === 'whiteboard'
})

function updateViewportState() {
  isMobile.value = window.innerWidth < 768
}

function handleWhiteboardStroke(stroke) {
  if (!store.selectedNoteId || !stroke) return
  store.saveWhiteboardStroke(store.selectedNoteId, stroke)
}

function handleClearWhiteboard() {
  if (!store.selectedNoteId) return
  store.clearWhiteboard(store.selectedNoteId)
}

function handleBackToTop() {
  store.selectedNoteId = null
  store.mobileView = 'sidebar'
  store.isEditingContent = false
}

async function handleLogin() {
  const currentUser = await loginWithGoogle()

  if (currentUser) {
    store.initNotesStore(currentUser?.uid)
  }
}

async function logout() {
  await logoutWithGoogle()
  store.stopNotesSync()
}

onMounted(async () => {
  updateViewportState()
  window.addEventListener('resize', updateViewportState)

  await initializeAuth()

  if (user.value) {
    store.initNotesStore(user.value?.uid)
  } else {
    store.stopNotesSync()
  }
})
</script>
