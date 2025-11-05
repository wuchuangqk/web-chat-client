<template>
  <div class="flex mb-3" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <!-- 对方头像 -->
    <Avatar v-if="!isSelf" :user="targetUser" class="mr-2" />
    <div>
      <!-- 昵称 -->
      <p v-if="!isSelf" class=" text-xs text-[#999] mb-1">[{{ targetUser.equipment }}]{{ targetUser.name }}</p>
      <!-- 消息内容 -->
      <slot></slot>
    </div>
    <!-- 自己头像 -->
    <Avatar v-if="isSelf" :user="targetUser" class="ml-2" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Avatar from '../Avatar.vue';
import { ITextMessage } from '@/common/types/client';
import { memberList } from '@/client/stores/room';
import { user } from '@/client/stores/user';
import { Equipment } from '@/common/enums';

const props = defineProps<{
  message: ITextMessage
}>()

const isSelf = computed(() => {
  return props.message.userId === user.socketId
})
const targetUser = computed(() => {
  let member = memberList.find(val => val.socketId === props.message.userId)
  if (!member) {
    member = {
      name: '离线用户',
      equipment: Equipment.PC,
      socketId: props.message.userId,
    }
  }
  return member
})
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>