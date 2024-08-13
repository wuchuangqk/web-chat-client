<template>
  <div class="flex shrink-0 p-1">
    <Avatar v-for="user in userList" :key="user.id" :user="user" class="mr-2" />
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import Avatar from './Avatar.vue';
import { computed } from 'vue';

const store = useAppStore()
const userList = computed(() => {
  return store.usersMap.values()
})
</script>

<style lang="scss" scoped></style>