import { ref } from 'vue'
import { defineStore } from 'pinia'
import { download, debug } from '@/client/utils'
import { io, Socket } from 'socket.io-client'
import dayjs from 'dayjs'
import { useSettingStore } from './setting'
import { useSessionStore } from './session'
import { Message, Event } from '@/common/enums/index'
import type { IContent, ITextMessage } from '@/common/types/client'
import { IUser } from '@/common/types'
import { user } from './user'
import { addMember, removeMember, userList } from './room'

const CHUNK_SIZE = 1 * 1024 * 1024 // 1MB

export const useAppStore = defineStore('app', () => {
  const session = useSessionStore()
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
  const isUpdateInfo = ref(false)

  let socket: Socket
  const initConnection = () => {
    debug('初始化')
    const serverUrl = localStorage.getItem('open-chat:server_url') as string
    const port = localStorage.getItem('open-chat:port') as string
    socket = io(serverUrl + ':' + port)
    console.log('socket', socket);

    // 建立连接
    socket.on('connect', () => {
      console.log('客户端连接成功，sokcetId:', socket.id);
      isOnline.value = true
      user.socketId = socket.id as string

      // 连接成功后发送加入房间申请
      socket.emit(Event.JoinRoom, user)
    })
    // 断开连接
    socket.on('disconnect', () => {
      console.log('client disconnect');
      isOnline.value = false
    })
    socket.on('error', (error) => {
      console.log(error);
      debug({ msg: 'socket client error' })
    })

    socket.on(Event.NewMember, (newMember: IUser) => {
      console.log(`Event.NewMember`, newMember);
      contentList.value.push({
        type: Message.Notify,
        data: `${newMember.name}进入房间`
      })
      addMember(newMember)
      // usersMap.value.set(newMember.id, newMember)
    })

    socket.on(Event.MembersList, (members: IUser[]) => {
      console.log('Event.MembersList', members);
      userList.push(...members)
    })

    socket.on(Event.MemberLeave, (member: IUser) => {
      console.log('Event.MemberLeave', member);
      removeMember(member)
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
  const sendMessage = (message: ITextMessage) => {
    socket.emit(Event.TextMessage, message.data)
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
    isUpdateInfo,
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
