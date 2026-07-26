<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.isCreateNoteModalOpen"
        class="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="store.closeCreateNoteModal()"
      >
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white">
          <div class="p-7">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">新規ノートの作成</h3>
            <p class="mt-2 text-slate-600 text-sm mb-5">保存先のフォルダを選択してください。</p>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-sky-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                </svg>
              </span>
              <select
                v-model="selectedFolderId"
                class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option v-for="f in store.folders" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
              <span class="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </div>
          </div>
          <div class="px-7 py-5 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100/50">
            <button
              @click="store.closeCreateNoteModal()"
              class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors focus:ring-2 focus:ring-slate-300"
            >
              キャンセル
            </button>
            <button
              @click="handleCreate"
              class="px-5 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-sky-300"
            >
              作成する
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotesStore } from '../store/notes'

const store = useNotesStore()

const selectedFolderId = ref('general')

// モーダルを開いた時、現在のフォルダをデフォルトにする
watch(
  () => store.isCreateNoteModalOpen,
  (open) => {
    if (open) {
      selectedFolderId.value =
        store.selectedFolderId === 'all' ? 'general' : store.selectedFolderId
    }
  }
)

function handleCreate() {
  store.createNote(selectedFolderId.value)
}
</script>
