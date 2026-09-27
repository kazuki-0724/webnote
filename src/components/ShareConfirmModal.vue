<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="store.shareConfirm.isOpen"
        class="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="store.closeShareConfirm()">
        <div
          class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white">
          <div class="p-7">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              共有設定
            </h3>
            <template v-if="store.sharedState">
              <label for="share-url" class="block mt-5 text-sm font-medium text-slate-700">
                共有リンク
              </label>
              <div class="mt-2 flex gap-2">
                <input
                  id="share-url"
                  ref="shareUrlInput"
                  :value="store.getShareUrl()"
                  readonly
                  class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  @focus="$event.target.select()"
                />
                <button
                  @click="copyShareUrl"
                  class="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  :aria-label="copyStatus === 'copied' ? 'コピーしました' : '共有リンクをコピー'"
                >
                  {{ copyStatus === 'copied' ? 'コピー済み' : 'コピー' }}
                </button>
              </div>
              <p v-if="copyStatus === 'error'" role="status" class="mt-2 text-sm text-red-600">
                コピーできませんでした。リンクを選択してコピーしてください。
              </p>
            </template>
            <p v-else class="mt-3 text-sm leading-relaxed text-slate-600">
              このノートは共有されていません
            </p>
          </div>
          <div class="px-7 py-5 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100/50">
            <button @click="store.closeShareConfirm()"
              class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors focus:ring-2 focus:ring-slate-300">
              キャンセル
            </button>
            <template v-if="!store.sharedState">
              <button @click="store.startSharing()"
                class="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300">
                共有する
              </button>
            </template>
            <template v-else>
              <button @click="store.stopSharing()"
                class="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-red-300">
                共有を停止する
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useNotesStore } from '../store/notes'

const store = useNotesStore()
const copyStatus = ref('')
const shareUrlInput = ref(null)

async function copyShareUrl() {
  const shareUrl = store.getShareUrl()
  if (!shareUrl) return

  copyStatus.value = ''
  try {
    const clipboard = globalThis.navigator?.clipboard
    if (clipboard?.writeText) {
      await clipboard.writeText(shareUrl)
    } else {
      shareUrlInput.value?.select()
      if (!document.execCommand('copy')) {
        throw new Error('Clipboard API is unavailable')
      }
    }
    copyStatus.value = 'copied'
  } catch {
    copyStatus.value = 'error'
  }
}

</script>
