<template>
    <div class="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
        <div class="absolute inset-0 z-0 bg-white/20"></div>
        <template v-if="sharedNote?.type === 'note'">
            <div class="relative z-0 flex min-h-screen min-w-0 flex-col transition-all duration-300">
                <div
                    class="relative z-10 flex flex-1 select-text flex-col overflow-y-auto px-4 pb-8 pt-8 md:px-8">
                    <div v-if="sharedNote"
                        class="shared-viewer-title relative mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_14px_44px_rgba(37,99,235,0.08),0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-xl">
                        <!-- タイトル -->
                        <div
                            class="mb-0 px-4 py-4 transition-all md:px-8 md:py-5">
                            <div
                                class="w-full break-words text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
                                {{ sharedNote?.title }}
                            </div>
                        </div>

                        <div class="mx-4 border-t border-slate-200/80 md:mx-8"></div>

                        <!-- コンテンツエリア -->
                        <div
                            class="shared-viewer-body flex flex-1 flex-col transition-all duration-300">
                            <div class="w-full flex-1 whitespace-pre-wrap break-words px-4 py-5 text-[1.05rem] leading-[1.8] text-slate-700 md:px-8 md:py-6 md:text-[1.1rem]"
                                v-html="linkify(sharedNote?.content)"></div>
                        </div>
                    </div>
                </div>
            </div>

        </template>
        <template v-if="sharedNote?.type === 'whiteboard'">
            <div class="shared-whiteboard-shell absolute inset-0 overflow-hidden bg-slate-200">
                <div class="relative whiteboard-surface" :style="surfaceStyle">
                    <svg :width="viewportWidth" :height="viewportHeight" class="block"
                        preserveAspectRatio="xMidYMid meet">
                        <g v-for="stroke in strokes" :key="stroke.id">
                            <polyline v-if="stroke.tool !== 'eraser'"
                                :points="stroke.points.map((p) => `${p.x},${p.y}`).join(' ')" fill="none"
                                :stroke="stroke.color || '#111827'" :stroke-width="stroke.width || 3"
                                stroke-linecap="round" stroke-linejoin="round"
                                :stroke-opacity="stroke.tool === 'marker' ? 0.45 : 1" />
                        </g>
                    </svg>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watchEffect, onBeforeUnmount } from 'vue'
import { sharedRepository } from '../repositories/sharedRepository'
import { notesRepository } from '../repositories/notesRepository'
import { linkify } from '../utils/noteUtil'

const route = useRoute()
const sharedId = computed(() => route.query.id)
const viewportWidth = ref(1800)
const viewportHeight = ref(1200)
const strokes = ref([])

const sharedNote = ref(null)
let unsubscribeNote = null

const surfaceStyle = computed(() => ({
    width: `${viewportWidth.value}px`,
    height: `${viewportHeight.value}px`,
    backgroundColor: sharedNote.value?.whiteboard?.backgroundColor || '#ffffff',
    touchAction: 'none',
    userSelect: 'none',
    transform: 'translate(0, 0)',
}))

watchEffect(async () => {
    if (unsubscribeNote) {
        unsubscribeNote()
        unsubscribeNote = null
    }

    if (!sharedId.value) {
        sharedNote.value = null
        strokes.value = []
        return
    }

    const fetchedNote = await sharedRepository.fetchSharedNoteById(sharedId.value)
    if (!fetchedNote?.userId || !fetchedNote?.id) {
        sharedNote.value = null
        strokes.value = []
        return
    }

    sharedNote.value = fetchedNote

    if (fetchedNote.type === 'whiteboard') {
        const whiteboard = fetchedNote.whiteboard || {}
        viewportWidth.value = whiteboard.canvasWidth || 1800
        viewportHeight.value = whiteboard.canvasHeight || 1200
        strokes.value = whiteboard.strokes || []
    } else {
        strokes.value = []
    }

    unsubscribeNote = notesRepository.subscribeToNote(fetchedNote.userId, fetchedNote.id, (nextNote) => {
        if (!nextNote) {
            sharedNote.value = null
            strokes.value = []
            return
        }

        sharedNote.value = nextNote
        if (nextNote.type === 'whiteboard') {
            const whiteboard = nextNote.whiteboard || {}
            viewportWidth.value = whiteboard.canvasWidth || 1800
            viewportHeight.value = whiteboard.canvasHeight || 1200
            strokes.value = whiteboard.strokes || []
        } else {
            strokes.value = []
        }
    })
})

onBeforeUnmount(() => {
    if (unsubscribeNote) {
        unsubscribeNote()
        unsubscribeNote = null
    }
})

</script>

<style scoped>
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.shared-viewer-title {
    animation: fadeUp 0.35s ease-out both;
}

.shared-viewer-body {
    animation: fadeUp 0.45s ease-out 0.08s both;
}

.shared-whiteboard-shell {
    background: #f1f5f9;
}

.whiteboard-surface {
    min-width: 100%;
    min-height: 100%;
    background-image:
        linear-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
    background-size: 32px 32px;
    background-position: center center;
}
</style>