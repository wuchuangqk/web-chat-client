<template>
  <div class=" h-10 bg-white flex justify-between items-center px-3 border-b border-b-slate-300">
    <div class="flex-1">
      <div class=" text-base font-bold">open-chat
        <span class=" text-sm text-[#999] font-normal ml-1">[{{ isOnline ? '在线' : '离线' }}]</span>
      </div>
      <div class="text-[#999] text-xs">{{ usersMap.size }}台设备在线</div>
    </div>
    <div class="flex-1 flex justify-center">
      <Tab />
    </div>
    <div class="flex flex-1 justify-end" @click="appStore.showRegister = true">
      <div class="flex items-center">
        <Icon :icon="typeIconMap[user.type]" class-name="w-6 h-6 mr-2" />
        <span>{{ user.name }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import Tab from './Tab.vue';
import { useAppStore } from '@/stores/app';
import Icon from '../Icon.vue';

const appStore = useAppStore()
const { usersMap, typeIconMap, user, isOnline } = toRefs(appStore)
</script>

<style lang="scss" scoped></style>