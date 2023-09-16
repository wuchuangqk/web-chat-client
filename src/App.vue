<template>
  <main class="main">
    <Tabbar />
    <Chat v-show="appStore.activeTab === 0" />
    <Input v-show="appStore.activeTab === 0" />
    <FileTranfer v-show="appStore.activeTab === 1" />
    <div
      class=" hidden bg-purple-600 bg-fuchsia-600 bg-pink-600 bg-violet-600 bg-sky-600 bg-teal-600 bg-yellow-600 bg-red-600">
    </div>
  </main>
</template>

<script setup lang="ts">
import Chat from './components/Chat.vue';
import Input from './components/Input.vue';
import { useAppStore } from '@/stores/app';
import Tabbar from './components/Tabbar.vue';
import FileTranfer from './components/FileTranfer.vue';

const appStore = useAppStore()
appStore.initConnection()
</script>
<style lang="scss" scoped>
.main {
  width: 600px;
  background-color: var(--chat-bg);
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

