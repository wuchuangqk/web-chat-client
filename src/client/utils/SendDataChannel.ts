import { useAppStore } from '@/stores/app'
export class SendDataChannel {
  peerConnection: RTCPeerConnection
  dataChannel: RTCDataChannel // 数据通道
  targetId: number
  constructor(targetId: number) {
    this.targetId = targetId
    this.peerConnection = new RTCPeerConnection()
    // 收集候选人
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate === null) return
      this.peerConnection.addIceCandidate(event.candidate)
    }
    this.dataChannel = this.peerConnection.createDataChannel('dataChannel')
    this.dataChannel.onopen = () => {
      console.log('open');
    }
    this.dataChannel.onclose = () => {
      console.log('onclose');
    }
    this.dataChannel.onmessage = (event) => {
      console.log('onmessage', event.data, event.source, event.origin);
    }
    this.dataChannel.onerror = () => {
      console.log('onerror');
    }
    this.peerConnection.createOffer()
      .then(offer => this.peerConnection.setLocalDescription(offer))
      .then(() => {
        // 通过信令服务器传递sdp
        const store = useAppStore()
        store.sendOffer(targetId, this.peerConnection.localDescription as RTCSessionDescription)
      }).catch(err => console.log(err))
  }

  disconnect() {
    // this.peerConnection.dis
  }
}