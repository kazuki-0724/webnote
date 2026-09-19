<template>
  <div class="relative h-full w-full bg-white">
    <div :class="isToolBarOpen ? 'gap-2' : 'gap-0'"
      class="absolute left-3 top-3 z-10 flex flex-wrap items-center rounded-2xl border border-slate-200 bg-white/85 p-2 shadow-sm backdrop-blur-sm">
      <button type="button" @click="isToolBarOpen = !isToolBarOpen"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
        :title="isToolBarOpen ? 'ツールバーを閉じる' : 'ツールバーを開く'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
          stroke-linejoin="round" class="h-4 w-4">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="toolbar-shell">
        <transition name="toolbar">
          <div v-show="isToolBarOpen" class="toolbar-content">
            <button type="button" @click="emit('back-to-top')"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
              title="トップに戻る">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                stroke-linejoin="round" class="h-4 w-4">
                <path d="M9 18 3 12l6-6" />
                <path d="M21 12H3" />
              </svg>
            </button>
            <input type="text" :value="props.note?.title"
              @input="emit('title-change', $event.target.value, props.note?.id)"
              class="bg-transparent text-slate-700 text-sm font-medium focus:outline-none" />

            <button v-for="tool in toolOptions" :key="tool.value" type="button" @click="selectedTool = tool.value"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
              :class="selectedTool === tool.value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              :title="tool.label">
              <component :is="tool.icon" class="h-4 w-4" />
            </button>

            <div class="mx-1 h-6 w-px bg-slate-200" />

            <div class="flex items-center gap-1.5">
              <button type="button" @click="drawMode = drawMode === 'pen' ? 'handwriting' : 'pen'"
                class="rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors">
                {{ drawMode === 'pen' ? 'ペン' : '手書き' }}
              </button>
            </div>

            <div class="mx-1 h-6 w-px bg-slate-200" />

            <div class="flex items-center gap-1.5">
              <button v-for="size in sizeOptions[selectedTool] || []" :key="size" type="button"
                @click="selectedWidth = size"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-colors"
                :class="selectedWidth === size ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                :style="{
                  width: `${size + 7}px`,
                  height: `${size + 7}px`,
                  backgroundColor: selectedWidth === size ? '#f0f9ff' : '#ffffff'
                }" />
            </div>

            <div class="mx-1 h-6 w-px bg-slate-200" />

            <div v-if="selectedTool !== 'eraser'" class="flex items-center gap-1.5">
              <button v-for="color in paletteOptions[selectedTool] || []" :key="color.value" type="button"
                @click="selectedColor = color.value" class="h-5 w-5 rounded-full border-2 transition-all"
                :class="selectedColor === color.value ? 'border-slate-700 scale-110' : 'border-white hover:border-slate-300'"
                :style="{ backgroundColor: color.value }" :title="color.label" />
            </div>
            <button type="button" @click="clearCanvas"
              class="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-700"
              title="キャンバスをクリア">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </transition>
      </div>
    </div>

    <div class="absolute inset-0 overflow-hidden">
      <div ref="surfaceRef" class="relative whiteboard-surface" :style="surfaceStyle" @pointerdown="onPointerDown"
        @pointermove="onPointerMove" @pointerup="onPointerUp" @pointerleave="onPointerUp" @pointercancel="onPointerUp">
        <svg :width="viewportWidth" :height="viewportHeight" class="block" preserveAspectRatio="xMidYMid meet">
          <g v-for="stroke in renderedStrokes" :key="stroke.id">
            <polyline v-if="stroke.tool !== 'eraser'" :points="stroke.points.map((p) => `${p.x},${p.y}`).join(' ')"
              fill="none" :stroke="stroke.color || '#0f172a'" :stroke-width="stroke.width || 3" stroke-linecap="round"
              stroke-linejoin="round" :stroke-opacity="stroke.tool === 'marker' ? 0.45 : 1" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, h } from 'vue'

const PenIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'h-4 w-4' }, [
      h('path', { d: 'M15.5 3.5a2.1 2.1 0 1 1 3 3L7 18l-4 1 1-4 11.5-11.5Z' }),
      h('path', { d: 'm12 8 4 4' }),
    ])
  }
}

const MarkerIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'h-4 w-4' }, [
      h('path', { d: 'M4 17.5 14.5 7l3 3L7 20.5 4 17.5Z' }),
      h('path', { d: 'M13 5l3-3 4 4-3 3' }),
    ])
  }
}

const EraserIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'h-4 w-4' }, [
      h('path', { d: 'M7 15.5 14.5 8l4.5 4.5-7.5 7.5H7l-3-3 3-3Z' }),
      h('path', { d: 'M13.5 20h6.5' }),
    ])
  }
}

const TrashIcon = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'h-4 w-4' }, [
      h('path', { d: 'M3 6h18' }),
      h('path', { d: 'M8 6V4h8v2' }),
      h('path', { d: 'M19 6l-1 14H6L5 6' }),
      h('path', { d: 'M10 11v6' }),
      h('path', { d: 'M14 11v6' }),
    ])
  }
}

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['stroke-end', 'clear-canvas', 'back-to-top'])

const surfaceRef = ref(null)
const currentStroke = ref(null)
const viewportWidth = ref(1800)
const viewportHeight = ref(1200)
const selectedTool = ref('pen')
const selectedWidth = ref(3)
const selectedColor = ref('#111827')
const drawMode = ref('pen')
const panOffset = ref({ x: 0, y: 0 })
const activePointers = new Map()
const panState = ref(null)
const isToolBarOpen = ref(true)

const toolOptions = [
  { value: 'pen', label: 'ペン', icon: PenIcon },
  { value: 'marker', label: 'マーカー', icon: MarkerIcon },
  { value: 'eraser', label: '消しゴム', icon: EraserIcon },
]

const modeOptions = [
  { value: 'pen', label: 'ペン' },
  { value: 'handwriting', label: '手書き' },
]

const sizeOptions = {
  pen: [2, 3, 5, 7, 10],
  marker: [8, 16, 24],
  eraser: [8, 16, 24],
}

const paletteOptions = {
  pen: [
    { value: '#111827', label: '黒' },
    { value: '#ef4444', label: '赤' },
    { value: '#2563eb', label: '青' },
    { value: '#22c55e', label: '緑' },
    { value: '#facc15', label: '黄' },
  ],
  marker: [
    { value: '#facc15', label: '黄色' },
    { value: '#f97316', label: 'オレンジ' },
    { value: '#22c55e', label: '緑' },
  ],
  eraser: [{ value: '#ffffff', label: '消しゴム' }],
}

const strokes = computed(() => {
  const whiteboard = props.note?.whiteboard || { strokes: [] }
  return whiteboard.strokes || []
})

const renderedStrokes = computed(() => {
  const baseStrokes = strokes.value.filter((stroke) => stroke.tool !== 'eraser')
  if (!currentStroke.value) return baseStrokes
  if (currentStroke.value.tool === 'eraser') return baseStrokes
  return [...baseStrokes, currentStroke.value]
})

const surfaceStyle = computed(() => ({
  width: `${viewportWidth.value}px`,
  height: `${viewportHeight.value}px`,
  backgroundColor: props.note?.whiteboard?.backgroundColor || '#ffffff',
  touchAction: 'none',
  cursor: 'crosshair',
  userSelect: 'none',
  transform: `translate(${panOffset.value.x}px, ${panOffset.value.y}px)`,
}))

watch(
  () => props.note?.id,
  () => {
    const whiteboard = props.note?.whiteboard || { canvasWidth: 40000, canvasHeight: 24000 }
    viewportWidth.value = whiteboard.canvasWidth || 1800
    viewportHeight.value = whiteboard.canvasHeight || 1200
    panOffset.value = { x: 0, y: 0 }
    activePointers.clear()
    panState.value = null
  },
  { immediate: true }
)

watch(
  selectedTool,
  (tool) => {
    if (tool === 'pen') {
      selectedWidth.value = 5
      selectedColor.value = '#111827'
    }
    if (tool === 'marker') {
      selectedWidth.value = 16
      selectedColor.value = '#facc15'
    }
    if (tool === 'eraser') {
      selectedWidth.value = 16
      selectedColor.value = '#ffffff'
    }
  },
  { immediate: true }
)

