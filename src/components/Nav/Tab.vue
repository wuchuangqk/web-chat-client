<template>
  <div class="flex rounded-full border border-[#D5D5D5] overflow-hidden">
    <div v-for="(tab, index) in tabs" :key="tab"
      class=" w-[60px] h-[26px] flex justify-center items-center tab text-[#999]"
      :class="{ active: index === store.activeTab }" @click="store.activeTab = index">{{ tab }}</div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
const store = useAppStore()
const tabs = ['发消息', '传文件']
</script>

<style lang="scss" scoped>
.tab.active {
  background: #D5D5D5;
  color: #000;
}
</style>