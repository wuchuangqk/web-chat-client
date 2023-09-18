import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { download, readAsArrayBuffer } from '@/utils'

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
  const tranferInfo = ref<ITranferInfo>({
    name: '',
    size: 0,
    sender: {
      id: 0,
      name: '',
      type: '',
    },
    receiver: {
      id: 0,
      name: '',
      type: '',
    },
    transferredByte: 0,
    buffers: [],
    time: ''
  })
  const tranferFile = ref<File>()
  const isShowSend = ref(false)
  const showRegister = ref(false)
  const typeIconMap: { [key: string]: string } = {
    'PC': 'pc',
    '虚拟机': 'vm',
    '笔记本': 'laptop',
    'iPhone': 'iPhone',
    'iPad': 'iPad',
  }
  // 初始化websocket链接
  const initConnection = () => {
    ws = new WebSocket(`ws://192.168.3.20:1060/chat?name=${user.value.name}&type=${user.value.type}`)
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
        connectRTC()
        createAnswer(data)
        break
      case 'receiveAnswer':
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
      console.log('datachannel: receive data');
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
      if (event.candidate) {
        const description = JSON.stringify(RTC!.localDescription);
        if (description) {
          sendMessage({
            type: 'offer',
            user: user.value,
            data: {
              user: user.value,
              type: '',
              data: {
                receive: id,
                description
              }
            }
          })
        }
      } else {
        console.log("候选人收集完成！");
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
      if (event.candidate) {
        sendMessage({
          type: 'answer',
          user: user.value,
          data: {
            type: '',
            user: user.value,
            data: {
              sender: data.sender,
              description: JSON.stringify(RTC!.localDescription)
            }
          }
        })
      }
    };
    await RTC!.setRemoteDescription(offer);
    const answer = await RTC!.createAnswer();
    await RTC!.setLocalDescription(answer);
  };
  const receiveFile = (data: ArrayBuffer) => {
    if (typeof data === "string") {
      const fileInfo: ITranferInfo = JSON.parse(data);
      tranferInfo.value.size = fileInfo.size;
      tranferInfo.value.name = fileInfo.name;
      tranferInfo.value.sender = fileInfo.sender
      tranferInfo.value.receiver = fileInfo.receiver
      tranferInfo.value.transferredByte = 0
      tranferInfo.value.buffers.length = 0
      tranferInfo.value.time = fileInfo.time
      showTranfer.value = true
      return;
    }
    tranferInfo.value.buffers.push(data); // 数据块
    tranferInfo.value.transferredByte += data.byteLength; // 已接收的字节数

    if (tranferInfo.value.size === tranferInfo.value.transferredByte) {
      download(tranferInfo.value);
    }
  };
  const sendFile = async () => {
    if (!tranferFile.value) return
    isShowSend.value = false
    const now = new Date()
    tranferInfo.value.time = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    sendDataChannel!.send(JSON.stringify({
      name: tranferFile.value.name,
      size: tranferFile.value.size,
      sender: tranferInfo.value.sender,
      receiver: tranferInfo.value.receiver,
      time: tranferInfo.value.time
    }));

    let offset = 0;
    let buffer: ArrayBuffer;
    const chunkSize = RTC!.sctp?.maxMessageSize || 65535;
    const rawFile = tranferFile.value
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
      tranferInfo.value.transferredByte = offset
    }
  };
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
    tranferFile,
    tranferInfo,
    isShowSend,
    showRegister,
    typeIconMap,
    initConnection,
    sendMessage,
    sendBlobMessage,
    connectRTC,
    createOffer,
    createAnswer,
    receiveFile,
    sendFile,
  }
})
