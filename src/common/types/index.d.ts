import { Equipment } from "@/common/enums"

export interface IUser {
  id: string
  name: string
  equipment: Equipment
  socketId: string
}