<template>
  <div
    class="w-full md:w-[360px] bg-white/60 backdrop-blur-lg flex-col border-r border-white/60 shrink-0 relative transition-all duration-300 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]"
    :class="mobileVisible ? 'flex' : 'hidden md:flex'"
  >
    <!-- ヘッダー -->
    <div class="h-20 flex items-end pb-4 px-6 shrink-0 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm z-10">
      <button
        @click="store.setMobileView('sidebar')"
        class="p-2 mr-3 -ml-2 text-slate-600 hover:bg-slate-200/50 rounded-xl md:hidden transition-colors focus:ring-2 focus:ring-sky-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
      </button>
      <h2 class="text-2xl font-bold text-slate-800 tracking-tight">
        {{ listTitle }}
      </h2>
    </div>

    <!-- ノートリスト -->
    <div class="flex-1 px-4 pb-24 overflow-y-auto">
      <!-- 空状態 -->
      <div
        v-if="store.filteredNotes.length === 0"
        class="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center mt-20"
      >
        <div class="opacity-40 text-sky-400 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </div>
        <p class="text-[15px] font-medium">ノートがありません</p>
        <p class="text-sm mt-1 opacity-70">右下のボタンから作成できます</p>
      </div>

      <!-- ノートカード -->
      <div
        v-for="note in store.filteredNotes"
        :key="note.id"
        @click="store.selectNote(note.id)"
        tabindex="0"
        class="mb-3 p-5 rounded-3xl cursor-pointer transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-sky-400 group"
        :class="store.selectedNoteId === note.id
          ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-sky-100 ring-1 ring-sky-50 scale-[1.02]'
          : 'bg-white/70 border-white hover:bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1'"
      >
        <div class="font-bold text-slate-800 text-[16px] truncate mb-2 group-hover:text-sky-600 transition-colors">
          {{ note.title || '無題のノート' }}
        </div>
        <div class="text-[14px] text-slate-500/90 line-clamp-2 leading-relaxed mb-4">
          {{ note.content || '本文なし' }}
        </div>
        <div class="text-[12px] font-medium text-slate-400 flex items-center">
          <span class="bg-slate-100/80 px-2 py-0.5 rounded-md">{{ formatDate(note.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 新規作成 FAB -->
    <button
      @click="store.openCreateNoteModal()"
      class="absolute bottom-8 right-6 w-14 h-14 bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl shadow-[0_8px_20px_-6px_rgba(14,165,233,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(14,165,233,0.7)] transition-all flex items-center justify-center active:scale-90 focus:ring-4 focus:ring-sky-300/50 focus:outline-none z-20 hover:-translate-y-1"
      title="新規作成"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/><path d="M12 5v14"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotesStore } from '../store/notes'
import { formatDate } from '../utils'

const store = useNotesStore()

const mobileVisible = computed(() => store.mobileView === 'list')

const listTitle = computed(() => {
  if (store.selectedFolderId === 'all') return 'すべてのノート'
  return store.selectedFolder?.name || 'ノート'
})
</script>
