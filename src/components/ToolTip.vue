<template>
  <div>
    <div ref="refenceRef" @click="handleClick">
      <slot name="refence" />
    </div>
    <div v-show="show" ref="contentRef" class="content">
      <slot name="content" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { createPopper } from '@popperjs/core';
import { onMounted } from 'vue';
import { onUnmounted } from 'vue';

const refenceRef = ref<HTMLElement>(null as unknown as HTMLElement)
const contentRef = ref()
const show = ref(false)
const handleClick = () => {
  show.value = !show.value
}
const hide = (e: MouseEvent) => {
  if (!refenceRef.value?.contains(e.target as Node) && show.value) {
    show.value = false
  }
}
onMounted(() => {
  createPopper(refenceRef.value, contentRef.value, {
    placement: 'top-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        }
      },
    ]
  })
  document.addEventListener('click', hide)
})
onUnmounted(() => {
  document.removeEventListener('click', hide)
})
</script>

<style lang="scss" scoped>
.content {
  background-color: #fff;
  @apply text-[#999] text-xs p-1 rounded;
}
</style>