<template>
  <div class="flex shrink-0 py-1 px-4 items-center text-[#999]">
    <span class=" mr-3">{{ store.usersMap.size }}台设备在线</span>
    <ToolTip v-for="user in userList" :key="user.id" class="mr-3">
      <template #refence>
        <Avatar :user="user" />
      </template>
      <template #content>
        <div class=" whitespace-nowrap">
          <span class=" text-[#999] mr-1">[{{ user.type }}]</span>
          <span>{{ user.name }}</span>
        </div>
      </template>
    </ToolTip>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import Avatar from './Avatar.vue';
import ToolTip from './ToolTip.vue';
import { computed } from 'vue';

const store = useAppStore()
const userList = computed(() => {
  return store.usersMap.values()
})
</script>

<style lang="scss" scoped></style>