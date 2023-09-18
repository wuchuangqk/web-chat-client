<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center pl-3">
        <span class=" text-base">文件传输</span>
      </div>
      <div class="px-7 text-[#666]">
        <div class="grid grid-cols-1 gap-y-2 py-6">
          <span class=" col-span-2 truncate ">文件名称：{{ store.tranferInfo.name }}</span>
          <span class=" col-span-2">文件大小：{{ fmtSize(store.tranferInfo.size) }}</span>
          <span>发送设备：{{ store.tranferInfo.sender }}</span>
          <span>接收设备：{{ store.tranferInfo.receiver }}</span>
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
          <Button v-show="store.isShowSend" @click="store.showTranfer = false">取消</Button>
          <Button v-show="store.isShowSend && store.dataChannelReady" @click="store.sendFile">发送</Button>
          <Button v-show="progress === 100" @click="store.showTranfer = false">完成</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import Button from './Button.vue';
import { computed } from 'vue';
import {fmtSize} from '@/utils'

const store = useAppStore()
// 传输进度
const progress = computed(() => {
  return parseInt(store.tranferInfo.transferredByte / store.tranferInfo.size + "") * 100
})
</script>

<style lang="scss" scoped></style>