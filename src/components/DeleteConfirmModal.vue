<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.deleteConfirm.isOpen"
        class="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="store.closeDeleteConfirm()"
      >
        <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white">
          <div class="p-7">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              {{ store.deleteConfirm.type === 'folder' ? 'フォルダを削除' : 'ノートを削除' }}
            </h3>
            <p class="mt-3 text-slate-600 leading-relaxed text-sm">
              {{
                store.deleteConfirm.type === 'folder'
                  ? 'このフォルダと、含まれるすべてのノートを完全に削除しますか？この操作は元に戻せません。'
                  : 'このノートを完全に削除しますか？この操作は元に戻せません。'
              }}
            </p>
          </div>
          <div class="px-7 py-5 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100/50">
            <button
              @click="store.closeDeleteConfirm()"
              class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors focus:ring-2 focus:ring-slate-300"
            >
              キャンセル
            </button>
            <button
              @click="store.confirmDelete()"
              class="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-red-300"
            >
              削除する
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useNotesStore } from '../store/notes'
const store = useNotesStore()
</script>
