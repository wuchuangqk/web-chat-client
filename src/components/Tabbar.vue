<template>
  <div class="flex h-10">
    <div v-for="(tab, index) in tabs" :key="tab" class="flex-1 flex justify-center items-center tab rounded"
      :class="{ active: index === store.activeTab }" @click="store.activeTab = index">{{ tab }}</div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
const store = useAppStore()
const tabs = ['文本、图像', '文件、视频']
</script>

<style lang="scss" scoped>
.tab.active {
  @apply text-purple-500 bg-white;
}
</style>