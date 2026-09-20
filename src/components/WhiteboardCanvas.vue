<template>
  <div class="relative h-full w-full bg-white">
    <div :class="isToolBarOpen ? 'gap-2' : 'gap-0'"
      class="absolute left-3 top-3 z-10 rounded-2xl border border-slate-200 bg-white/50 p-2 shadow-sm backdrop-blur-sm">
      <div class="toolbar-panel">
        <div class="toolbar-top-row">
          <button type="button" @click="isToolBarOpen = !isToolBarOpen"
            class="toolbar-toggle inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-200 hover:bg-slate-200"
            :title="isToolBarOpen ? 'ツールバーを閉じる' : 'ツールバーを開く'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
              stroke-linejoin="round" class="h-4 w-4">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="toolbar-shell" :class="{ 'toolbar-shell-collapsed': !isToolBarOpen }" :style="toolbarShellStyle">
            <transition name="toolbar">
              <div ref="toolbarContentRef" :class="['toolbar-content', { 'toolbar-content-collapsed': !isToolBarOpen }]" :style="toolbarContentStyle">
                <div class="toolbar-row toolbar-row-primary" :class="{ 'toolbar-row-hidden': !isToolBarOpen }">
                  <button type="button" @click="emit('back-to-top')"
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                    title="トップに戻る">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                      stroke-linejoin="round" class="h-4 w-4">
                      <path d="M9 18 3 12l6-6" />
                      <path d="M21 12H3" />
                    </svg>
                  </button>

                  <input type="text" :value="props.note?.title"
                    @input="emit('title-change', $event.target.value, props.note?.id)"
                    class="toolbar-title bg-transparent text-sm font-medium text-slate-700 focus:outline-none" />

                  <template v-if="!isMobileViewport">
                    <div class="toolbar-tools">
                      <button v-for="tool in toolOptions" :key="tool.value" type="button" @click="handleToolSelect(tool.value)"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                        :class="selectedTool === tool.value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                        :title="tool.label">
                        <component :is="tool.icon" class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="toolbar-size" :class="{ 'is-mobile-color-open': isColorPaletteOpen }">
                      <button v-for="size in sizeOptions[selectedTool] || []" :key="size" type="button"
                        @click="handleWidthSelect(size, $event)"
                        class="size-option-button"
                        :class="selectedWidth === size ? 'size-option-button-selected' : ''"
                        :style="{
                          width: `${size * 1.5}px`,
                          height: `${size * 1.5}px`,
                          backgroundColor: selectedColor,
                          borderColor: selectedWidth === size ? 'rgba(15, 23, 42, 0.9)' : 'rgba(148, 163, 184, 0.7)',
                          boxShadow: selectedWidth === size ? 'inset 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 2px rgba(14,165,233,0.18)' : 'inset 0 0 0 1px rgba(255,255,255,0.7)'
                        }"
                        :title="`太さ ${size}px`" />
                    </div>
                  </template>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <transition name="toolbar">
        <div v-if="isToolBarOpen && isMobileViewport" class="toolbar-bottom-row">
          <div class="toolbar-tools">
            <button v-for="tool in toolOptions" :key="tool.value" type="button" @click="handleToolSelect(tool.value)"
              class="tool-option-button inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
              :class="selectedTool === tool.value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              :title="tool.label">
              <component :is="tool.icon" class="h-4 w-4" />
            </button>
          </div>

          <div class="toolbar-size" :class="{ 'is-mobile-color-open': isColorPaletteOpen }">
            <button v-for="size in sizeOptions[selectedTool] || []" :key="size" type="button"
              @click="handleWidthSelect(size, $event)"
              class="size-option-button"
              :class="selectedWidth === size ? 'size-option-button-selected' : ''"
              :style="{
                width: `${size * 1.5}px`,
                height: `${size * 1.5}px`,
                backgroundColor: selectedColor,
                borderColor: selectedWidth === size ? 'rgba(15, 23, 42, 0.9)' : 'rgba(148, 163, 184, 0.7)',
                boxShadow: selectedWidth === size ? 'inset 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 2px rgba(14,165,233,0.18)' : 'inset 0 0 0 1px rgba(255,255,255,0.7)'
              }"
              :title="`太さ ${size}px`" />
          </div>
        </div>
      </transition>

      <div class="pen-mode-tooltip" role="menu" aria-label="ペンモード選択" :class="{ 'pen-mode-tooltip-hidden': !isPenModeMenuOpen || !isToolBarOpen }" v-show="( selectedTool === 'pen' || selectedTool === 'marker') && isPenModeMenuOpen && isToolBarOpen">
        <button type="button" class="pen-mode-option" @click="selectPenMode('pen')">
          ペンモード
        </button>
        <button type="button" class="pen-mode-option" @click="selectPenMode('handwriting')">
          手書きモード
        </button>
      </div>
    </div>

    <div
      v-if="isColorPaletteOpen && ( selectedTool === 'pen' || selectedTool === 'marker')"
      ref="colorPalettePopupRef"
      class="color-palette-popup"
      :style="colorPalettePopupStyle"
    >
      <button v-for="color in paletteOptions[selectedTool] || []" :key="color.value" type="button"
        @click="selectColor(color.value)"
        class="mobile-color-button"
        :style="{ backgroundColor: color.value }"
        :title="color.label" />
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
const isColorPaletteOpen = ref(false)
const isPenModeMenuOpen = ref(false)
const isMobileViewport = ref(typeof window !== 'undefined' ? window.innerWidth <= 640 : false)
const colorPaletteAnchor = ref(null)
const colorPalettePopupRef = ref(null)
const toolbarContentRef = ref(null)
const toolbarWidth = ref(0)

