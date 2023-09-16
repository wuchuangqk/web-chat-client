<template>
  <div class="flex-1">
    <button v-if="store.dataChannelReady" class="bg-purple-500 text-white rounded px-3 shadow py-1"
      @click="sendFile">开始</button>
    <ul role="list" class="p-6 divide-y divide-slate-200">
      <li v-for="user in store.userList.filter(user => user.id !== store.user.id)" :key="user.id"
        class="py-4 first:pt-0 last:pb-0">
        <div class="ml-3 flex justify-between items-center">
          <div class="rounded-full py-1 px-2 flex items-center text-white" :class="user.color">{{ user.name }}</div>
          <button class="bg-purple-500 text-white rounded px-3 shadow py-1" @click="chooseFile(user)">传文件</button>
        </div>
      </li>
    </ul>
    <input ref="fileUploaderRef" type="file" style="display: none;" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app';

const store = useAppStore()
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
  file = target.files[0]
  store.connectRTC()
  store.createOffer(receiver.id)
}
const sendFile = () => {
  store.sendFile(file)
}

</script>

<style lang="scss" scoped></style>