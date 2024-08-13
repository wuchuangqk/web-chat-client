<template>
  <div class="flex mb-3" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <Avatar v-if="!isSelf" :user="targetUser" class="mr-2" />
    <div class="max-w-[80%]">
      <p v-if="!isSelf" class=" text-xs text-[#999] mb-1">[{{ targetUser.type }}]{{ targetUser.name }}</p>
      <div class="p-2 rounded bg-white break-all" :class="{ 'self': isSelf }" v-html="message.data"></div>
    </div>
    <Avatar v-if="isSelf" :user="targetUser" class="ml-2" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import Avatar from './Avatar.vue';
import { useAppStore } from '@/stores/app';
const props = defineProps<{
  message: IMessage2
}>()

const { user, usersMap } = toRefs(useAppStore())
const isSelf = computed(() => {
  return props.message.userId === user.value.id
})
const targetUser = computed(() => {
  return usersMap.value.get(props.message.userId) as IUser
})
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>