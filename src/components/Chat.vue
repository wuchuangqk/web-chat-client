<template>
  <div class="relative chat-wrap bg-[--chat-bg]">
    <div ref="srcollEl" class="p-2 scroll-wrap">
      <template v-for="content in contentList">
        <Content v-if="content.type === 'message'" :message="content" />
        <NotifyMessage v-if="content.type === 'notify'" :message="content" />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, watch, nextTick } from 'vue'
import Content from './Content.vue';
import NotifyMessage from './NotifyMessage.vue';
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