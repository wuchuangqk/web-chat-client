<template>
  <div class=" fixed top-0 right-0 bottom-0 left-0 bg-black/60 flex items-center justify-center">
    <div class="w-[360px] rounded-md bg-white">
      <div class=" h-10 border-b border-b-slate-300 flex items-center justify-between px-3">
        <span class=" text-base">设置</span>
        <Icon v-if="app.user.name" icon="Close" class-name="w-4 h-4" @click="app.showSetting = false" />
      </div>
      <div class="px-8 py-8">
        <div class="flex items-center justify-between">
          <p class="mb-2">自动接收</p>
          <Switch v-model="setting.autoAccept" @change="setting.save" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Icon from './Icon.vue';
import Switch from './Switch.vue';
import { useAppStore } from '@/stores/app';
import { useSettingStore } from '@/stores/setting';

const app = useAppStore()
const setting = useSettingStore()

</script>