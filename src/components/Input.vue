<template>
  <div class="input-wrap flex flex-col p-2">
    <div class="flex-1">
      <textarea v-model="content" class="w-full h-full outline-0 resize-none" @keydown="notAllowEnter"></textarea>
    </div>
    <div class="flex justify-end items-center">
      <span class="text-gray-400 mr-2 text-sm">Enter发送，Ctrl+Enter换行</span>
      <button class="bg-purple-500 text-white rounded px-3 shadow py-1" @click="send">发送</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app';

const appStore = useAppStore()
const content = ref('')
let loading = false
const send = () => {
  if (loading) return
  loading = true
  if (!content.value.trim()) return
  const value = content.value.split('\n').join('<br/>')
  appStore.contentList.push({ content: value, isSelf: true })
  appStore.sendMessage({ type: 'message', data: value })
  content.value = ''
  loading = false
}
const notAllowEnter = (e: KeyboardEvent) => {
  // Enter键发送，同时阻止插入换行符
  if (e.key === 'Enter' && !e.ctrlKey) {
    e.preventDefault();
    send()
    return false;
  }
  // 同时按下Ctrl+Enter，插入换行符
  if (e.key === 'Enter' && e.ctrlKey) {
    content.value += '\r\n'
  }
}

</script>

<style lang="scss" scoped>
.input-wrap {
  flex-basis: 200px;
  border-top: 1px solid #eee;
  background-color: #fff;
}
</style>