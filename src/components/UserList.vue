<template>
  <div class="flex-1 flex flex-col pt-12 text-[#333]">
    <p class=" text-center mb-6 text-[#666]">{{ otherUsers.length }}台其他设备在线</p>
    <ul class="grid grid-cols-3 sm:grid-cols-2 gap-8 px-10">
      <li v-for="user in otherUsers" :key="user.id"
        class=" rounded bg-[#F0FDF4] flex flex-col items-center px-4 border pt-1 pb-3" @click="chooseFile(user)"
        @dragover="preventDefault" @drop="(e) => handleDrop(user, e)">
        <Icon :icon="store.typeIconMap[user.type]" class-name="w-20 h-20" />
        <p class="text-lg mb-1">{{ user.name }}</p>
        <p class="text-gray-400 text-xs">[{{ user.type }}]</p>
      </li>
    </ul>
    <input ref="fileUploaderRef" type="file" multiple style="display: none;" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/app';
import Icon from './Icon.vue';

const store = useAppStore()
const fileUploaderRef = ref<HTMLInputElement>()
let receiver: IUser
onMounted(() => {
  fileUploaderRef.value?.addEventListener('change', fileChange)
})
const otherUsers = computed(() => {
  return store.userList.filter(user => user.id !== store.user.id)
})
const chooseFile = (user: IUser) => {
  receiver = user
  fileUploaderRef.value?.click()
}
// 点击上传
const fileChange = (event: Event) => {
  const target = event!.target as HTMLInputElement
  if (!target.files) return
  prepareTransfer(target.files)
}
// 拖拽上传
const handleDrop = (user: IUser, event: DragEvent) => {
  event.preventDefault()
  receiver = user
  const files = event.dataTransfer?.files
  if (!files) return
  prepareTransfer(files)
}
// 阻止默认事件，使得元素能够接收 drop 事件
const preventDefault = (event: DragEvent) => {
  event.preventDefault()
}
// 预处理传输格式，建立链接
const prepareTransfer = (files: FileList) => {
  store.isShowSend = true
  store.showTranfer = true

  store.resetQueue()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    store.tranferFileQueue.push(file)
    store.tranferInfoQueue.push({
      name: file.name,
      size: file.size,
      sender: store.user,
      receiver,
      transferredByte: 0,
      buffers: [],
      time: ''
    })
  }

  store.connectRTC()
  store.createOffer(receiver.id)
}
</script>

<style lang="scss" scoped></style>