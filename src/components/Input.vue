<template>
  <div class="input-wrap flex flex-col">
    <div class=" border-b border-[#eee] py-2 px-2">
      <Icon icon="img" class-name="w-6 h-6" @click="chooseImg" />
    </div>
    <div class="flex-1 p-2">
      <textarea ref="textareaRef" v-model="content" class="w-full h-full outline-0 resize-none"
        @keydown="notAllowEnter"></textarea>
    </div>
    <div class="flex justify-end items-center px-2 pb-2">
      <span class="text-gray-400 mr-2 text-sm">Enter发送，Ctrl+Enter换行</span>
      <button class="bg-purple-500 text-white rounded px-3 shadow py-1" @click="send">发送</button>
    </div>
    <input ref="imgUploaderRef" type="file" accept=".jpg,.png" style="display: none;" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, withScopeId } from 'vue'
import { useAppStore } from '@/stores/app';
import JSFile from '@/utils/js-file'
import Icon from '@/components/Icon.vue'

const appStore = useAppStore()
const content = ref('')
let loading = false
const send = () => {
  if (loading) return
  loading = true
  if (!content.value.trim()) return
  const value = content.value.split('\n').join('<br/>')
  const message = {
    type: 'text',
    data: value,
    user: appStore.user
  }
  appStore.contentList.push(message)
  appStore.sendMessage({ type: 'message', data: message })
  content.value = ''
  loading = false
}
const notAllowEnter = (e: KeyboardEvent) => {
  // Enter键发送，同时阻止插入换行符
  if (e.key === 'Enter' && !e.ctrlKey) {
    e.preventDefault();
    send()
    return false;
  }
  // 同时按下Ctrl+Enter，插入换行符
  if (e.key === 'Enter' && e.ctrlKey) {
    content.value += '\r\n'
  }
}
const textareaRef = ref<HTMLTextAreaElement>()
const imgUploaderRef = ref<HTMLInputElement>()
const videoUploaderRef = ref<HTMLInputElement>()

onMounted(() => {
  textareaRef.value?.focus()
  imgUploaderRef.value?.addEventListener('change', (event: Event) => {
    const target = event!.target as HTMLInputElement
    if (!target.files) return
    const file = new JSFile(target.files[0])
    if (!['jpg', 'png'].includes(file.type)) {
      window.alert('只能选择图片')
    } else if (file.size / 1024 > 2) {
      window.alert('图片大小不能超过2M')
    }
    else {
      const reader = new FileReader()
      reader.onload = () => {
        const message = {
          type: 'image',
          data: reader.result,
          user: appStore.user
        }
        appStore.contentList.push(message)
        appStore.sendMessage({ type: 'message', data: message })
      }
      reader.readAsDataURL(file.rawFile)
    }
  })
  videoUploaderRef.value?.addEventListener('change', (event: Event) => {
    const target = event!.target as HTMLInputElement
    if (!target.files) return
    const file = new JSFile(target.files[0])
    if (!['mp4', 'mkv'].includes(file.type)) {
      window.alert('只支持mp4,mkv格式的视频')
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        if (!reader.result) return
        const message = {
          type: 'file',
          data: reader.result.byteLength,
          user: appStore.user
        }
      }
      reader.readAsArrayBuffer(file.rawFile)
    }
  })
})

const chooseImg = () => {
  imgUploaderRef.value?.click()
}


// 建立一个RTC链接
// const RTC = new RTCPeerConnection()
</script>

<style lang="scss" scoped>
.input-wrap {
  flex-basis: 180px;
  border-top: 1px solid #eee;
  background-color: #fff;
}
</style>