import { reactive } from "vue";
import { debug } from "../utils";
import { IUser } from "@/common/types";

// 房间里的人
export const memberList = reactive<IUser[]>([])

export const addMember = (user: IUser) => {
  memberList.push(user)
}

export const removeMember = (user: IUser) => {
  const index = memberList.findIndex(val => val.socketId === user.socketId)
  if (index !== -1) {
    memberList.splice(index, 1)
  }
}