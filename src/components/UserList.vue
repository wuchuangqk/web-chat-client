<template>
  <div class="w-[320px] flex flex-col pt-12 text-[#333]">
    <p class=" text-center mb-6 text-[#666]">{{ otherUsers.length }}台其他设备在线</p>
    <ul class="flex flex-col gap-y-2">
      <li v-for="user in otherUsers" :key="user.id" class=" rounded bg-[#F0FDF4] flex items-center h-10 px-4 border"
        @click="chooseFile(user)">
        <Icon :icon="store.typeIconMap[user.type]" class-name="w-8 h-8 mr-2" />
        <span>[{{ user.type }}]{{ user.name }}</span>
        <Icon icon="tranfer" class-name="w-5 h-5 ml-auto text-[#999]" />
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
const fileChange = (event: Event) => {
  const target = event!.target as HTMLInputElement
  if (!target.files) return
  store.isShowSend = true
  store.showTranfer = true

  store.resetQueue()
  for (let i = 0; i < target.files.length; i++) {
    const file = target.files[i]
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