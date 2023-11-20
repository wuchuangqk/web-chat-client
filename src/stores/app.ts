import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { download, readAsArrayBuffer, debug } from '@/utils'

let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const user = ref<IUser>({
    name: '',
    id: 0,
    type: '',
  }) // 当前用户
  const userList = shallowRef<IUser[]>([]) // 所有在线的用户
  const contentList = ref<IMessage2[]>([]) // 消息记录
  const activeTab = ref(0)
  let RTC: RTCPeerConnection | null = null
  let sendDataChannel: RTCDataChannel | null = null
  let receiveDataChannel: RTCDataChannel | null = null
  const dataChannelReady = ref(false)
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
  }
  
  let isReceiveAnswer = false
  // 初始化websocket链接
  const initConnection = (serverUrl: string) => {
    if (user.value.id) return
    ws = new WebSocket(`ws://${serverUrl}/chat?name=${user.value.name}&type=${user.value.type}`)
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
        debug({ user: user.value.id, msg: 'receiveOffer' })
        connectRTC()
        createAnswer(data)
        break
      case 'receiveAnswer':
        if (isReceiveAnswer) return
        isReceiveAnswer = true
        RTC!.setRemoteDescription(JSON.parse(data.description));
        break
    }
  }
  // 发送文本消息
  const sendMessage = (data: IMessage2) => {
    ws.send(JSON.stringify(data))
  }
  const sendBlobMessage = (data: ArrayBuffer) => {
    ws.send(data)
  }
  const connectRTC = () => {
    RTC = new RTCPeerConnection();
    RTC.addEventListener("datachannel", (event: RTCDataChannelEvent) => {
      console.log('datachannel event: ', event);
      receiveDataChannel = event.channel;
      dataChannelReady.value = true
      receiveDataChannel.onmessage = (e) => {
        console.log('receiveDataChannel.onmessage:', e.data);
        receiveFile(e.data);
      };
    });
    sendDataChannel = RTC.createDataChannel("sendDataChannel");
  };
  const createOffer = async (id: number) => {
    // 这个事件会触发多次
    RTC!.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
      console.log('onicecandidate createOffer:', event);

      if (event.candidate !== null) {
        const description = JSON.stringify(RTC!.localDescription);
        if (description) {
          sendMessage({
            type: 'offer',
            user: user.value,
            data: {
              receive: id,
              description
            }
          })
        }
      }
    };
    const offer = await RTC!.createOffer();
    await RTC!.setLocalDescription(offer);
  };
  const createAnswer = async (data: {
    sender: number;
    description: string;
  }) => {
    const offer = JSON.parse(data.description);
    RTC!.onicecandidate = async (event) => {
      console.log('onicecandidate createAnswer:', event);
      debug({ user: user.value.id, msg: 'answer', candidate: event.candidate })
      if (event.candidate !== null) {
        sendMessage({
          type: 'answer',
          user: user.value,
          data: {
            sender: data.sender,
            description: JSON.stringify(RTC!.localDescription)
          }
        })
      }
    };
    await RTC!.setRemoteDescription(offer);
    const answer = await RTC!.createAnswer();
    await RTC!.setLocalDescription(answer);
    debug({ user: user.value.id, msg: 'createAnswer', })
  };
  const receiveFile = (data: ArrayBuffer) => {
    if (typeof data === "string") {
      const { type, data: _data } = JSON.parse(data);
      switch (type) {
        case 'tranferInfoQueue':
          tranferInfoQueue.value = _data
          showTranfer.value = true
          break
        case 'queueIndex':
          queueIndex.value = _data
          break
      }
      return;
    }
    const tranferInfo = tranferInfoQueue.value[queueIndex.value]
    tranferInfo.buffers.push(data); // 数据块
    tranferInfo.transferredByte += data.byteLength; // 已接收的字节数

    if (tranferInfo.size === tranferInfo.transferredByte) {
      download(tranferInfo);
    }
  };
  const sendFile = async () => {
    if (!tranferFileQueue.value.length) return
    isShowSend.value = false
    sendDataChannel!.send(JSON.stringify({
      type: 'tranferInfoQueue',
      data: tranferInfoQueue.value
    }))

    for (let i = 0; i < tranferFileQueue.value.length; i++) {
      queueIndex.value = i
      sendDataChannel!.send(JSON.stringify({
        type: 'queueIndex',
        data: queueIndex.value
      }))
      const rawFile = tranferFileQueue.value[i]
      let offset = 0;
      let buffer: ArrayBuffer;
      const chunkSize = RTC!.sctp?.maxMessageSize || 65535;
      while (offset < rawFile.size) {
        const slice = rawFile.slice(offset, offset + chunkSize);
        buffer =
          typeof slice.arrayBuffer === "function"
            ? await slice.arrayBuffer()
            : await readAsArrayBuffer(slice);
        if (sendDataChannel!.bufferedAmount > chunkSize) {
          await new Promise((resolve) => {
            sendDataChannel!.onbufferedamountlow = resolve;
          });
        }
        sendDataChannel!.send(buffer);
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
    document.addEventListener('visibilitychange', () => {
      debug({
        visibilityState: document.visibilityState,
        ws: ws.readyState
      })
      if (document.visibilityState === 'visible') {

      }
    })
  }
  return {
    user,
    userList,
    contentList,
    activeTab,
    RTC,
    sendDataChannel,
    receiveDataChannel,
    dataChannelReady,
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
    connectRTC,
    createOffer,
    createAnswer,
    receiveFile,
    sendFile,
    resetQueue,
    listenPage,
  }
})
