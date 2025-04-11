<template>
  <div class=" text-center py-2 text-[#999]">
    {{ message.data }}
  </div>
</template>
<script setup lang="ts">
defineProps<{
  message: IMessage2
}>()
</script>