function getPointerMidpoint() {
  const points = [...activePointers.values()]
  if (points.length === 0) return { x: 0, y: 0 }

  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 })
  return {
    x: total.x / points.length,
    y: total.y / points.length,
  }
}

function shouldAllowDrawing(event) {
  const pointerType = event.pointerType || 'mouse'

  if (drawMode.value === 'pen') {
    return pointerType === 'pen' || pointerType === 'mouse'
  }

  return pointerType === 'touch' || pointerType === 'pen' || pointerType === 'mouse'
}

function getRelativePoint(event) {
  const rect = surfaceRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }

  const x = (event.clientX - rect.left) * (viewportWidth.value / rect.width)
  const y = (event.clientY - rect.top) * (viewportHeight.value / rect.height)
  return { x, y }
}

function finalizeCurrentStroke(event) {
  if (!currentStroke.value) return

  const finalizedStroke = { ...currentStroke.value, points: [...currentStroke.value.points] }
  currentStroke.value = null

  finalizedStroke.updatedAt = Date.now()
  if (finalizedStroke.tool !== 'eraser') {
    emit('stroke-end', finalizedStroke)
  }

  if (event && typeof event.pointerId === 'number') {
    surfaceRef.value?.releasePointerCapture?.(event.pointerId)
  }
}

function onPointerDown(event) {
  if (!props.note) return

  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (activePointers.size >= 2) {
    panState.value = {
      startMidpoint: getPointerMidpoint(),
      startOffsetX: panOffset.value.x,
      startOffsetY: panOffset.value.y,
    }
    currentStroke.value = null
    return
  }

  if (!shouldAllowDrawing(event)) {
    return
  }

  event.preventDefault()
  const point = getRelativePoint(event)
  currentStroke.value = {
    id: `s${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    tool: selectedTool.value,
    color: selectedTool.value === 'eraser' ? '#ffffff' : selectedColor.value,
    width: selectedWidth.value,
    pointerId: event.pointerId,
    points: [point],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  surfaceRef.value?.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }

  if (activePointers.size >= 2) {
    if (!panState.value) {
      panState.value = {
        startMidpoint: getPointerMidpoint(),
        startOffsetX: panOffset.value.x,
        startOffsetY: panOffset.value.y,
      }
    }

    const midpoint = getPointerMidpoint()
    const dx = midpoint.x - panState.value.startMidpoint.x
    const dy = midpoint.y - panState.value.startMidpoint.y
    panOffset.value = {
      x: panState.value.startOffsetX + dx,
      y: panState.value.startOffsetY + dy,
    }
    return
  }

  if (!currentStroke.value || currentStroke.value.pointerId !== event.pointerId) return

  const point = getRelativePoint(event)
  const previous = currentStroke.value.points[currentStroke.value.points.length - 1]

  if (!previous || previous.x !== point.x || previous.y !== point.y) {
    currentStroke.value.points.push(point)
  }

  currentStroke.value.updatedAt = Date.now()

  if (currentStroke.value.tool === 'eraser') {
    emit('stroke-end', { ...currentStroke.value, points: [...currentStroke.value.points] })
  }
}

function onPointerUp(event) {
  activePointers.delete(event.pointerId)

  if (activePointers.size < 2) {
    panState.value = null
  }

  if (!currentStroke.value || currentStroke.value.pointerId !== event.pointerId) {
    return
  }

  finalizeCurrentStroke(event)
}

function clearCanvas() {
  emit('clear-canvas')
}
</script>

<style scoped>
.toolbar-shell {
  position: relative;
  height: 2.5rem;
  min-width: 0;
  display: flex;
  align-items: center;
}

.toolbar-content {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  max-width: 900px;
  overflow: hidden;
  white-space: nowrap;
}

.toolbar-enter-active,
.toolbar-leave-active {
  transition: max-width 220ms ease, opacity 180ms ease;
}

.toolbar-enter-from,
.toolbar-leave-to {
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  pointer-events: none;
}

.toolbar-enter-to,
.toolbar-leave-from {
  opacity: 1;
  max-width: 900px;
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
