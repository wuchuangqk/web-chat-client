import { Equipment } from "@/common/enums";
import { IUser } from "@/common/types";
import { reactive } from "vue";

const readCache = () => {
  const value = localStorage.getItem('open-chat:user_info')
  if (value) {
    return JSON.parse(value)
  }
  
  return {
    id: '',
    name: '',
    equipment: Equipment.PC,
    socketId: '',
  }
}

export const user = reactive<IUser>(readCache())

export const updateUser = (_user: IUser) => {
  user.name = _user.name
  user.equipment = _user.equipment
}