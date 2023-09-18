<template>
  <div class=" h-10 bg-white flex justify-between items-center px-3 border-b border-b-slate-300">
    <span class=" text-base font-bold">open-chat</span>
    <Tab />
    <span class="text-[#999]">{{ appStore.userList.length }}台设备在线</span>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Tab from './Tab.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore()
</script>

<style lang="scss" scoped></style>