const collapsedToolbarSize = 0

const toolbarContentStyle = computed(() => ({
  width: isToolBarOpen.value ? (isMobileViewport.value ? 'min(100%, calc(100vw - 6.5rem))' : `${toolbarWidth.value || 260}px`) : `${collapsedToolbarSize}px`,
  height: isToolBarOpen.value ? 'auto' : `${collapsedToolbarSize}px`,
  minWidth: isToolBarOpen.value ? (isMobileViewport.value ? '0' : 'max-content') : `${collapsedToolbarSize}px`,
  maxWidth: isToolBarOpen.value ? (isMobileViewport.value ? 'calc(100vw - 6.5rem)' : 'min(900px, calc(100vw - 5.5rem))') : `${collapsedToolbarSize}px`,
}))

const toolbarShellStyle = computed(() => ({
  width: isToolBarOpen.value ? (isMobileViewport.value ? 'min(100%, calc(100vw - 6.5rem))' : `${toolbarWidth.value || 260}px`) : `${collapsedToolbarSize}px`,
  height: isToolBarOpen.value ? 'auto' : `${collapsedToolbarSize}px`,
  minWidth: isToolBarOpen.value ? (isMobileViewport.value ? '0' : 'max-content') : `${collapsedToolbarSize}px`,
  maxWidth: isToolBarOpen.value ? (isMobileViewport.value ? 'calc(100vw - 6.5rem)' : 'min(900px, calc(100vw - 5.5rem))') : `${collapsedToolbarSize}px`,
}))

const colorPalettePopupStyle = computed(() => {
  const anchor = colorPaletteAnchor.value
  if (!anchor) {
    return { left: '10.5rem', top: '4.25rem' }
  }

  const rect = anchor.getBoundingClientRect()
  const popupWidth = colorPalettePopupRef.value?.offsetWidth || 180
  const popupHeight = colorPalettePopupRef.value?.offsetHeight || 56
  const margin = 12
  const targetX = rect.left + rect.width / 2 - 6
  const fixedTop = rect.bottom / 2 + popupHeight + margin
  // TODO: 高さ合わせたい

  const left = targetX - popupWidth / 2
  const top = Math.min(Math.max(fixedTop, 12), window.innerHeight - popupHeight - margin)

  return {
    left: `${left}px`,
    top: `${top}px`,
    '--callout-left': `${Math.max(0, targetX - left)}px`,
  }
})

