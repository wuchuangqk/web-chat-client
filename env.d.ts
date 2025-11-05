/// <reference types="vite/client" />
interface IMessage2 {
  type: string
  data: any
  // user: IUser
  userId: string
}
interface IContent {
  content: string
  isSelf: boolean
  type: string
  user: any
}
interface IFileSender {
  rawFile: File
  sender: string // 发送设备
  receiver: string // 接收设备
  transferredByte: number // 已传输字节数
}
interface ITranferQueue {
  name: string,
  size: number,
  transferredByte: number // 已传输字节数
  chunks: ArrayBuffer[] // 数据块
  time: string
  progress: number
  isDone: boolean
  startTime: Date | null
  useTime: number | null
}

interface ITranferMeta {
  sender: string
  receiver: string
  queue: ITranferQueue[]
}