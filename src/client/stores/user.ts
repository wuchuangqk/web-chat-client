import { Equipment } from "@/common/enums";
import { IUser } from "@/common/types";
import { reactive } from "vue";

const readCache = () => {
  const value = localStorage.getItem('open-chat:user_info')
  if (value) {
    return JSON.parse(value)
  }

  return {
    name: '',
    equipment: Equipment.PC,
    socketId: '',
  }
}

export const user = reactive<IUser>(readCache())

export const updateUser = ({ name, equipment }: { name: string, equipment: Equipment }) => {
  user.name = name
  user.equipment = equipment
  localStorage.setItem('open-chat:user_info', JSON.stringify(user))
}