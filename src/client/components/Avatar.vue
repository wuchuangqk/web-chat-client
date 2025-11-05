<template>
  <div class="w-9 h-9 rounded-full flex items-center justify-center bg-white">
    <Icon :icon="typeIconMap[user.equipment]" class-name="w-7 h-7" />
  </div>
</template>
<script setup lang="ts">
import { toRefs } from 'vue'
import { useAppStore } from '@/client/stores/app';
import Icon from './Icon.vue';
import { IUser } from '@/common/types';

defineProps<{
  user: IUser
}>()

const { typeIconMap } = toRefs(useAppStore())
</script>

<style lang="scss" scoped></style>