const updateViewportMode = () => {
  isMobileViewport.value = window.innerWidth <= 640
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateViewportMode)
}

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
  pen: [4, 6, 10, 14, 20],
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
  () => [isToolBarOpen.value, props.note?.id],
  () => {
    if (!toolbarContentRef.value || !isToolBarOpen.value) {
      toolbarWidth.value = 260
      return
    }

    const width = toolbarContentRef.value.scrollWidth || toolbarContentRef.value.offsetWidth || 260
    toolbarWidth.value = Math.max(width, 260)
  },
  { flush: 'post' }
)

watch(
  selectedTool,
  (tool) => {
    isColorPaletteOpen.value = false
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

function handleWidthSelect(size, event) {
  const isSameSize = size === selectedWidth.value
  selectedWidth.value = size
  colorPaletteAnchor.value = event?.currentTarget || null

  if ((selectedTool.value === 'pen' || selectedTool.value === 'marker') && isSameSize) {
    toggleColorPalette()
    return
  }

  isColorPaletteOpen.value = false
}

function handleToolSelect(toolValue) {
  if (toolValue === 'pen') {
    if (selectedTool.value === 'pen') {
      isPenModeMenuOpen.value =  !isPenModeMenuOpen.value
      return
    }

    selectedTool.value = 'pen'
    isPenModeMenuOpen.value = false
    return
  }

  if (toolValue === 'eraser') {
    if (selectedTool.value === 'eraser') {
      const shouldClear = window.confirm('キャンバスをクリアしますか？')
      if (shouldClear) {
        clearCanvas()
      }
      return
    }

    selectedTool.value = 'eraser'
    isPenModeMenuOpen.value = false
    isColorPaletteOpen.value = false
    return
  }

  isPenModeMenuOpen.value = false
  selectedTool.value = toolValue
}

function selectPenMode(mode) {
  drawMode.value = mode
  selectedTool.value = 'pen'
  isPenModeMenuOpen.value = false
}

function toggleColorPalette() {
  if (selectedTool.value === 'eraser') {
    return
  }
  isColorPaletteOpen.value = !isColorPaletteOpen.value
}

function selectColor(color) {
  selectedColor.value = color
  isColorPaletteOpen.value = false
}

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
.toolbar-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 5.5rem);
}

.toolbar-top-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 5.5rem);
}

.toolbar-shell {
  position: relative;
  min-height: 2.5rem;
  min-width: max-content;
  width: max-content;
  max-width: min(900px, calc(100vw - 5.5rem));
  display: flex;
  align-items: flex-start;
  flex: 0 0 auto;
  overflow: hidden;
  overflow-y: visible;
  transition:
    width 0.26s ease,
    min-width 0.26s ease,
    max-width 0.26s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toolbar-shell-collapsed {
  width: 0;
  height: 0;
  min-width: 0;
  min-height: 0;
  max-width: 0;
  max-height: 0;
  opacity: 1;
  pointer-events: auto;
  overflow: hidden;
  transform: none;
}

.toolbar-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 6.5rem);
  min-width: 0;
  overflow: hidden;
}

