<template>
  <div class="bg-slate-50 bg-mesh text-slate-800 overflow-hidden select-none h-screen w-screen flex antialiased" style="font-family: 'Inter', sans-serif;">
    <SidebarPane />
    <EditorPane />
    <ModalConfirm />
  </div>
  <!-- <TestFirestore /> -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotesStore } from './store/notes'
import SidebarPane from './components/SidebarPane.vue'
import EditorPane from './components/EditorPane.vue'
import ModalConfirm from './components/ModalConfirm.vue'

const store = useNotesStore()

onMounted(() => {
  store.initNotesStore()
})

</script>
