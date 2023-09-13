<template>
  <main class="main">
    <Chat />
    <Input />
  </main>
</template>

<script setup lang="ts">
import Chat from './components/Chat.vue';
import Input from './components/Input.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore()
appStore.initConnection()
</script>
<style lang="scss" scoped>
.main {
  // height: 100%;
  width: 600px;
  background-color: var(--chat-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
}
</style>

