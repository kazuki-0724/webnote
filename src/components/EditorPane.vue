<template>
  <div
    class="relative z-0 flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_14px_44px_rgba(37,99,235,0.08),0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-xl md:border-white/60 md:bg-white/90"
  >
    <!-- ノートが選択されていない場合 -->
    <div v-if="!store.selectedNote" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10">
      <div class="w-32 h-32 bg-white/50 rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-white">
        <div class="text-sky-400/80">
          <NoteIcon class="w-18 h-18" />
        </div>
      </div>
      <p class="text-xl font-bold text-slate-500 tracking-tight">ノートを選択</p>
      <p class="text-sm text-slate-400 mt-2">左のツリーからノートを選んでください</p>
    </div>

    <!-- ノート編集エリア -->
    <template v-if="store.selectedNote && store.selectedNote.type !== 'whiteboard'">
      <!-- ヘッダー -->
      <div class="z-10 h-14 shrink-0 border-b border-slate-100 bg-white/40 px-4 transition-all duration-200 sm:px-6">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-3">
        <div class="flex items-center gap-2 md:gap-3">
          <!-- 戻るボタン（モバイル） -->
          <button
            @click="store.setMobileView('sidebar')"
            type="button"
            aria-label="サイドバーを開く"
            title="サイドバーを開く"
            class="-ml-2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-300 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 日付バッジ -->
          <div
            class="hidden md:flex items-center text-[13px] font-medium text-slate-500 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-white"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2"></span>
            {{ formatDate(store.selectedNote.updatedAt) }} 編集
          </div>

          <!-- フォルダ移動ドロップダウン -->
          <div class="relative flex min-w-0 items-center">
            <span class="absolute left-2.5 text-sky-500 pointer-events-none w-4 h-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </span>
            <select
              :value="store.selectedNote.folderId"
              @change="store.moveNote($event.target.value)"
              class="max-w-[140px] cursor-pointer truncate appearance-none rounded-lg border border-slate-200/80 bg-white/70 py-1.5 pl-7 pr-6 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option v-for="f in store.folders" :key="f.id" :value="f.id">{{ f.name }}</option>
            </select>
            <span class="absolute right-2 text-slate-400 pointer-events-none">
              <ChevronDownIcon class="w-4 h-4" />
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            @click="handleShareToggle"
            class="flex items-center gap-2 rounded-xl border border-white/80 px-3 py-2 text-[13px] font-semibold shadow-sm transition-colors hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            :class="store.sharedState ? 'bg-sky-50 text-sky-700' : 'bg-white/70 text-slate-600'"
            :title="store.sharedState ? '共有設定を開く' : 'ノートを共有する'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
            </svg>
          </button>

          <button
            v-show="!store.isEditingContent"
            @click="store.openDeleteConfirm('note', store.selectedNoteId)"
            class="rounded-xl border border-white/80 bg-white/70 p-2.5 text-slate-400 shadow-sm transition-colors hover:bg-white hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"
            title="削除"
          >
            <TrashCanIcon class="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>

      <!-- エディタ本体 -->
      <div ref="editorScrollRef" class="relative z-10 flex flex-1 select-text flex-col overflow-y-auto px-4 pb-5 pt-3 md:px-6">
        <div
          class="w-full flex-1 flex flex-col relative max-w-6xl mx-auto"
        >

          <!-- タイトル -->
          <div class="mb-0 px-0 pb-2 pt-5 transition-all">
            <input
              type="text"
              class="w-full border-none bg-transparent p-0 text-2xl font-bold leading-tight tracking-tight text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 md:text-3xl"
              placeholder="タイトル..."
              :value="store.selectedNote.title"
              @input="store.updateNoteTitle(store.selectedNoteId, $event.target.value)"
              @blur="store.updateNoteTitle(store.selectedNoteId, $event.target.value)"
            />
          </div>

          <div class="border-t border-slate-200/80"></div>

          <!-- コンテンツエリア -->
          <div
            class="flex flex-1 cursor-text flex-col transition-all duration-300"
            @click="store.startEditing()"
          >
            <textarea
              v-if="store.isEditingContent"
              ref="textareaRef"
              class="min-h-[300px] w-full flex-1 resize-none border-none bg-transparent px-0 py-4 text-[1.05rem] leading-[1.8] text-slate-700 outline-none focus:ring-0 md:py-5 md:text-[1.1rem]"
              placeholder="ここにアイデアを書き留めましょう..."
              :value="store.selectedNote.content"
              @input="store.updateNoteContent(store.selectedNoteId, $event.target.value)"
              @blur="store.updateNoteContent(store.selectedNoteId, $event.target.value)"
            ></textarea>

            <div
              v-else
              class="w-full flex-1 whitespace-pre-wrap break-words px-0 py-4 text-[1.05rem] leading-[1.8] text-slate-700 md:py-5 md:text-[1.1rem]"
              v-html="linkify(store.selectedNote.content)"
            ></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useNotesStore } from '../store/notes'
import { formatDate, linkify } from '../utils/noteUtil'
import NoteIcon from '../assets/icons/note-icon.svg'
import ChevronDownIcon from '../assets/icons/chevron-down-solid-full.svg'
import TrashCanIcon from '../assets/icons/trash-can-solid-full.svg'

const store = useNotesStore()
const textareaRef = ref(null)
const editorScrollRef = ref(null)

watch(
  () => store.isEditingContent,
  async (editing) => {
    if (editing) {
      await nextTick()
      const textarea = textareaRef.value
      textarea?.focus({ preventScroll: true })
      textarea?.setSelectionRange(0, 0)
      if (textarea) {
        textarea.scrollTop = 0
      }
      if (editorScrollRef.value) {
        editorScrollRef.value.scrollTop = 0
      }
    }
  }
)

watch(
  () => store.selectedNoteId,
  { immediate: true }
)

async function handleShareToggle() {
  await store.handleShareToggle()
}

</script>
