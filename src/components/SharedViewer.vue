<template>
    <div class="relative min-h-screen w-full bg-sky-50">
        <div class="absolute inset-0 bg-sky-50 z-0"></div>
        <template v-if="sharedNote?.type === 'note'">
            <div class="flex-1 bg-sky-50 min-w-0 transition-all duration-300 relative z-0">
                <div
                    class="flex-1 px-4 md:px-8 pt-3 pb-5 select-text overflow-y-auto no-scrollbar flex flex-col z-10 relative">
                    <div v-if="sharedNote"
                        class="shared-viewer-title w-full flex-1 flex flex-col relative max-w-6xl mx-auto">
                        <!-- タイトル -->
                        <div
                            class="mb-2 px-6 md:px-8 py-2 transition-all rounded-xl bg-white focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div
                                class="w-full text-2xl md:text-3xl font-bold border-none outline-none bg-transparent text-slate-800 placeholder-slate-300 focus:ring-0 p-0 tracking-tight leading-tight">
                                {{ sharedNote?.title }}
                            </div>
                        </div>

                        <!-- コンテンツエリア -->
                        <div
                            class="shared-viewer-body flex-1 flex flex-col cursor-text rounded-xl transition-all duration-300 editing-active">
                            <div class="w-full flex-1 text-[1.05rem] md:text-[1.1rem] leading-[1.8] text-slate-700 px-6 py-4 md:px-8 md:py-5 whitespace-pre-wrap break-words"
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
    background: #e2e8f0;
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