<template>
  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white" :class="props.user.color">
    <span>{{ name }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useAppStore } from '@/stores/app';

const props = defineProps<{
  user: IUser
}>()

const { user } = toRefs(useAppStore())
const name = computed(() => {
  if (props.user.id === user.value.id) {
    return '我'
  } else {
    return props.user.id
  }
})
</script>

<style lang="scss" scoped></style>