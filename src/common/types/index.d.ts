import { Equipment } from "@/common/enums"

export interface IUser {
  name: string
  equipment: Equipment
  socketId: string
}