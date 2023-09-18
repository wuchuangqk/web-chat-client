export const download = async (data: ITranferInfo) => {
  const link = window.URL.createObjectURL(
    new Blob(data.buffers, { type: "arrayBuffer" })
  );
  const a = document.createElement("a");
  a.href = link;
  a.download = data.name || "download";
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