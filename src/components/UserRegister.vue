<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">设置设备标识</span>
        <Icon v-if="appStore.user.name" icon="Close" class-name="w-4 h-4" @click="close" />
      </div>
      <div class="px-8 py-8">
        <div>
          <p class="mb-2">名称</p>
          <input type="text" v-model.trim="formData.name" length="4" class="h-10 w-full rounded border px-2">
        </div>
        <div class="mt-6">
          <p class="mb-2">后台地址</p>
          <input type="text" v-model.trim="formData.serverUrl" placeholder="例如：192.168.3.20"
            class="h-10 w-full rounded border px-2">
        </div>
        <div class="mt-6">
          <p class="mb-2">后台端口</p>
          <input type="text" v-model.trim="formData.port" placeholder="例如：1060"
            class="h-10 w-full rounded border px-2">
        </div>
        <div class="mt-6">
          <p class="mb-2">设备类型</p>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="type1 in typeList" :key="type1.name" class="flex flex-col items-center rounded border py-2 type"
              :class="{ active: type1.name === formData.type }" @click="formData.type = type1.name">
              <div>
                <Icon :icon="type1.icon" class-name="w-8 h-8" />
              </div>
              <span class="text-[#666] text-xs mt-1">{{ type1.name }}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-center">
          <Button @click="submit">完成</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import Icon from './Icon.vue';
import Button from './Button.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore()
const formData = reactive({
  name: appStore.user.name,
  type: appStore.user.type || 'PC',
  serverUrl: localStorage.getItem('open-chat:server_url') || window.location.hostname,
  port: localStorage.getItem('open-chat:port') || window.location.port,
})
const typeList = [
  { name: 'PC', icon: 'pc' },
  { name: '虚拟机', icon: 'vm' },
  { name: '笔记本', icon: 'laptop' },
  { name: 'iPhone', icon: 'iPhone' },
  { name: 'iPad', icon: 'iPad' },
  { name: '安卓', icon: 'android' },
]
const close = () => {
  appStore.showRegister = false
}
const submit = () => {
  if (!formData.name || !formData.type || !formData.serverUrl || !formData.port) return
  appStore.user.name = formData.name
  appStore.user.type = formData.type
  localStorage.setItem('open-chat:user_info', JSON.stringify(appStore.user))
  localStorage.setItem('open-chat:server_url', formData.serverUrl)
  localStorage.setItem('open-chat:port', formData.port)
  appStore.showRegister = false
  if (!appStore.user.id) {
    // 是否初次连接
    appStore.initConnection()
  } else {
    // 通知其他用户
    appStore.updateUserInfo()
  }
}
</script>

<style lang="scss" scoped>
.type.active {
  border-color: #4EC588;
  // color: #fff;
}
</style>