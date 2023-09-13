import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const user = shallowRef<IUser>({} as IUser) // 当前用户
  const userList = shallowRef<IUser[]>([]) // 所有在线的用户
  const contentList = ref<IMessage[]>([]) // 消息记录
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
    // console.log('ws message:', msg.data);
    const { type, data } = JSON.parse(msg.data)
    switch (type) {
      case 'users':
        userList.value = data
        break
      case 'id':
        const _user = userList.value.find(user => user.id === data)
        if (_user !== undefined) {
          user.value = _user
        }
        break
      case 'message':
        contentList.value.push(data)
        break
    }
  }
  // 发送文本消息
  const sendMessage = (data: IMessage2) => {
    ws.send(JSON.stringify(data))
  }
  return {
    user,
    userList,
    contentList,
    initConnection,
    sendMessage,
  }
})
