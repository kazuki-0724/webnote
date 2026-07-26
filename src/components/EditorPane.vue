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
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </div>
      </div>
      <p class="text-xl font-bold text-slate-500 tracking-tight">ノートを選択</p>
      <p class="text-sm text-slate-400 mt-2">左のツリーからノートを選んでください</p>
    </div>

    <!-- ノート編集エリア -->
    <template v-if="store.selectedNote">
      <!-- ヘッダー -->
      <div class="h-16 flex items-center justify-between px-6 shrink-0 z-10 transition-all duration-200">
        <div class="flex items-center gap-2 md:gap-3">
          <!-- 戻るボタン（モバイル） -->
          <button
            v-show="!store.isEditingContent"
            @click="store.setMobileView('sidebar')"
            class="p-2 -ml-2 text-slate-600 hover:bg-white/60 rounded-xl md:hidden transition-colors shadow-sm border border-white/50 focus:ring-2 focus:ring-sky-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>

          <!-- 日付バッジ -->
          <div
            v-show="!store.isEditingContent"
            class="hidden md:flex items-center text-[13px] font-medium text-slate-500 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-white"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2"></span>
            {{ formatDate(store.selectedNote.updatedAt) }} 編集
          </div>

          <!-- フォルダ移動ドロップダウン -->
          <div v-show="!store.isEditingContent" class="relative flex items-center">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </span>
          </div>

          <!-- 完了ボタン（編集中） -->
          <!-- <button
            v-if="store.isEditingContent"
            @click="store.stopEditing()"
            class="fade-enter-active px-5 py-2 bg-gradient-to-tr from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 font-bold rounded-xl transition-all text-sm hover:-translate-y-0.5"
          >
            完了
          </button> -->
        </div>

        <!-- 削除ボタン -->
        <button
          v-show="!store.isEditingContent"
          @click="store.openDeleteConfirm('note', store.selectedNoteId)"
          class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm border border-transparent hover:border-white"
          title="削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </button>
      </div>

      <!-- エディタ本体 -->
      <div class="flex-1 px-6 md:px-16 py-6 select-text overflow-y-auto no-scrollbar flex flex-col z-10 relative">
        <div class="max-w-3xl mx-auto w-full flex-1 flex flex-col relative">

          <!-- タイトル -->
          <div class="mb-4 p-4 transition-all rounded-xl focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus-within:border focus-within:border-white">
            <input
              type="text"
              class="w-full text-3xl md:text-4xl font-bold border-none outline-none bg-transparent text-slate-800 placeholder-slate-300 focus:ring-0 p-0 tracking-tight"
              placeholder="タイトル..."
              :value="store.selectedNote.title"
              @blur="store.updateNoteTitle(store.selectedNoteId, $event.target.value)"
            />
          </div>

          <!-- URLチップ（編集中のみ） -->
          <div
            v-if="store.isEditingContent && linkChips.length > 0"
            class="mb-6 flex flex-wrap gap-2 px-2 fade-enter-active"
          >
            <a
              v-for="url in linkChips"
              :key="url"
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-sky-600 hover:bg-white hover:text-sky-700 text-sm font-bold rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white/50 transition-all hover:shadow-[0_4px_12px_rgba(14,165,233,0.15)] hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <span class="truncate max-w-[200px] md:max-w-[300px]">{{ url }}</span>
            </a>
          </div>

          <!-- コンテンツエリア -->
          <div
            class="flex-1 flex flex-col cursor-text rounded-xl transition-all duration-300"
            :class="store.isEditingContent ? 'editing-active' : ''"
            @click="store.startEditing()"
          >
            <!-- テキストエリア（編集中） -->
            <textarea
              v-if="store.isEditingContent"
              ref="textareaRef"
              class="w-full flex-1 min-h-[300px] border-none outline-none resize-none bg-transparent focus:ring-0 text-[1.05rem] md:text-[1.1rem] leading-[1.8] text-slate-700 p-6 md:p-8"
              placeholder="ここにアイデアを書き留めましょう..."
              :value="store.selectedNote.content"
              @blur="store.updateNoteContent(store.selectedNoteId, $event.target.value)"
            ></textarea>

            <!-- 表示モード -->
            <div
              v-else
              class="w-full flex-1 pb-40 text-[1.05rem] md:text-[1.1rem] leading-[1.8] text-slate-700 p-4 md:p-6 whitespace-pre-wrap break-words"
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
import { formatDate, linkify, extractUrls } from '../utils'

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
