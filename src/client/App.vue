<template>
  <main class="main md:shadow-md">
    <Nav />
    <div v-show="appStore.activeTab === 0" class="flex-1 overflow-hidden flex flex-col">
      <Chat />
      <OnlineUsers />
      <Input />
    </div>
    <div v-show="appStore.activeTab === 1" class="flex-1 flex justify-center bg-white">
      <!-- <memberList /> -->
    </div>
    <div v-if="!appStore.isOnline"
      class=" hidden sm:block fixed top-11 left-1 px-3 py-1 z-10 bg-[#dddddd] text-sm shadow">离线</div>
  </main>
  <FileTranfer v-if="appStore.showTranfer" />
  <UserRegister v-if="appStore.showRegister" />
</template>

<script setup lang="ts">
import Chat from './components/Chat.vue';
import Input from './components/Input.vue';
import { useAppStore } from '@/client/stores/app';
import FileTranfer from './components/FileTranfer.vue';
import Nav from './components/Nav/index.vue';
import UserRegister from './components/UserRegister.vue';
import OnlineUsers from './components/OnlineUsers.vue';
import { computed, onMounted } from 'vue';
import { addMember } from './stores/room';
import { user } from './stores/user';

const appStore = useAppStore()

const init = () => {
  // 刚进来需要配置连接信息
  if (!localStorage.getItem('open-chat:server_url')) {
    appStore.showRegister = true
    return
  }
  
  if (appStore.isOnline) return

  addMember(user)
  appStore.initConnection()
}

onMounted(() => {
  init()
})
</script>
<style lang="scss" scoped>
.main {
  width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 4px;
  position: relative;

  @media screen and (max-width: 600px) {
    width: 100%;
    border-radius: 0;
  }
}
</style>
