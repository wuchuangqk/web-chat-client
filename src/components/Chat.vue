<template>
  <div class="relative chat-wrap bg-[--chat-bg]">
    <div ref="srcollEl" class="p-2 scroll-wrap">
      <Content v-for="content in contentList" :message="content" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, watch, nextTick } from 'vue'
import Content from './Content.vue';
// import User from './User.vue';
import { useAppStore } from '@/stores/app';

const { contentList } = toRefs(useAppStore())
const srcollEl = ref<HTMLElement>()
watch(contentList.value, () => {
  // 等到dom渲染完毕,否则获取到的scrollHeight是不准确的
  nextTick(() => {
    if (srcollEl.value) {
      srcollEl.value.scrollTop = srcollEl.value.scrollHeight - srcollEl.value.offsetHeight
    }
  })
})
</script>

<style lang="scss" scoped>
.chat-wrap {
  flex: 1;
  overflow: hidden;
}

.scroll-wrap {
  height: 100%;
  overflow-y: auto;
}
</style>