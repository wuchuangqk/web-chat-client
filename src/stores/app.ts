import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { download, readAsArrayBuffer, debug, SendDataChannel } from '@/utils'
import { io, Socket } from 'socket.io-client'

let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const user = ref<IUser>({
    name: '',
    id: '',
    type: '',
  }) // 当前用户
  // const userList = shallowRef<IUser[]>([]) // 所有在线的用户
  const usersMap = ref<Map<string, IUser>>(new Map())
  const contentList = ref<IMessage2[]>([]) // 消息记录
  const activeTab = ref(0)
  const showTranfer = ref(false) // 是否接收到文件
  const tranferInfoQueue = ref<ITranferInfo[]>([])
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

  let isReceiveAnswer = false
  let socket: Socket
  const initConnection = () => {
    const serverUrl = localStorage.getItem('open-chat:server_url') as string
    socket = io(serverUrl)
    // 建立连接
    socket.on('connect', () => {
      console.log('connect', socket.id);
      user.value.id = socket.id as string
      // 将用户信息同步到后台
      socket.emit('bind-user-info', user.value)
    })
    // 断开连接
    socket.on('disconnect', () => {
      console.log('disconnect');
    })
    // 文本消息
    socket.on('broadcast:text-message', ({id, msg}) => {
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
  }
  const updateUserInfo = () => {
    socket.emit('bind-user-info', user.value)
  }
  const handleMessage = async (msg: MessageEvent) => {
    const { type, data, user: _user } = JSON.parse(msg.data)
    switch (type) {
      case 'users':
        userList.value = data
        break
      case 'id':
        user.value.id = data
        break
      case 'message':
        contentList.value.push({ type, data, user: _user })
        break
      case 'receiveOffer':
        debugHelper('接收端通过信令服务器收到offer和candidate,开始创建PeerConnection')
        createReceiveConnection(data.sender, data.description, data.candidate)
        break
      case 'receiveAnswer':
        debugHelper('发送端通过信令服务器收到answer和candidate')
        // debug({ user: user.value.name, id: user.value.id, msg: 'receiveAnswer' })
        if (isReceiveAnswer) return
        isReceiveAnswer = true
        await sendConnection.setRemoteDescription(data.description)
        sendConnection.addIceCandidate(data.candidate)
        break
    }
  }
  // 发送文本消息
  const sendMessage = (data: IMessage2) => {
    // ws.send(JSON.stringify(data))
    socket.emit('client:text-message', data.data)
  }
  const sendBlobMessage = (data: ArrayBuffer) => {
    ws.send(data)
  }

  const debugHelper = (msg: string) => {
    debug({ user: user.value.name, id: user.value.id, msg })
  }

  /* WebRTC */
  let sendConnection: RTCPeerConnection
  let receiveConnection: RTCPeerConnection
  let sendDataChannel: RTCDataChannel
  let receiveDataChannel: RTCDataChannel
  const isDataChannelReady = ref(false) // 数据通道是否成功建立
  // 发送端
  const createSendConnection = async (receiverId: number) => {
    sendConnection = new RTCPeerConnection()
    // 将候选人发送接收端,发生在setLocalDescription之后
    sendConnection.onicecandidate = (event) => {
      if (event.candidate === null) return
      debugHelper('发送端设置描述信息成功,开始向接收端端发送offer和candidate')
      sendOffer(receiverId, sendConnection.localDescription as RTCSessionDescription, event.candidate)
    }
    sendDataChannel = sendConnection.createDataChannel('sendDataChannel')
    handleSendDataChannel()
    const offer = await sendConnection.createOffer()
    await sendConnection.setLocalDescription(offer)
  }
  // 接收端
  const createReceiveConnection = async (senderId: number, description: RTCSessionDescription, candidate: RTCIceCandidate) => {
    receiveConnection = new RTCPeerConnection()
    // 收集候选人
    receiveConnection.onicecandidate = (event) => {
      if (event.candidate === null) return
      debug({ user: user.value.name, id: user.value.id, msg: 'sendAnswer' })
      debugHelper('接收端设置描述信息和候选人成功,开始向发送端发送answer和candidate')
      sendAnswer(senderId, receiveConnection.localDescription as RTCSessionDescription, event.candidate)
    }
    // 接收端无需创建datachannel，而是等待自动生成
    receiveConnection.ondatachannel = (event) => {
      receiveDataChannel = event.channel
      handleReceiveDataChannel()
    }
    try {
      await receiveConnection.setRemoteDescription(description)
      await receiveConnection.addIceCandidate(candidate)
      const answer = await receiveConnection.createAnswer()
      await receiveConnection.setLocalDescription(answer)
    } catch (error) {
      debug({ user: user.value.name, msg: '接收端设置描述信息时出错', error })
    }
  }
  // 向接收端发送description
  const sendOffer = (receiverId: number, description: RTCSessionDescription, candidate: RTCIceCandidate) => {
    sendMessage({
      type: 'offer',
      user: user.value,
      data: {
        receive: receiverId,
        description,
        candidate,
      }
    })
  }
  // 向发送端回应description
  const sendAnswer = (senderId: number, description: RTCSessionDescription, candidate: RTCIceCandidate) => {
    sendMessage({
      type: 'answer',
      user: user.value,
      data: {
        sender: senderId,
        description,
        candidate,
      }
    })
  }
  const handleSendDataChannel = () => {
    sendDataChannel.onopen = () => {
      isDataChannelReady.value = true
      debugHelper('发送端数据通道已成功开启, isDataChannelReady:true')
    }
    sendDataChannel.onmessage = handleSendChannelMessage
    sendDataChannel.onclose = () => {
      debugHelper('发送端数据通道已关闭')
    }
    sendDataChannel.onerror = () => {
      debugHelper('发送端数据通道出现错误')
    }
  }
  const handleReceiveDataChannel = () => {
    receiveDataChannel.onopen = () => {
      debugHelper('接收端数据通道已成功打开')
    }
    receiveDataChannel.onmessage = handleReceiveChannelMessage
    receiveDataChannel.onclose = () => {
      debugHelper('接收端数据通道已关闭')
    }
    receiveDataChannel.onerror = () => {
      debugHelper('接收端数据通道出现错误')
    }
  }
  const handleSendChannelMessage = (event: MessageEvent) => {
    const { data } = event
    const handleNormalMessage = ({ type, data }: { type: string, data: any }) => {
      switch (type) {
        case 'pong':
          console.log('ping pong!');
          break
      }
    }
    const handleBinaryMessage = (data: ArrayBuffer) => {

    }
    console.log(typeof data, data);

    if (typeof data === 'string') {
      debugHelper(`发送端数据通道接收到字符串类型消息:${data}`)
      handleNormalMessage(JSON.parse(data))
    } else if (typeof data === 'object') {
      handleBinaryMessage(data)
    }
  }
  const handleReceiveChannelMessage = (event: MessageEvent) => {
    const { data } = event
    const handleNormalMessage = ({ type, data }: { type: string, data: any }) => {
      switch (type) {
        case 'ping':
          receiveDataChannel.send(JSON.stringify({ type: 'pong' }))
          break
        case 'tranferInfoQueue':
          tranferInfoQueue.value = data
          showTranfer.value = true
          break
        case 'queueIndex':
          queueIndex.value = data
          break
      }
    }
    const handleBinaryMessage = (data: ArrayBuffer) => {
      const tranferInfo = tranferInfoQueue.value[queueIndex.value]
      tranferInfo.buffers.push(data); // 数据块
      tranferInfo.transferredByte += data.byteLength; // 已接收的字节数

      if (tranferInfo.size === tranferInfo.transferredByte) {
        download(tranferInfo);
      }
    }

    if (typeof data === 'string') {
      debugHelper(`接受端数据通道接收到字符串类型消息:${data}`)
      handleNormalMessage(JSON.parse(data))
    } else if (typeof data === 'object') {
      handleBinaryMessage(data)
    }
  }

  const sendFile = async () => {
    if (!tranferFileQueue.value.length) return
    isShowSend.value = false
    sendDataChannel.send(JSON.stringify({
      type: 'tranferInfoQueue',
      data: tranferInfoQueue.value
    }))

    for (let i = 0; i < tranferFileQueue.value.length; i++) {
      queueIndex.value = i
      sendDataChannel.send(JSON.stringify({
        type: 'queueIndex',
        data: queueIndex.value
      }))
      const rawFile = tranferFileQueue.value[i]
      let offset = 0;
      let buffer: ArrayBuffer;
      const chunkSize = sendConnection.sctp?.maxMessageSize || 65535;
      while (offset < rawFile.size) {
        const slice = rawFile.slice(offset, offset + chunkSize);
        buffer =
          typeof slice.arrayBuffer === "function"
            ? await slice.arrayBuffer()
            : await readAsArrayBuffer(slice);
        if (sendDataChannel.bufferedAmount > chunkSize) {
          await new Promise((resolve) => {
            sendDataChannel!.onbufferedamountlow = resolve;
          });
        }
        sendDataChannel.send(buffer);
        offset += buffer.byteLength;
        tranferInfoQueue.value[i].transferredByte = offset
      }
    }
  };
  const resetQueue = () => {
    tranferInfoQueue.value.length = 0
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
    isDataChannelReady,
    showTranfer,
    isShowSend,
    showRegister,
    typeIconMap,
    tranferInfoQueue,
    tranferFileQueue,
    queueIndex,
    initConnection,
    sendMessage,
    sendBlobMessage,
    sendFile,
    resetQueue,
    listenPage,
    sendOffer,
    createSendConnection,
    updateUserInfo,
  }
})
