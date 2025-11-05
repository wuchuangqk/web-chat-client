<template>
  <div class="input-wrap border-t border-t-slate-300">
    <div class="h-full flex-col pc bg-white">
      <div class="flex-1 px-5 py-3">
        <textarea
          ref="textareaRef"
          v-model="content"
          placeholder="Enter发送，Ctrl+Enter换行"
          class="w-full h-full outline-0 resize-none"
          @keydown="notAllowEnter"
        ></textarea>
      </div>
      <div class="flex justify-end items-center px-5 pb-2">
        <Button @click="sendImg">传图片</Button>
      </div>
    </div>
    <div class="h-full items-center mobile bg-[#F5F5F5] px-4 py-2">
      <div class="flex-1 bg-white h-full px-2 rounded">
        <input
          ref="textareaRef"
          v-model="content"
          placeholder="发送消息"
          class="w-full h-full outline-0"
          @keydown="notAllowEnter"
        />
      </div>
      <div
        class="h-full flex justify-center shrink-0 items-center ml-4 px-4 rounded bg-[#4EC588] text-white"
        @click="sendImg"
      >
        传图片
      </div>
    </div>
    <FileUploader ref="fileUploaderRef" @change="prepareTransfer" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAppStore } from "@/client/stores/app";
import { useSessionStore } from "@/client/stores/session";
import Button from "./Button.vue";
import FileUploader from "./FileUploader.vue";
import { Message } from "@/common/enums";

onMounted(() => {
  textareaRef.value?.focus();
});
const appStore = useAppStore();
const sessionStore = useSessionStore();
const content = ref("");
let loading = false;
const send = () => {
  if (loading) return;
  loading = true;
  if (!content.value.trim()) return;
  const value = content.value.split("\n").join("<br/>");
  const message = {
    type: Message.Text,
    data: value,
    userId: appStore.user.id,
  };
  appStore.contentList.push(message);
  appStore.sendMessage(message);
  content.value = "";
  loading = false;
};
const notAllowEnter = (e: KeyboardEvent) => {
  // Enter键发送，同时阻止插入换行符
  if (e.key === "Enter" && !e.ctrlKey) {
    e.preventDefault();
    send();
    return false;
  }
  // 同时按下Ctrl+Enter，插入换行符
  if (e.key === "Enter" && e.ctrlKey) {
    content.value += "\r\n";
  }
};
const textareaRef = ref<HTMLTextAreaElement>();

const fileUploaderRef = ref<InstanceType<typeof FileUploader>>();
const sendImg = () => {
  if (sessionStore.isTargetJoin === false) {
    return;
  }
  fileUploaderRef.value?.chooseFile();
};
// 预处理传输格式，建立链接
const prepareTransfer = (files: FileList) => {
  appStore.resetQueue();
  const queue = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    appStore.tranferFileQueue.push(file);
    queue.push({
      name: file.name,
      size: file.size,
      transferredByte: 0,
      chunks: [],
      time: "",
      progress: 0,
      startTime: null,
      useTime: null,
      isDone: false,
    });
    appStore.addMessage(Message.IMAGE, file);
  }
  appStore.tranferMeta = {
    sender: appStore.user.id,
    receiver: sessionStore.target!.id,
    queue,
  };
  // appStore.isShowSend = true;
  // appStore.showTranfer = true;
};
</script>

<style lang="scss" scoped>
.input-wrap {
  height: 160px;
  flex-grow: 0;

  @media screen and (max-width: 500px) {
    height: 60px;
  }
}

.pc {
  display: flex;

  @media screen and (max-width: 500px) {
    display: none;
  }
}

.mobile {
  display: flex;

  @media screen and (min-width: 500px) {
    display: none;
  }
}
</style>
