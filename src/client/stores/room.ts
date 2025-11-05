import { reactive } from "vue";
import { debug } from "../utils";
import { IUser } from "@/common/types";

// 房间里的人
export const userList = reactive<IUser[]>([])

export const addUser = (user: IUser) => {
  console.log(`addUser`, user);
  userList.push(user)
}

export const removeUser = (user: IUser) => {
  console.log(`removeUser`, user);
  const index = userList.indexOf(user)
  if (index !== -1) {
    userList.splice(index, 1)
  }
}