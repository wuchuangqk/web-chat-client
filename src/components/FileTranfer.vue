<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[500px] sm:w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">{{ isSender ? '发送文件' : '接收文件' }}</span>
        <Icon icon="Close" class-name="w-4 h-4" @click="close" />
      </div>
      <div class="px-7 text-[#666]">
        <div class="grid grid-cols-1 gap-y-2 py-4">
          <span>传输队列：{{ (queueIndex + 1) }}/{{ tranferMeta.queue.length }}</span>
          <p>状态：{{ sendStatus }}</p>
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
        <div v-for="queue in tranferMeta.queue" :key="queue.name" class="p-2 bg-[#F0FDF4] rounded border mb-2">
          <div class="break-all mb-1">{{ queue.name }}</div>
          <div class="text-xs text-[#999] mb-1 flex justify-between">
            <span>{{ fmtSize(queue.size) }}</span>
            <span v-if="queue.isDone">传输用时：{{ queue.useTime }}秒</span>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1 text-[#999]">
              <span>已传输字节：{{ queue.transferredByte }}/{{ queue.size }}</span>
              <span>{{ queue.progress }}%</span>
            </div>
            <div class=" relative h-3 bg-[#c4f5dc]">
              <div class="h-full bg-[#4EC588]" :style="{ width: `${queue.progress}%` }"></div>
            </div>
          </div>
        </div>
        <div class="pt-8 pb-4">
          <div v-show="isShowSend" class="flex justify-center gap-x-2">
            <Button @click="store.beforeSend">发送</Button>
          </div>
          <div v-if="sendStatus === '待接收'" class="flex justify-center gap-x-2">
            <Button @click="store.confirmReceive">确认接收</Button>
            <Button @click="store.cancelReceive">不接收</Button>
          </div>
          <div v-if="sendStatus === '对方拒绝接收'" class="flex justify-center gap-x-2">
            <Button @click="store.beforeSend">再次发送</Button>
          </div>
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
  sendStatus,
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