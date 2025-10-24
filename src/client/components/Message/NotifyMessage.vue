<template>
  <div class=" text-center py-2 text-[#999]">
    {{ message.data }}
  </div>
</template>
<script setup lang="ts">
import { INotifyMessage } from '@/common/types/client';

defineProps<{
  message: INotifyMessage
}>()
</script>