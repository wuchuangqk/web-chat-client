<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">文件传输</span>
        <Icon icon="Close" class-name="w-4 h-4" @click="close" />
      </div>
      <div class="px-7 text-[#666]">
        <div class="grid grid-cols-1 gap-y-2 py-6">
          <span class="truncate ">文件名称：{{ store.tranferInfo.name }}</span>
          <span>文件大小：{{ fmtSize(store.tranferInfo.size) }}</span>
          <p v-if="!isSender" class="flex items-center">
            <span>发送设备：</span>
            <Icon :icon="store.typeIconMap[store.tranferInfo.sender.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ store.tranferInfo.sender.name }}</span>
          </p>
          <p v-if="isSender" class="flex items-center">
            <span>接收设备：</span>
            <Icon :icon="store.typeIconMap[store.tranferInfo.receiver.type]" class-name="w-4 h-4 mr-1" />
            <span>{{ store.tranferInfo.receiver.name }}</span>
          </p>
          <span v-if="store.tranferInfo.time">{{ isSender ? '发送' : '接收' }}时间：{{ store.tranferInfo.time }}</span>
          <span>传输状态：{{ state }}</span>
        </div>
        <div>
          <div class="flex justify-between text-xs mb-1 text-[#999]">
            <span>已传输字节：{{ store.tranferInfo.transferredByte }}/{{ store.tranferInfo.size }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class=" relative h-3 bg-[#E0FFEF]">
            <div class="h-full bg-[#4EC588]" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>
        <div class="flex justify-center gap-x-2 pt-10 pb-4">
          <Button v-show="store.isShowSend && store.dataChannelReady" @click="store.sendFile">开始传输</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import Button from './Button.vue';
import { computed } from 'vue';
import { fmtSize } from '@/utils'
import Icon from './Icon.vue';

const store = useAppStore()
// 传输进度
const progress = computed(() => {
  return Math.round((store.tranferInfo.transferredByte / store.tranferInfo.size * 100))
})
const state = computed(() => {
  if (progress.value === 100) {
    return '已下载'
  } else if (store.tranferInfo.transferredByte > 0) {
    return '正在传输'
  } else {
    return '等待传输'
  }
})
const isSender = computed(() => {
  return store.user.id === store.tranferInfo.sender.id
})
const close = () => {
  store.isShowSend = false
  store.showTranfer = false
}
</script>

<style lang="scss" scoped></style>