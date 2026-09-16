<template>
  <Loading />
</template>

<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Loading from './Loading.vue'

const router = useRouter()
const { authReady, user } = useAuth()

watch(
  [authReady, user],
  () => {
    if (!authReady.value) return

    if (user.value) {
      router.replace('/home')
      return
    }

    router.replace('/login')
  },
  { immediate: true }
)
</script>
