<template>
  <div class="relative chat-wrap bg-[--chat-bg]">
    <div ref="srcollEl" class="p-2 scroll-wrap">
      <template v-for="content in contentList">
        <TextMessage v-if="content.type === Message.Text" :message="(content as ITextMessage)" />
        <NotifyMessage v-if="content.type === Message.Notify" :message="(content as INotifyMessage)" />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, watch, nextTick } from 'vue'
import TextMessage from './Message/TextMessage.vue';
import NotifyMessage from './Message/NotifyMessage.vue';
import { useAppStore } from '@/client/stores/app';
import { Message } from '@/common/enums';
import { ITextMessage, INotifyMessage } from '@/common/types/client';

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