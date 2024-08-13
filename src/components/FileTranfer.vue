<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">文件传输</span>
        <Icon icon="Close" class-name="w-4 h-4" @click="close" />
      </div>
      <div class="px-7 text-[#666]">
        <div class="grid grid-cols-1 gap-y-2 py-6">
          <span>传输队列：{{ (queueIndex + 1) }}/{{ tranferInfoQueue.length }}</span>
          <span class="truncate ">文件名称：{{ tranferInfo.name }}</span>
          <span>文件大小：{{ fmtSize(tranferInfo.size) }}</span>
          <p v-if="!isSender" class="flex items-center">
            <span>发送设备：</span>
            <Icon :icon="typeIconMap[tranferInfo.sender.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ tranferInfo.sender.name }}</span>
          </p>
          <p v-if="isSender" class="flex items-center">
            <span>接收设备：</span>
            <Icon :icon="typeIconMap[tranferInfo.receiver.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ tranferInfo.receiver.name }}</span>
          </p>
          <span v-if="tranferInfo.time">{{ isSender ? '发送' : '接收' }}时间：{{ tranferInfo.time }}</span>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1 text-[#999]">
            <span>已传输字节：{{ tranferInfo.transferredByte }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class=" relative h-3 bg-[#E0FFEF]">
            <div class="h-full bg-[#4EC588]" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
        <div class="flex justify-center gap-x-2 pt-10 pb-4">
          <Button v-show="isShowSend && isDataChannelReady" @click="store.sendFile">开始传输</Button>
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
  tranferInfoQueue,
  queueIndex,
  typeIconMap,
  isShowSend,
  isDataChannelReady,
  user,
  showTranfer
} = toRefs(store)
// 传输进度
const progress = computed(() => {
  const { transferredByte, size } = tranferInfoQueue.value[queueIndex.value]
  return Math.round((transferredByte / size * 100))
})
const tranferInfo = computed(() => {
  return tranferInfoQueue.value[queueIndex.value]
})
const isSender = computed(() => {
  return user.value.id === tranferInfo.value.sender.id
})
const close = () => {
  isShowSend.value = false
  showTranfer.value = false
}
</script>

<style lang="scss" scoped></style>