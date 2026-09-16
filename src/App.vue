<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const { initializeAuth } = useAuth()

onMounted(async () => {
  await initializeAuth()
})
</script>
