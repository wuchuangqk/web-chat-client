class JSFile {
  rawFile: any; // 原始文件对象
  name: any;
  size: number; // 单位KB
  lastModifiedDate: string;
  type: string; // 文件后缀（不带.）
  constructor(file: File) {
    this.rawFile = file
    this.name = file.name
    this.size = file.size / 1024
    this.lastModifiedDate = new Date(file.lastModified).toLocaleString()
    this.type = ''
    if (file.name.lastIndexOf('.') !== -1) {
      this.type = file.name.substring(file.name.lastIndexOf('.') + 1)
    }
  }
}

export default JSFile