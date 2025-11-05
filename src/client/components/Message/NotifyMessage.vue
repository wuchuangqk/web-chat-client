<template>
  <div class=" text-center py-2 text-[#999] text-xs">
    {{ currentTime }}
    <span class=" ml-0.5">{{ message.data }}</span>
  </div>
</template>
<script setup lang="ts">
import { INotifyMessage } from '@/common/types/client';
import dayjs from 'dayjs';

defineProps<{
  message: INotifyMessage
}>()

const currentTime = dayjs().format('HH:mm:ss')
</script>