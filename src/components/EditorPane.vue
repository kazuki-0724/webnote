<template>
  <div
    class="flex-1 bg-white/40 min-w-0 transition-all duration-300 relative z-0"
    :class="mobileVisible ? 'flex flex-col' : 'hidden md:flex md:flex-col'"
  >
    <!-- 装飾 blob -->
    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none"></div>

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
    <template v-if="store.selectedNote">
      <!-- ヘッダー -->
      <div class="h-14 flex items-center justify-between px-6 shrink-0 z-10 transition-all duration-200">
        <div class="flex items-center gap-2 md:gap-3">
          <!-- 戻るボタン（モバイル） -->
          <button
            @click="store.setMobileView('sidebar')"
            class="p-2 -ml-2 text-slate-600 hover:bg-white/60 rounded-xl md:hidden transition-colors shadow-sm border border-white/50 focus:ring-2 focus:ring-sky-300"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>

          <!-- 日付バッジ -->
          <div
            class="hidden md:flex items-center text-[13px] font-medium text-slate-500 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-white"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2"></span>
            {{ formatDate(store.selectedNote.updatedAt) }} 編集
          </div>

          <!-- フォルダ移動ドロップダウン -->
          <div class="relative flex items-center">
            <span class="absolute left-2.5 text-sky-500 pointer-events-none w-4 h-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </span>
            <select
              :value="store.selectedNote.folderId"
              @change="store.moveNote($event.target.value)"
              class="appearance-none bg-white/70 backdrop-blur-md border border-white/80 text-slate-700 text-[13px] font-bold py-1.5 pl-7 pr-6 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 cursor-pointer transition-colors max-w-[140px] truncate"
            >
              <option v-for="f in store.folders" :key="f.id" :value="f.id">{{ f.name }}</option>
            </select>
            <span class="absolute right-2 text-slate-400 pointer-events-none">
              <ChevronDownIcon class="w-4 h-4" />
            </span>
          </div>
        </div>

        <!-- 削除ボタン -->
        <button
          v-show="!store.isEditingContent"
          @click="store.openDeleteConfirm('note', store.selectedNoteId)"
          class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm border border-transparent hover:border-white"
          title="削除"
        >
          <TrashCanIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- エディタ本体 -->
      <div class="flex-1 px-4 md:px-8 pt-3 pb-5 select-text overflow-y-auto no-scrollbar flex flex-col z-10 relative">
        <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col relative">

          <!-- タイトル -->
          <div class="mb-2 px-6 md:px-8 py-2 transition-all rounded-xl bg-white focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <input
              type="text"
              class="w-full text-2xl md:text-3xl font-bold border-none outline-none bg-transparent text-slate-800 placeholder-slate-300 focus:ring-0 p-0 tracking-tight leading-tight"
              placeholder="タイトル..."
              :value="store.selectedNote.title"
              @blur="store.updateNoteTitle(store.selectedNoteId, $event.target.value)"
            />
          </div>
          <!-- コンテンツエリア -->
          <div
            class="flex-1 flex flex-col cursor-text rounded-xl transition-all duration-300 editing-active"
            @click="store.startEditing()"
          >
            <!-- テキストエリア（編集中） -->
            <textarea
              v-if="store.isEditingContent"
              ref="textareaRef"
              class="w-full flex-1 min-h-[300px] border-none outline-none resize-none bg-transparent focus:ring-0 text-[1.05rem] md:text-[1.1rem] leading-[1.8] text-slate-700 px-6 py-4 md:px-8 md:py-5"
              placeholder="ここにアイデアを書き留めましょう..."
              :value="store.selectedNote.content"
              @blur="store.updateNoteContent(store.selectedNoteId, $event.target.value)"
            ></textarea>

            <!-- 表示モード -->
            <div
              v-else
              class="w-full flex-1 text-[1.05rem] md:text-[1.1rem] leading-[1.8] text-slate-700 px-6 py-4 md:px-8 md:py-5 whitespace-pre-wrap break-words"
              v-html="linkify(store.selectedNote.content)"
            ></div>
          </div>

        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useNotesStore } from '../store/notes'
import { formatDate, linkify, extractUrls } from '../utils/noteUtil'
import NoteIcon from '../assets/icons/note-icon.svg'
import ArrowLeftIcon from '../assets/icons/arrow-left-solid-full.svg'
import ChevronDownIcon from '../assets/icons/chevron-down-solid-full.svg'
import TrashCanIcon from '../assets/icons/trash-can-solid-full.svg'

const store = useNotesStore()
const textareaRef = ref(null)

const mobileVisible = computed(() => store.mobileView === 'editor')

const linkChips = computed(() => {
  const content = store.selectedNote?.content || ''
  return [...new Set(extractUrls(content))]
})

watch(
  () => store.isEditingContent,
  async (editing) => {
    if (editing) {
      await nextTick()
      textareaRef.value?.focus()
    }
  }
)
</script>
