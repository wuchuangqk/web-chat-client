<template>
  <div class="flex mb-3" :style="{ 'justify-content': isSelf ? 'flex-end' : 'flex-start' }">
    <Avatar v-if="!isSelf" :user="message.user" class="mr-2" />
    <div class="max-w-[80%]">
      <p v-if="!isSelf" class=" text-xs text-[#999] mb-1">[{{ message.user.type }}]{{ message.user.name }}</p>
      <div class="p-2 rounded bg-white break-all"
        :class="{ 'self': isSelf }" v-html="message.data"></div>
    </div>
    <Avatar v-if="isSelf" :user="message.user" class="ml-2" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import Avatar from './Avatar.vue';
import { useAppStore } from '@/stores/app';
const props = defineProps<{
  message: IMessage2
}>()

const { user } = toRefs(useAppStore())
const isSelf = computed(() => {
  return props.message.user.id === user.value?.id
})
</script>

<style lang="scss" scoped>
.self {
  background-color: var(--content-bg);
}
</style>