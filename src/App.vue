<template>
  <div v-if="!authReady" class="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <div class="loading-card">
      <div class="signature-wrap" aria-label="WebNote" role="img">
        <svg class="signature-svg" viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="signatureGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#0f172a" stop-opacity="0.6" />
              <stop offset="50%" stop-color="#0f172a" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0.7" />
            </linearGradient>
          </defs>
          <path class="signature-underline" d="M 80 160 C 185 170, 290 170, 390 150 S 560 130, 680 150" />
          <text x="60" y="128" class="signature-text">WebNote</text>
          <g class="signature-pen">
            <path d="M 598 48 L 640 82 L 618 88 L 576 54 Z" />
            <path d="M 576 54 L 548 35 L 562 20 L 590 38 Z" />
            <circle cx="605" cy="76" r="7" />
          </g>
        </svg>
      </div>

      <div class="loader-row">
        <span class="loader-pulse"></span>
        <span class="loading-message">認証状態を確認しています...</span>
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
          @title-change="handleWhiteboardTitleChange"
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
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
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
  store.flushPendingSaves()
  store.selectedNoteId = null
  store.mobileView = 'sidebar'
  store.isEditingContent = false
}

function handleWhiteboardTitleChange(value) {
  if (!store.selectedNoteId) return
  store.updateNoteTitle(store.selectedNoteId, value)
}

function flushPendingChanges() {
  store.flushPendingSaves()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    flushPendingChanges()
  }
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
  window.removeEventListener('beforeunload', flushPendingChanges)
  window.removeEventListener('pagehide', flushPendingChanges)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
