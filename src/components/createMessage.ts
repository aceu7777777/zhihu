import { createApp } from 'vue'
import Message from './Message.vue'
export type MessageType = 'success' | 'error' | 'default'
//2000秒毁灭                                                固定参数
const createMessage = (message: string, type: MessageType, timeout = 2000) => {
  //构建细虚拟dom
  const messageInstance = createApp(Message, {
    //这参数可以用pros接住
    message,
    type
  })
  //创建个父元素然后把组件塞进去 呈现2000ms后销毁
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)
  messageInstance.mount(mountNode)
  setTimeout(() => {
    messageInstance.unmount(mountNode)
    document.body.removeChild(mountNode)
  }, timeout)
}

export default createMessage

