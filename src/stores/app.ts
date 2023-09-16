import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { download, readAsArrayBuffer } from '@/utils'

let ws: WebSocket
export const useAppStore = defineStore('app', () => {
  const user = shallowRef<IUser>({} as IUser) // 当前用户
  const userList = shallowRef<IUser[]>([]) // 所有在线的用户
  const contentList = ref<IMessage[]>([]) // 消息记录
  const activeTab = ref(0)
  let RTC: RTCPeerConnection | null = null
  let sendDataChannel: RTCDataChannel | null = null
  let receiveDataChannel: RTCDataChannel | null = null
  const dataChannelReady = ref(false)
  // 初始化websocket链接
  const initConnection = () => {
    ws = new WebSocket('ws://192.168.0.104:1060/chat')
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
    if (typeof msg.data === 'object') {
      arrayBufferMessage(msg)
    } else if (typeof msg.data === 'string') {
      textMessage(msg)
    }
  }
  const textMessage = (msg: MessageEvent) => {
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
      case 'receiveOffer':
        connectRTC()
        createAnswer(data)
        break
      case 'receiveAnswer':
        RTC!.setRemoteDescription(JSON.parse(data.description));
        break
    }
  }
  // let buffers = []
  const arrayBufferMessage = (msg: MessageEvent) => {
    download(msg.data)
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
        console.log('收到消息', e.data);
        
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
  let receivedFile: {
    file: ArrayBuffer[];
    size: number;
    receivedSize: number;
    name?: string;
  } = {
    file: [],
    size: 0,
    receivedSize: 0,
  };
  const receiveFile = (data: ArrayBuffer) => {
    if (typeof data === "string") {
      const fileInfo = JSON.parse(data);
      receivedFile.size = fileInfo.size;
      receivedFile.name = fileInfo.name;
      // direction.value = "target";
      // visible.value.transmit = true;
      // progress.value = 0;
      return;
    }
    receivedFile.file.push(data); // 数据块
    receivedFile.receivedSize += data.byteLength; // 已接收的字节数
    // progress.value = parseInt(
    //   (receivedFile.receivedSize / receivedFile.size) * 100 + ""
    // );

    if (receivedFile.size === receivedFile.receivedSize) {
      download(receivedFile);
      // progress.value = 100;
      // visible.value.transmit = false;
      receivedFile = {
        file: [],
        size: 0,
        receivedSize: 0,
      };
    }
  };
  const sendFile = async (selectedFile: File) => {
    sendDataChannel!.send(
      JSON.stringify({
        name: selectedFile.name,
        size: selectedFile.size,
      })
    );
  
    let offset = 0;
    let buffer: ArrayBuffer;
    const chunkSize = RTC!.sctp?.maxMessageSize || 65535;
    while (offset < selectedFile.size) {
      const slice = selectedFile.slice(offset, offset + chunkSize);
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
      // progress.value = parseInt((offset / selectedFile.size) * 100 + "");
      offset += buffer.byteLength;
    }
    // progress.value = 100;
    // visible.value.transmit = false;
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
