<template>
  <div class="flex shrink-0 p-1">
    <!-- <Avatar v-for="user in userList" :key="user.id" :user="user" class="mr-2" /> -->
    <ToolTip v-for="user in userList" :key="user.id" class="mr-2">
      <template #refence>
        <Avatar :user="user" />
      </template>
      <template #content>
        <span>{{ user.name }}</span>
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