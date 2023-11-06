<template>
  <main class="main md:shadow-md">
    <Nav />
    <div v-show="appStore.activeTab === 0" class="flex-1 overflow-hidden flex flex-col">
      <Chat />
      <Input />
    </div>
    <div v-show="appStore.activeTab === 1" class="flex-1 flex justify-center bg-white">
      <UserList />
    </div>
  </main>
  <div
    class=" hidden bg-purple-600 bg-fuchsia-600 bg-pink-600 bg-violet-600 bg-sky-600 bg-teal-600 bg-yellow-600 bg-red-600">
  </div>
  <FileTranfer v-if="appStore.showTranfer" />
  <UserRegister v-if="appStore.showRegister" />
</template>

<script setup lang="ts">
import Chat from './components/Chat.vue';
import Input from './components/Input.vue';
import { useAppStore } from '@/stores/app';
import FileTranfer from './components/FileTranfer.vue';
import Nav from './components/Nav/index.vue';
import UserList from './components/UserList.vue';
import UserRegister from './components/UserRegister.vue';
import { onMounted } from 'vue';

const appStore = useAppStore()
onMounted(() => {
  getUserInfo()
})
const getUserInfo = () => {
  if (!localStorage.getItem('open-chat:user_info') || !localStorage.getItem('open-chat:server_url')) {
    appStore.showRegister = true
    return
  }
  const userInfo = JSON.parse(localStorage.getItem('open-chat:user_info') as string)
  const serverUrl = localStorage.getItem('open-chat:server_url') as string
  appStore.user.name = userInfo.name
  appStore.user.type = userInfo.type
  appStore.initConnection(serverUrl)
}

</script>
<style lang="scss" scoped>
.main {
  width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 4px;

  @media screen and (max-width: 600px) {
    width: 100%;
    border-radius: 0;
  }
}
</style>

