import { defineStore } from "pinia";
import { reactive, ref, shallowRef } from "vue";

export const useSessionStore = defineStore('session', () => {
  const target = shallowRef<IUser>() // 对方
  const messageList = shallowRef<IMessage2[]>([]) // 消息记录
  const isTargetJoin = ref(false) // 对方是否加入
  const isOwner = ref(false) // 是否为房主

  return {
    target,
    messageList,
    isTargetJoin,
    isOwner,
  }
})