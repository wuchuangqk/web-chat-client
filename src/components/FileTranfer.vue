<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">{{ isSender ? '发送文件' : '接收文件' }}</span>
        <Icon icon="Close" class-name="w-4 h-4" @click="close" />
      </div>
      <div class="px-7 text-[#666]">
        <div class="grid grid-cols-1 gap-y-2 py-4">
          <span>传输队列：{{ (queueIndex + 1) }}/{{ tranferMeta.queue.length }}</span>
          <p v-if="!isSender" class="flex items-center">
            <span>发送方：</span>
            <Icon :icon="typeIconMap[sender.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ sender.name }}</span>
          </p>
          <p v-if="isSender" class="flex items-center">
            <span>接收方：</span>
            <Icon :icon="typeIconMap[receiver.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ receiver.name }}</span>
          </p>
          <span v-if="currentFile.time">{{ isSender ? '发送' : '接收' }}时间：{{ currentFile.time }}</span>
        </div>
        <div v-for="queue in tranferMeta.queue" :key="queue.name" class="py-2">
          <div class="grid grid-cols-1 gap-y-1 py-2">
            <div class="flex">
              <span class="shrink-0 break-all">文件名称：</span>
              <span>{{ queue.name }}</span>
            </div>
            <span>文件大小：{{ fmtSize(queue.size) }}</span>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1 text-[#999]">
              <span>已传输字节：{{ queue.transferredByte }}/{{ queue.size }}</span>
              <span>{{ queue.progress }}%</span>
            </div>
            <div class=" relative h-3 bg-[#E0FFEF]">
              <div class="h-full bg-[#4EC588]" :style="{ width: `${queue.progress}%` }"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-center gap-x-2 pt-10 pb-4">
          <Button v-show="isShowSend" @click="store.sendFile">开始传输</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import Button from './Button.vue';
import { computed, toRefs } from 'vue';
import { fmtSize } from '@/utils'
import Icon from './Icon.vue';

const store = useAppStore()
const {
  tranferMeta,
  queueIndex,
  typeIconMap,
  isShowSend,
  user,
  showTranfer,
  usersMap,
} = toRefs(store)
const currentFile = computed(() => tranferMeta.value.queue[queueIndex.value])
const isSender = computed(() => user.value.id === tranferMeta.value.sender)
const sender = computed(() => usersMap.value.get(tranferMeta.value.sender) as IUser)
const receiver = computed(() => usersMap.value.get(tranferMeta.value.receiver) as IUser)
const close = () => {
  isShowSend.value = false
  showTranfer.value = false
}
</script>

<style lang="scss" scoped></style>