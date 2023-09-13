<template>
  <div class=" absolute left-0 right-0 bottom-0 overflow-x-auto hidden-scrollbar">
    <div class="flex gap-1 p-2">
      <div v-for="user in userList" class=" rounded-full py-1 px-2 flex items-center shrink-0 text-white"
        :class="user.color">
        <span>{{ getName(user) }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import { useAppStore } from '@/stores/app';

const { userList, user } = toRefs(useAppStore())
const getName = (_user: IUser) => {
  if (_user.id === user.value.id) {
    return '我'
  } else {
    return _user.name
  }
}
</script>

<style lang="scss" scoped></style>