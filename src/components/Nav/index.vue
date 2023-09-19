<template>
  <div class=" h-10 bg-white flex justify-between items-center px-3 border-b border-b-slate-300">
    <div class="flex flex-col items-center">
      <span class=" text-base font-bold">open-chat</span>
      <span class="text-[#999] text-xs">{{ userList.length }}台设备在线</span>
    </div>
    <Tab />
    <div class="flex flex-col items-center" @click="appStore.showRegister = true">
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
const { userList, typeIconMap, user } = toRefs(appStore)
</script>

<style lang="scss" scoped></style>