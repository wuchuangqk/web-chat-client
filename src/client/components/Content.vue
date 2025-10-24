<template>
  <div class="flex mb-3" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <!-- 对方头像 -->
    <Avatar v-if="!isSelf" :user="targetUser" class="mr-2" />
    <div>
      <!-- 昵称 -->
      <p v-if="!isSelf" class=" text-xs text-[#999] mb-1">[{{ targetUser.type }}]{{ targetUser.name }}</p>
      <!-- 消息内容 -->
      <div class="flex items-center relative" :class="[isSelf ? 'pl-11' : 'pr-11']" @click="copy">
        <div class="p-2 rounded bg-white break-all" :class="{ 'self': isSelf }" v-html="message.data"></div>
        <div v-if="showCopy" class="text-[#999] text-xs absolute" :class="[isSelf ? '-left-0' : '-right-0']">已复制</div>
      </div>
    </div>
    <!-- 自己头像 -->
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
const showCopy = ref(false)

const isSelf = computed(() => {
  return props.message.userId === user.value.id
})
const targetUser = computed(() => {
  return usersMap.value.get(props.message.userId) as IUser
})

let timer: any
const copy = () => {
  const el = document.createElement('textarea')
  el.value = props.message.data
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  showCopy.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    showCopy.value = false
  }, 3000)
}
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>