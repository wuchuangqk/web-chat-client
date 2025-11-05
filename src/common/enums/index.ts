export enum Event {
  // 成员离开房间
  MemberLeave = 'MemberLeave',
  // 新成员加入房间
  NewMember = 'NewMember',
  // 房间内的成员列表
  MembersList = 'MembersList',

  // 文本消息
  TextMessage = 'TextMessage',
  // 图片消息
  ImageMessage = 'ImageMessage',

  // 加入房间
  JoinRoom = 'JoinRoom',
  // 注册
  Register = 'Register',

  // 更新用户信息
  UpdateInfo = 'UpdateInfo',
}

export enum Room {
  // 主聊天室
  Main = 'Main',
}

export enum Equipment {
  PC = 'PC',
  VirtualMachine = '虚拟机',
  Laptop = '笔记本',
  IPhone = 'iPhone',
  IPad = 'iPad',
  Android = '安卓',
}

export enum Message {
  Text = 'text',
  Image = 'image',
  Notify = 'notify',
}