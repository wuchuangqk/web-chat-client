<template>
  <div class="w-[300px] flex flex-col pt-12 text-[#666]">
    <p class=" text-center mb-6">当前设备：{{ appStore.user.name }}</p>
    <ul class="flex flex-col gap-y-2">
      <li v-for="user in appStore.userList.filter(user => user.id !== appStore.user.id)" :key="user.id"
        class=" rounded bg-[#F0FDF4] flex items-center h-10 px-3" @click="chooseFile(user)">{{
          user.name }}</li>
    </ul>
    <input ref="fileUploaderRef" type="file" style="display: none;" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app';

const appStore = useAppStore()
const fileUploaderRef = ref<HTMLInputElement>()
let receiver: IUser
let file: File
onMounted(() => {
  fileUploaderRef.value?.addEventListener('change', fileChange)
})
const chooseFile = (user: IUser) => {
  receiver = user
  fileUploaderRef.value?.click()
}
const fileChange = (event: Event) => {
  const target = event!.target as HTMLInputElement
  if (!target.files) return

  appStore.tranferFile = target.files[0]
  appStore.tranferInfo.name = appStore.tranferFile.name
  appStore.tranferInfo.size = appStore.tranferFile.size
  appStore.tranferInfo.sender = appStore.user.name
  appStore.tranferInfo.receiver = receiver.name
  appStore.tranferInfo.transferredByte = 0
  appStore.tranferInfo.buffers.length = 0
  console.log('tranferInfo:', appStore.tranferInfo);


  appStore.connectRTC()
  appStore.createOffer(receiver.id)
  appStore.isShowSend = true
  appStore.showTranfer = true
}
</script>

<style lang="scss" scoped></style>