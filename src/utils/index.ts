import MobileDetect from 'mobile-detect'
import VConsole from 'vconsole'

export * from './SendDataChannel'

export const download = async (file: ITranferQueue) => {
  const link = window.URL.createObjectURL(new Blob(file.chunks, { type: 'arrayBuffer' }));
  const a = document.createElement("a");
  a.href = link;
  a.download = file.name || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(link);
};

export const readAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent) => {
      resolve(reader.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(blob);
  })
}

export const fmtSize = (bytes: number = 0) => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let result;
  let unit = ''
  for (let i = 0; i < units.length; i++) {
    if (bytes < 1024) {
      result = bytes
      unit = units[i]
      break;
    } else {
      bytes /= 1024;
    }
  }
  return result?.toFixed(2) + unit;
}

export const debug = (data: any) => {
  if (import.meta.env.DEV) {
    console.log(data);
    // const serverUrl = localStorage.getItem('open-chat:server_url')
    // if (!serverUrl) return
    // fetch(`http://${serverUrl}/debug`, {
    //   method: 'POST',
    //   body: JSON.stringify(data || {}),
    //   headers: {
    //     'Content-Type': 'application/json;charset=utf-8'
    //   }
    // })
  }
}

const md = new MobileDetect(window.navigator.userAgent);
export const isMobile = md.mobile()

if (import.meta.env.DEV) {
  new VConsole()
}