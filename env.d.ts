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