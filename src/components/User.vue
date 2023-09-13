<template>
  <div class=" absolute left-0 right-0 bottom-0">
    <div class="flex p-2 gap-1">
      <div v-for="user in userList" class=" rounded-full py-1 px-2 bg-black/20 text-black/60 flex items-center">
        <!-- <div class=" rounded-full w-2 h-2 mr-1"></div> -->
        <!-- :class="user.onLine ? 'bg-green-500' : 'bg-red-500'" -->
        <span>{{ user }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import { useAppStore } from '@/stores/app';

const { userList } = toRefs(useAppStore())

</script>

<style lang="scss" scoped></style>