.toolbar-toggle {
  flex-shrink: 0;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.toolbar-toggle:hover {
  transform: translateY(-1px);
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 0.5rem;
  min-height: 2.5rem;
  width: 260px;
  min-width: 0;
  max-width: min(900px, calc(100vw - 5.5rem));
  max-height: 12rem;
  overflow: hidden;
  white-space: normal;
  flex-shrink: 0;
  transition:
    width 0.26s ease,
    min-width 0.26s ease,
    max-width 0.26s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

@media (max-width: 640px) {
  .toolbar-shell {
    overflow: hidden;
  }
}

.toolbar-content-collapsed {
  width: 0;
  height: 0;
  min-width: 0;
  min-height: 0;
  max-width: 0;
  max-height: 0;
  opacity: 1;
  pointer-events: auto;
  overflow: hidden;
  transform: none;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: max-content;
  max-width: 100%;
  min-width: max-content;
  max-height: 3rem;
  overflow: hidden;
  align-self: flex-start;
  flex-shrink: 0;
  transition:
    width 0.22s ease,
    max-width 0.22s ease,
    min-width 0.22s ease,
    opacity 0.18s ease,
    transform 0.22s ease,
    padding 0.22s ease,
    margin 0.22s ease;
}

.toolbar-row-hidden {
  width: 0;
  max-width: 0;
  min-width: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateX(-0.3rem);
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.toolbar-row-primary {
  min-height: 2.5rem;
}

.toolbar-row-secondary {
  min-height: 2.5rem;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.toolbar-tools,
.toolbar-size,
.toolbar-colors,
.toolbar-mode {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-tools {
  flex: 0 0 auto;
  min-width: 0;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow: hidden;
}

.tool-option-button {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
}

.toolbar-size,
.toolbar-colors {
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.toolbar-title {
  flex: 1 1 auto;
  min-width: 0;
}

.toolbar-enter-active,
.toolbar-leave-active {
  transition:
    max-width 220ms ease,
    max-height 220ms ease,
    opacity 180ms ease,
    transform 220ms ease;
}

.toolbar-enter-from,
.toolbar-leave-to {
  opacity: 0;
  max-width: 0;
  max-height: 0;
  overflow: hidden;
  pointer-events: none;
}

.toolbar-enter-to,
.toolbar-leave-from {
  opacity: 1;
  max-width: min(900px, calc(100vw - 5.5rem));
  max-height: 12rem;
}

.size-option-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.8);
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.size-option-button:active {
  transform: scale(0.96);
}

.size-option-button-selected {
  border-color: rgba(15, 23, 42, 0.9);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.9), 0 0 0 2px rgba(14, 165, 233, 0.18);
}

.color-palette-popup {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
  z-index: 100;
  flex-wrap: wrap;
  max-width: 12.5rem;
  pointer-events: auto;
}

.color-palette-popup::before {
  content: "";
  position: absolute;
  left: var(--callout-left, calc(50% - 0.375rem));
  top: -0.4rem;
  width: 0.75rem;
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.98);
  border-left: 1px solid rgba(148, 163, 184, 0.7);
  border-top: 1px solid rgba(148, 163, 184, 0.7);
  transform: rotate(45deg);
}

.mobile-color-button {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.2);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .toolbar-content {
    width: max-content;
    min-width: 18rem;
    max-width: calc(100vw - 6.5rem);
    gap: 0.375rem;
  }

  .toolbar-content-collapsed {
    width: 0;
    min-width: 0;
    max-width: 0;
  }

  .toolbar-row {
    width: max-content;
    min-width: 18rem;
    max-width: calc(100vw - 6.5rem);
  }

  .toolbar-row-primary {
    flex-wrap: nowrap;
  }

  .toolbar-row-secondary {
    justify-content: space-between;
    padding-top: 0.125rem;
  }

  .toolbar-tools {
    width: auto;
    justify-content: space-between;
  }

  .pen-mode-tooltip {
    position: absolute;
    left: 0;
    top: calc(100% + 0.5rem);
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.7);
    border-radius: 0.9rem;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
    z-index: 30;
    min-width: 8rem;
  }

  .pen-mode-option {
    border-radius: 0.7rem;
    padding: 0.45rem 0.6rem;
    text-align: left;
    font-size: 0.72rem;
    color: #334155;
    background: #f8fafc;
    transition: background-color 0.15s ease;
  }

  .pen-mode-option:hover {
    background: #e2e8f0;
  }

  .toolbar-mode,
  .toolbar-size,
  .toolbar-colors {
    flex: 1 1 auto;
  }

  .toolbar-size {
    position: relative;
  }
}

.pen-mode-tooltip {
  position: absolute;
  left: 0;
  top: calc(100% + 0.5rem);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
  z-index: 30;
  min-width: 8rem;
  opacity: 1;
  max-height: 10rem;
  overflow: hidden;
  transition: opacity 0.2s ease, max-height 0.2s ease, transform 0.2s ease;
}

.pen-mode-tooltip-hidden {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-width: 0;
  transform: translateY(-0.25rem);
  pointer-events: none;
}

.pen-mode-option {
  border-radius: 0.7rem;
  padding: 0.45rem 0.6rem;
  text-align: left;
  font-size: 0.72rem;
  color: #334155;
  background: #f8fafc;
  transition: background-color 0.15s ease;
}

.pen-mode-option:hover {
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
