export const download = async (data: {
  file: ArrayBuffer[];
  size: number;
  name?: string;
}) => {
  const link = window.URL.createObjectURL(
    new Blob(data.file, { type: "arrayBuffer" })
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