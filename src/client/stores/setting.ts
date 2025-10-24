import { defineStore } from "pinia";
import { ref } from "vue";

let localData: any = localStorage.getItem('open-chat:setting')
if (localData) {
  localData = JSON.parse(localData)
}

export const useSettingStore = defineStore('setting', () => {
  
  const autoAccept = ref(localData?.autoAccept ?? true) // 是否自动接收文件

  const save = () => {
    localStorage.setItem('open-chat:setting', JSON.stringify({
      autoAccept: autoAccept.value,
    }))
  }

  return {
    autoAccept,
    save,
  }
})