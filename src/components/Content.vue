<template>
  <div class="flex" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <Avatar v-if="!isSelf" :user="message.user" class="mr-2" />
    <div v-if="message.type === 'text'" class="p-2 rounded bg-white max-w-[80%] mb-2 break-all"
      :class="{ 'self': isSelf }" v-html="message.data"></div>
    <img v-if="message.type === 'image'" :src="message.data" alt="" class=" max-w-[30%] rounded shadow mb-2"
      @click="previewImg = message.data">
    <div v-if="message.type === 'file'" class="p-2 rounded bg-white max-w-[80%] mb-2 break-all"
      :class="{ 'self': isSelf }">文件：{{ message.data }}</div>
    <Avatar v-if="isSelf" :user="message.user" class="ml-2" />
    <div v-if="previewImg"
      class=" fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center overflow-auto z-10 bg-black/90"
      @click="previewImg = ''">
      <img :src="previewImg" alt="" class="max-w-[90%] rounded-lg shadow">
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import Avatar from './Avatar.vue';
import { useAppStore } from '@/stores/app';
const props = defineProps<{
  message: IMessage
}>()

const { user } = toRefs(useAppStore())
const previewImg = ref('')
const isSelf = computed(() => {
  return props.message.user.id === user.value?.id
})
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>