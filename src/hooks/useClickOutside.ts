import { ref, onMounted, onUnmounted, Ref } from 'vue'
//不应该仅仅把节点传过来  还要让它能在setup中产生变化 所以必须需要一个响应式ref对象 那ref对象的类型是什么呢 
//Ref是什么 大写的ref是指的是类型 null | HTMLElement
const useClickOutside = (elementRef: Ref<null | HTMLElement>) => {
  //要返回去的东西
  const isClickOutside = ref(false)
  const handler = (e: MouseEvent) => {
    if (elementRef.value) {
      //是否点击了内部dropdownRef.value.contains(e.target as HTMLElement)
      if (elementRef.value.contains(e.target as HTMLElement)) {
        isClickOutside.value = false
      } else {
        isClickOutside.value = true
      }
    }
  }
  onMounted(() => {
    document.addEventListener('click', handler)
  })
  onUnmounted(() => {
    document.removeEventListener('click', handler)
  })
  return isClickOutside
}

export default useClickOutside
