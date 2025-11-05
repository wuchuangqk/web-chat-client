import { reactive } from "vue";
import { debug } from "../utils";
import { IUser } from "@/common/types";

// 房间里的人
export const userList = reactive<IUser[]>([])

export const addMember = (user: IUser) => {
  userList.push(user)
}

export const removeMember = (user: IUser) => {
  const index = userList.findIndex(val => val.socketId === user.socketId)
  if (index !== -1) {
    userList.splice(index, 1)
  }
}