<template>
  <div class=" relative">
    <div ref="refenceRef" @click="handleClick" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
      <slot name="refence" />
    </div>
    <div v-show="show" ref="contentRef" class="content">
      <slot name="content" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { createPopper } from '@popperjs/core';
import type { Instance } from '@popperjs/core';
import { isMobile } from '@/utils'

const refenceRef = ref<HTMLElement>(null as unknown as HTMLElement)
const contentRef = ref()
const show = ref(false)
let popperInstance: Instance

const handleClick = () => {
  if (!isMobile) return
  show.value = !show.value
  if (show.value) {
    popperInstance.update()
  }
}
const handleMouseenter = () => {
  if (isMobile) return
  show.value = true
  popperInstance.update()
}
const handleMouseleave = () => {
  if (isMobile) return
  show.value = false
}
const hide = (e: MouseEvent) => {
  if (!refenceRef.value?.contains(e.target as Node) && show.value) {
    show.value = false
  }
}
onMounted(() => {
  popperInstance = createPopper(refenceRef.value, contentRef.value, {
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        }
      },
    ]
  })
  isMobile && document.addEventListener('click', hide)
})
onUnmounted(() => {
  isMobile && document.removeEventListener('click', hide)
})
</script>

<style lang="scss" scoped>
.content {
  background-color: #fff;
  @apply text-sm py-1.5 px-2 rounded shadow-md;
}
</style>