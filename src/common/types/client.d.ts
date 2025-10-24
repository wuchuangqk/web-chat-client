export interface IImage {
  url: string
}
export interface INotifyMessage {
  type: string
  data: string
}
export interface ITextMessage {
  type: string
  data: string
  userId: string
}
export interface IImageMessage {
  type: string
  data: IImage
  userId: string
}
export type IContent = ITextMessage | IImageMessage | INotifyMessage