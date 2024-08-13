/// <reference types="vite/client" />
interface IMessage2 {
  type: string
  data: any
  // user: IUser
  userId: string
}
interface IContent {
  content: striing
  isSelf: boolean
  type: string
  user: IUser
}
interface IUser {
  name: string
  id: string
  type: string
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
}

interface ITranferMeta {
  sender: string
  receiver: string
  queue: ITranferQueue[]
}