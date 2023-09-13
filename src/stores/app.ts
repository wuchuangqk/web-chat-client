import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const userList = shallowRef([])
  const contentList = ref<IContent[]>([])
  // 初始化websocket链接
  const initConnection = () => {
    ws = new WebSocket('ws://192.168.3.20:1060/chat')
    ws.onopen = () => {
      console.log('ws open');
    }
    ws.onmessage = handleMessage
    ws.onclose = () => {
      console.log('ws close');
    }
    ws.onerror = () => {
      console.log('ws error');
    }
  }
  const handleMessage = (msg: MessageEvent) => {
    console.log('ws message:', msg.data);
    const { type, data } = JSON.parse(msg.data)
    switch (type) {
      case 'user':
        userList.value = data.map((id: number) => `用户${id}`)
        console.log(userList.value);

        break
      case 'message':
        contentList.value.push({
          content: data,
          isSelf: false
        })
        break
    }
  }
  const sendMessage = (data: IMessage) => {
    ws.send(JSON.stringify(data))
  }
  return {
    userList,
    contentList,
    initConnection,
    sendMessage,
  }
})
