import { onUnmounted } from 'vue'

function useDOMCreate(nodeId: string) {
  const node = document.createElement('div')
  node.id = nodeId
  document.body.appendChild(node)
  //我的理解是到时候方法调用了 这个onUnmounted也挂到message组件里了
  onUnmounted(() => {
    document.body.removeChild(node)
  })
}

export default useDOMCreate
