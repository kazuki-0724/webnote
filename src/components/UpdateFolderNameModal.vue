<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.isUpdateFolderModalOpen"
        class="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="store.closeUpdateFolderModal()"
      >
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white">
          <div class="p-7">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">フォルダ名の更新</h3>
            <p class="mt-2 text-slate-600 text-sm mb-5">新しいフォルダ名を入力してください。</p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-[0.12em] mb-2">タイトル</label>
                <input
                  type="text"
                  v-model="noteTitle"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-300 focus:ring-1 focus:ring-sky-300"
                  :placeholder="store.getFolderById(selectedFolderId)?.name"
                />
              </div>
            </div>
          </div>
          <div class="px-7 py-5 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100/50">
            <button
              @click="store.closeUpdateFolderModal()"
              class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors focus:ring-2 focus:ring-slate-300"
            >
              キャンセル
            </button>
            <button
              @click="handleUpdate"
              class="px-5 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-sky-300"
            >
              更新する
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
const selectedType = ref('note')
const noteTitle = ref('')

watch(
  () => store.isUpdateFolderModalOpen,
  (open) => {
    if (open) {
      selectedFolderId.value =
        store.selectedFolderId === 'all' ? 'general' : store.selectedFolderId
      selectedType.value = 'note'
    }
  }
)

function handleUpdate() {
  store.updateFolderName(selectedFolderId.value, noteTitle.value)
  store.closeUpdateFolderModal()
}
</script>
