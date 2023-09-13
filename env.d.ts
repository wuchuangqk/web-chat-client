/// <reference types="vite/client" />
interface IMessage {
  type: string
  data: any
}
interface IContent {
  content: striing
  isSelf: boolean
}