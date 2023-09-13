<template>
  <div class="flex" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <div class="p-2 rounded bg-white max-w-[80%] mb-2 break-all" :class="{ 'self': isSelf }" v-html="content"></div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  isSelf: boolean,
  content: string
}>()
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>