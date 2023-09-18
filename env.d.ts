/// <reference types="vite/client" />
interface IMessage {
  type: string
  data: any
  user: IUser
}
interface IMessage2 {
  type: string
  data: IMessage
}
interface IContent {
  content: striing
  isSelf: boolean
  type: string
  user: IUser
}
interface IUser {
  name: string
  id: number
  color: string
}
interface IFileSender {
  rawFile: File
  sender: string // 发送设备
  receiver: string // 接收设备
  transferredByte: number // 已传输字节数
}
interface ITranferInfo {
  name: string,
  size: number,
  sender: string // 发送设备
  receiver: string // 接收设备
  transferredByte: number // 已传输字节数
  buffers: ArrayBuffer[] // 数据块
}