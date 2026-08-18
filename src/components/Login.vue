<template>
  <div class="flex h-screen w-screen items-center justify-center bg-slate-100 text-slate-800" style="font-family: 'Inter', sans-serif;">
    <div class="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-lg">
      <h1 class="text-2xl font-semibold">WebNote</h1>
      <p class="text-sm text-slate-500">Google アカウントでログインしてください</p>
      <button
        class="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        :disabled="isLoading"
        @click="$emit('login')"
      >
        {{ isLoading ? 'ログイン中...' : 'Googleでログイン' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['login'])
</script>