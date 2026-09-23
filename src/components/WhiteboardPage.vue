<template>
  <div class="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <ShareModalConfirm />
    <WhiteboardCanvas
      v-if="store.selectedNote"
      :note="store.selectedNote"
      @stroke-end="handleWhiteboardStroke"
      @clear-canvas="handleClearWhiteboard"
      @back-to-top="goHome"
      @title-change="handleWhiteboardTitleChange"
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useNotesStore } from '../store/notes'
import WhiteboardCanvas from './WhiteboardCanvas.vue'
import ShareModalConfirm from './ShareModalConfirm.vue'

const router = useRouter()
const store = useNotesStore()

const selectedWhiteboardNote = computed(() => store.selectedNote)

watch(
  selectedWhiteboardNote,
  (note) => {
    if (!note) {
      router.push('/home')
      return
    }

    if (note.type !== 'whiteboard') {
      router.push('/home')
    }
  },
  { immediate: true }
)

function goHome() {
  store.selectedNoteId = null
  store.mobileView = 'sidebar'
  router.push('/home')
}

onBeforeRouteLeave((to, from, next) => {
  if (store.selectedNote?.type === 'whiteboard') {
    store.selectedNoteId = null
    store.mobileView = 'sidebar'
  }

  next()
})

function handleWhiteboardStroke(stroke) {
  if (!store.selectedNoteId || !stroke) return
  store.saveWhiteboardStroke(store.selectedNoteId, stroke)
}

function handleClearWhiteboard() {
  if (!store.selectedNoteId) return
  store.clearWhiteboard(store.selectedNoteId)
}

function handleWhiteboardTitleChange(value) {
  if (!store.selectedNoteId) return
  store.updateNoteTitle(store.selectedNoteId, value)
}
</script>
