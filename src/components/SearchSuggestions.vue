<template>
  <Transition name="suggestion">
    <div
      v-if="show && store.searchQuery.trim()"
      class="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] border border-white overflow-hidden flex flex-col max-h-[50vh] overflow-y-auto no-scrollbar z-50"
    >
      <div v-if="store.searchResults.length === 0" class="p-6 text-sm text-slate-500 flex flex-col items-center justify-center">
        <svg class="mb-2 opacity-50" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        見つかりませんでした
      </div>

      <div
        v-for="note in store.searchResults"
        :key="note.id"
        @mousedown="handleSelect(note.id)"
        class="p-4 border-b border-slate-100/60 hover:bg-sky-50/70 cursor-pointer transition-colors last:border-0 group"
      >
        <div class="text-[14px] font-bold text-slate-800 truncate mb-1 group-hover:text-sky-600 transition-colors">
          {{ note.title || '無題のノート' }}
        </div>
        <div class="text-[12px] text-slate-500/80 truncate mb-1.5">{{ note.content }}</div>
        <div class="text-[10px] font-semibold text-sky-500 bg-sky-100/50 inline-flex items-center gap-1 px-2 py-0.5 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          {{ getFolderName(note.folderId) }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useNotesStore } from '../store/notes'

const store = useNotesStore()

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

function getFolderName(folderId) {
  return store.folders.find((f) => f.id === folderId)?.name || '未分類'
}

function handleSelect(noteId) {
  store.searchQuery = ''
  store.selectNote(noteId)
  emit('select')
}
</script>
