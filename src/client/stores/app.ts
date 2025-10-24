import { ref } from 'vue'
import { defineStore } from 'pinia'
import { download, debug } from '@/client/utils'
import { io, Socket } from 'socket.io-client'
import dayjs from 'dayjs'
import { useSettingStore } from './setting'
import { useSessionStore } from './session'
import { Message, Event } from '@/common/enums/index'
import type { IContent } from '@/common/types/client'

const CHUNK_SIZE = 1 * 1024 * 1024 // 1MB

export const useAppStore = defineStore('app', () => {
  const session = useSessionStore()

  const user = ref<IUser>({
    name: '',
    id: '',
    type: '',
  }) // 当前用户
  const usersMap = ref<Map<string, IUser>>(new Map())
  const contentList = ref<IContent[]>([]) // 消息记录
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
    '安卓': 'android',
  }
  const isOnline = ref(false)
  const sendStatus = ref('待发送')
  const showSetting = ref(false)

  let socket: Socket
  const initConnection = () => {
    const serverUrl = localStorage.getItem('open-chat:server_url') as string
    const port = localStorage.getItem('open-chat:port') as string
    socket = io(serverUrl + ':' + port)
    // 建立连接
    socket.on('connect', () => {
      console.log('client connect', socket.id);
      // user.value.id = socket.id as string
      // 将用户信息同步到后台，同时拉取房间内成员
      // socket.emit('bind-user-info', user.value)
      // 建立连接后加入房间
      socket.emit(Event.JoinRoom, user.value)
      isOnline.value = true
    })
    // 断开连接
    socket.on('disconnect', () => {
      console.log('client disconnect');
      isOnline.value = false
    })

    socket.on(Event.NewMember, (newMember: IUser) => {
      debug({ msg: '新成员加入房间', newMember })
    })

    // 文本消息
    socket.on(Event.TextMessage, ({ id, msg }) => {
      contentList.value.push({
        type: Message.Text,
        data: msg,
        userId: id,
      })
    })
    // 通知类文本消息
    socket.on('broadcast:notify-message', ({ msg }) => {
      contentList.value.push({
        type: Message.Notify,
        data: msg,
      })
    })

    // 房间里的成员
    socket.on('members', (users: IUser[]) => {
      usersMap.value.clear()
      users.forEach((user: IUser) => {
        usersMap.value.set(user.id, user)
      })

      if (users.length === 1) {
        session.target = undefined
        session.isTargetJoin = false
      } else {
        // 如果有多人加入房间，只取第一个
        const otherUsers = users.filter((_user) => _user.id !== user.value.id)
        if (otherUsers.length) {
          session.target = otherUsers[0]
          session.isTargetJoin = true
        }
      }
    })

    // 文件传输
    socket.on('tranfer-file', handleTransferFile)
    socket.on('ack', onAck)
    socket.on('receiver-responses', ({ type }) => {
      switch (type) {
        case 'accept':
          sendStatus.value = '对方同意接收'
          sendFile()
          break
        case 'refuse':
          sendStatus.value = '对方拒绝接收'
          break
      }
    })
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
        sendStatus.value = '待接收'
        const setting = useSettingStore()
        if (setting.autoAccept) {
          confirmReceive()
        }
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
    socket.emit('client:text-message', data.data)
  }

  const debugHelper = (msg: string) => {
    debug({ user: user.value.name, id: user.value.id, msg })
  }

  const sendFile = () => {
    if (!tranferFileQueue.value.length) return
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
  // 等待对方确认
  const beforeSend = () => {
    if (!tranferFileQueue.value.length) return
    isShowSend.value = false
    sendStatus.value = '等待对方确认'
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
  }
  const confirmReceive = () => {
    const { sender } = tranferMeta.value
    socket.emit('receiver-responses', {
      targetId: sender,
      type: 'accept',
    })
    sendStatus.value = '已同意接收'
  }
  const cancelReceive = () => {
    const { sender } = tranferMeta.value
    socket.emit('receiver-responses', {
      targetId: sender,
      type: 'refuse',
    })
    showTranfer.value = false
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
  const addMessage = (type: Message, data: any) => {
    contentList.value.push({
      type,
      data,
      userId: user.value.id
    })
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
    showSetting,
    sendStatus,
    initConnection,
    sendMessage,
    sendFile,
    beforeSend,
    resetQueue,
    listenPage,
    updateUserInfo,
    confirmReceive,
    cancelReceive,
    addMessage,
  }
})
