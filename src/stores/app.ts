import { ref } from 'vue'
import { defineStore } from 'pinia'
import { download, debug } from '@/utils'
import { io, Socket } from 'socket.io-client'
import dayjs from 'dayjs'

const CHUNK_SIZE = 1 * 1024 * 1024 // 2MB
let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const user = ref<IUser>({
    name: '',
    id: '',
    type: '',
  }) // 当前用户
  const usersMap = ref<Map<string, IUser>>(new Map())
  const contentList = ref<IMessage2[]>([]) // 消息记录
  const activeTab = ref(0)
  const showTranfer = ref(false) // 是否接收到文件
  const tranferMeta = ref<ITranferMeta>(null as unknown as ITranferMeta)
  const tranferFileQueue = ref<File[]>([])
  const queueIndex = ref(0)
  const isShowSend = ref(false)
  const showRegister = ref(false)
  const typeIconMap: { [key: string]: string } = {
    'PC': 'pc',
    '虚拟机': 'vm',
    '笔记本': 'laptop',
    'iPhone': 'iPhone',
    'iPad': 'iPad',
    '安卓': 'iPad',
  }
  const isOnline = ref(false)

  let socket: Socket
  const initConnection = () => {
    const serverUrl = localStorage.getItem('open-chat:server_url') as string
    const port = localStorage.getItem('open-chat:port') as string
    socket = io(serverUrl + ':' + port)
    // 建立连接
    socket.on('connect', () => {
      console.log('connect', socket.id);
      user.value.id = socket.id as string
      // 将用户信息同步到后台
      socket.emit('bind-user-info', user.value)
      isOnline.value = true
    })
    // 断开连接
    socket.on('disconnect', () => {
      console.log('disconnect');
      isOnline.value = false
    })
    // 文本消息
    socket.on('broadcast:text-message', ({ id, msg }) => {
      contentList.value.push({
        type: 'message',
        data: msg,
        userId: id,
      })
    })

    // 房间里的成员
    socket.on('members', (users) => {
      usersMap.value.clear()
      users.forEach((user: IUser) => {
        usersMap.value.set(user.id, user)
      })
    })

    // 文件传输
    socket.on('tranfer-file', handleTransferFile)
    socket.on('ack', onAck)
  }
  // 一个ack表示一个来回
  // 接收方收到数据了
  let ackCallback: Function
  const onAck = () => {
    ackCallback && ackCallback()
  }
  const handleTransferFile = ({ id, type, data }: { id: string, type: string, data: any }) => {
    switch (type) {
      case 'queue':
        tranferMeta.value = {
          sender: id,
          receiver: user.value.id,
          queue: data.map((val: any) => {
            return {
              name: val.name,
              size: val.size,
              sender: id,
              transferredByte: 0,
              chunks: [],
              progress: 0,
              startTime: null,
              useTime: null,
              isDone: false,
            }
          })
        }
        showTranfer.value = true
        break
      case 'queue-index':
        queueIndex.value = data
        const currentQueue = tranferMeta.value.queue[queueIndex.value]
        currentQueue.startTime = new Date()
        break
      case 'blob-chunk':
        const { transferredByte, chunk } = data
        const currentFile = tranferMeta.value.queue[queueIndex.value]
        currentFile.chunks.push(chunk) // 数据块
        currentFile.transferredByte = transferredByte; // 已接收的字节数
        currentFile.progress = Math.round((transferredByte / currentFile.size * 100))
        socket.emit('ack', { targetId: id })
        if (currentFile.transferredByte === currentFile.size) {
          currentFile.useTime = dayjs().diff(currentFile.startTime, 'seconds')
          currentFile.isDone = true
          download(currentFile);
        }
        break
    }
  }
  const updateUserInfo = () => {
    socket.emit('bind-user-info', user.value)
  }
  // 发送文本消息
  const sendMessage = (data: IMessage2) => {
    // ws.send(JSON.stringify(data))
    socket.emit('client:text-message', data.data)
  }

  const debugHelper = (msg: string) => {
    debug({ user: user.value.name, id: user.value.id, msg })
  }

  const sendFile = () => {
    if (!tranferFileQueue.value.length) return
    isShowSend.value = false
    const { receiver, queue } = tranferMeta.value
    socket.emit('tranfer-file', {
      targetId: receiver,
      type: 'queue',
      data: queue.map(val => {
        return {
          name: val.name,
          size: val.size,
        }
      })
    })
    let jobIndex = 0
    const jobQueue = () => {
      queueIndex.value = jobIndex
      socket.emit('tranfer-file', {
        targetId: tranferMeta.value.receiver,
        type: 'queue-index',
        data: jobIndex,
      })
      const currentFile = tranferMeta.value.queue[queueIndex.value]
      const rawFile = tranferFileQueue.value[jobIndex]
      let offset = 0
      currentFile.startTime = new Date()
      const send = async () => {
        if (offset >= rawFile.size) {
          currentFile.useTime = dayjs().diff(currentFile.startTime, 'seconds')
          currentFile.isDone = true
          // 任务完成
          jobIndex++
          if (jobIndex < tranferFileQueue.value.length) {
            jobQueue()
          }
          return
        }
        const chunk = rawFile.slice(offset, offset + CHUNK_SIZE);
        offset += chunk.size
        currentFile.transferredByte = offset
        currentFile.progress = Math.round((currentFile.transferredByte / currentFile.size * 100))
        socket.emit('tranfer-file', {
          targetId: tranferMeta.value.receiver,
          type: 'blob-chunk',
          data: {
            transferredByte: offset,
            chunk: await chunk.arrayBuffer()
          }
        })
      }
      send()
      ackCallback = send
    }
    jobQueue()
  }
  const resetQueue = () => {
    // @ts-ignore
    tranferMeta.value = null
    tranferFileQueue.value.length = 0
    queueIndex.value = 0
  }
  const listenPage = () => {
    // document.addEventListener('visibilitychange', () => {
    //   debug({
    //     visibilityState: document.visibilityState,
    //     ws: ws.readyState
    //   })
    //   if (document.visibilityState === 'visible') {

    //   }
    // })
  }
  return {
    user,
    usersMap,
    contentList,
    activeTab,
    showTranfer,
    isShowSend,
    showRegister,
    typeIconMap,
    tranferMeta,
    tranferFileQueue,
    queueIndex,
    isOnline,
    initConnection,
    sendMessage,
    sendFile,
    resetQueue,
    listenPage,
    updateUserInfo,
  }
})
