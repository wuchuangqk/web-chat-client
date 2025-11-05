<template>
  <Member :message="message">
    <div class="flex items-center relative" :class="[isSelf ? 'pl-11' : 'pr-11']" @click="copy">
      <div class="p-2 rounded bg-white break-all" :class="{ 'self': isSelf }" v-html="message.data"></div>
      <div v-if="showCopy" class="text-[#999] text-xs absolute" :class="[isSelf ? '-left-0' : '-right-0']">已复制</div>
    </div>
  </Member>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import Member from './Member.vue';
import { ITextMessage } from '@/common/types/client';
import { user } from '@/client/stores/user';

const props = defineProps<{
  message: ITextMessage
}>()

const showCopy = ref(false)

const isSelf = computed(() => {
  return props.message.userId === user.socketId
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