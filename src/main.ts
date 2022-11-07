import { createApp } from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'

import App from './App.vue'
axios.defaults.baseURL = 'http://apis.imooc.com/api/'
//请求拦截器 每次请求的时候会用
axios.interceptors.request.use(config => {
  //加载中
  store.commit('setLoading', true)
  store.commit('setError', { status: false, message: '' })
  // get 请求，添加到 url 中
  config.params = { ...config.params, icode: '487FE368A21D014C' }
  // 其他请求，添加到 body 中
  // 如果是上传文件，添加到 FormData 中
  if (config.data instanceof FormData) {
    config.data.append('icode', '487FE368A21D014C')
  } else {
    // 普通的 body 对象，添加到 data 中
    config.data = { ...config.data, icode: '487FE368A21D014C' }
  }
  return config
})
//响应拦截器
axios.interceptors.response.use(config => {
  setTimeout(() => {
    //1000后取消加载状态 对应上面的开始加载
    store.commit('setLoading', false)
  }, 1000)
  return config
}, e => {
  //捕获错误
  const { error } = e.response.data
  store.commit('setError', { status: true, message: error })
  store.commit('setLoading', false)
  return Promise.reject(e.response.data)
})
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
