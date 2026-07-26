<template>
  <div
    class="flex flex-col shrink-0 bg-white/40 backdrop-blur-xl border-r border-white/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] z-20 transition-all duration-300"
    :class="mobileVisible ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'"
  >
    <!-- ===== ヘッダー ===== -->
    <div class="px-5 pt-5 pb-3 shrink-0">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
        </div>
        <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight flex-1">Idea Notes</h1>
        <!-- 新規フォルダボタン -->
        <button
          @click="startCreateFolder"
          title="新規フォルダ"
          class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </button>
      </div>

      <!-- 検索バー -->
      <div class="relative group z-50">
        <span class="absolute left-3.5 top-3 text-slate-400 transition-colors group-focus-within:text-sky-500 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="ノートを検索..."
          autocomplete="off"
          v-model="store.searchQuery"
          @focus="searchFocused = true"
          @blur="handleSearchBlur"
          class="w-full pl-9 pr-4 py-2.5 bg-white/70 backdrop-blur-md rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-400/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder-slate-400 text-slate-800 select-text border border-white/50 focus:border-sky-300"
        />
        <SearchSuggestions :show="searchFocused" @select="searchFocused = false" />
      </div>
    </div>

    <!-- ===== ツリー本体 ===== -->
    <div class="flex-1 overflow-y-auto px-3 pb-4">

      <!-- 新規フォルダ入力行 -->
      <div
        v-if="store.isCreatingFolder"
        class="flex items-center px-3 py-2 mb-1 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-sky-100 ring-2 ring-sky-50"
      >
        <span class="text-sky-500 mr-2.5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
        </span>
        <input
          ref="newFolderInput"
          v-model="newFolderName"
          type="text"
          placeholder="フォルダ名..."
          class="bg-transparent border-none outline-none text-[14px] font-medium w-full text-slate-800 select-text focus:ring-0 p-0"
          @keydown="handleNewFolderKey"
          @blur="cancelCreateFolder"
        />
      </div>

      <!-- フォルダノード -->
      <div
        v-for="folder in store.folders"
        :key="folder.id"
        class="mb-1"
      >
        <!-- フォルダヘッダー行 -->
        <div
          class="group flex items-center gap-1.5 px-2 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/60 select-none"
          @click="store.toggleFolderExpansion(folder.id)"
        >
          <!-- 展開/折りたたみ矢印 -->
          <span
            class="text-slate-400 transition-transform duration-200 shrink-0"
            :class="store.isFolderExpanded(folder.id) ? 'rotate-90' : 'rotate-0'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </span>

          <!-- フォルダアイコン -->
          <span :class="store.isFolderExpanded(folder.id) ? 'text-sky-500' : 'text-slate-400'" class="shrink-0 transition-colors">
            <svg v-if="store.isFolderExpanded(folder.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
          </span>

          <!-- フォルダ名 -->
          <span class="flex-1 text-[13.5px] font-semibold text-slate-700 truncate">{{ folder.name }}</span>

          <!-- ノート数バッジ -->
          <span
            v-if="(store.notesByFolder[folder.id] || []).length > 0"
            class="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {{ (store.notesByFolder[folder.id] || []).length }}
          </span>

          <!-- 新規ノートボタン -->
          <button
            @click.stop="store.createNote(folder.id)"
            title="ノートを作成"
            class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-sky-300 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
          </button>

          <!-- フォルダ削除ボタン（general以外） -->
          <button
            v-if="folder.id !== 'general'"
            @click.stop="store.openDeleteConfirm('folder', folder.id)"
            title="フォルダを削除"
            class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-red-300 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>

        <!-- ノートリスト（展開時） -->
        <Transition name="tree-expand">
          <div
            v-if="store.isFolderExpanded(folder.id)"
            class="ml-3 pl-3 border-l-2 border-slate-100 mb-1"
          >
            <!-- ノートなし -->
            <div
              v-if="(store.notesByFolder[folder.id] || []).length === 0"
              class="py-2 px-2 text-[12px] text-slate-400 italic"
            >
              ノートがありません
            </div>

            <!-- ノート行 -->
            <div
              v-for="note in store.notesByFolder[folder.id]"
              :key="note.id"
              @click="store.selectNote(note.id)"
              class="group/note flex items-start gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 relative"
              :class="store.selectedNoteId === note.id
                ? 'bg-gradient-to-r from-sky-500/10 to-blue-500/5 shadow-sm ring-1 ring-sky-200/60'
                : 'hover:bg-white/70'"
            >
              <!-- アクティブインジケーター -->
              <div
                v-if="store.selectedNoteId === note.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[17px] w-0.5 h-5 bg-sky-500 rounded-full"
              ></div>

              <!-- ノートアイコン -->
              <span
                class="mt-0.5 shrink-0 transition-colors"
                :class="store.selectedNoteId === note.id ? 'text-sky-500' : 'text-slate-300 group-hover/note:text-slate-400'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>

              <!-- ノート情報 -->
              <div class="flex-1 min-w-0">
                <div
                  class="text-[13px] font-medium truncate leading-tight transition-colors"
                  :class="store.selectedNoteId === note.id ? 'text-sky-700' : 'text-slate-700 group-hover/note:text-slate-900'"
                >
                  {{ note.title || '無題のノート' }}
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 truncate leading-tight">
                  {{ note.content ? note.content.slice(0, 40).replace(/\n/g, ' ') : '本文なし' }}
                </div>
              </div>

              <!-- 時刻 + 削除 -->
              <div class="shrink-0 flex flex-col items-end gap-1">
                <span class="text-[10px] text-slate-400">{{ formatDate(note.updatedAt) }}</span>
                <button
                  @click.stop="store.openDeleteConfirm('note', note.id)"
                  class="opacity-0 group-hover/note:opacity-100 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-400 rounded-md transition-all focus:outline-none focus:opacity-100"
                  title="削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useNotesStore } from '../store/notes'
import SearchSuggestions from './SearchSuggestions.vue'
import { formatDate } from '../utils'

const store = useNotesStore()

const searchFocused = ref(false)
const newFolderName = ref('')
const newFolderInput = ref(null)

const mobileVisible = computed(() => store.mobileView === 'sidebar')

function handleSearchBlur() {
  setTimeout(() => {
    searchFocused.value = false
  }, 200)
}

async function startCreateFolder() {
  store.isCreatingFolder = true
  newFolderName.value = ''
  await nextTick()
  newFolderInput.value?.focus()
}

function handleNewFolderKey(e) {
  if (e.key === 'Enter') {
    store.createFolder(newFolderName.value)
    newFolderName.value = ''
  } else if (e.key === 'Escape') {
    cancelCreateFolder()
  }
}

function cancelCreateFolder() {
  setTimeout(() => {
    store.isCreatingFolder = false
    newFolderName.value = ''
  }, 150)
}
</script>

<style scoped>
.tree-expand-enter-active {
  animation: treeExpand 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tree-expand-leave-active {
  animation: treeExpand 0.15s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}
@keyframes treeExpand {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
