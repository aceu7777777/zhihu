<template>
  <div class="file-upload">
    <div class="file-upload-container" @click.prevent="triggerUpload" v-bind="$attrs">
      <slot v-if="fileStatus === 'loading'" name="loading">
        <button class="btn btn-primary" disabled>正在上传...</button>
      </slot>
      <slot v-else-if="fileStatus === 'success'" name="uploaded" :uploadedData="uploadedData">
        <button class="btn btn-primary">上传成功</button>
      </slot>
      <slot v-else name="default">
        <button class="btn btn-primary">点击上传</button>
      </slot>
    </div>
    <input type="file" class="file-input d-none" ref="fileInput" @change="handleFileChange">
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue'
import axios from 'axios'
//几个状态 定义成一个类
type UploadStatus = 'ready' | 'loading' | 'success' | 'error'
//函数 结果为true和false 用于进一步规定文件的大小或者格式这些东西
type CheckFunction = (file: File) => boolean;
export default defineComponent({
  props: {
    //发请求的地址
    action: {
      type: String,
      required: true
    },
    //用于返回布尔值的方法 就是对要传的文件判断一下文件
    beforeUpload: {
      type: Function as PropType<CheckFunction>
    },
    //如果用户点击的是编辑 进来文章的时候 这个上传组件的状态得初始化是成功也就是选完了文件 这是精华之一
    uploaded: {
      type: Object
    }
  },
  inheritAttrs: false,
  //两个自定义事件来跟父组件对话
  emits: ['file-uploaded', 'file-uploaded-error'],
  setup(props, context) {
    //拿到input 一会点击按钮的时候自动触发它的点击事件 拿文件
    const fileInput = ref<null | HTMLInputElement>(null)
    //console.log(props.uploaded)
    //如果用户点击的是编辑 进来文章的时候 这个上传组件的状态得初始化是成功 这是精华之一
    const fileStatus = ref<UploadStatus>(props.uploaded ? 'success' : 'ready')
    //如果用户点击的是编辑 进来文章的时候 这个上传组件的状态得初始化是成功 这是精华之一
    const uploadedData = ref(props.uploaded)
    //检测传没穿upload 和upload的改变 防止进来没有图 这是精华之一  检测有没有它?
    watch(() => props.uploaded, (newValue) => {
      if (newValue) {
        fileStatus.value = 'success'
        //更新数据
        uploadedData.value = newValue
      }
    })
    //这是精华之一
    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    const handleFileChange = (e: Event) => {
      //拿到e就能拿到那个文件
      const currentTarget = e.target as HTMLInputElement
      if (currentTarget.files) {
        //拿到文件转为数组
        const files = Array.from(currentTarget.files)
        //这是精华之一
        //用传来的方法来判断是不是格式正确 符合规定 比方说在父组件中写一下这个方法 目标是检测一下她是不是图片格式
        //父组件中
        // const beforeUpload = (file:File) => {
        //   const isJPG = file.type === 'image/jpeg' //isjpg的结果是true或者flase
        //   if(!isJPG) {
        //     createMessage('上传图片只能是jpg格式！', 'error')
        //   }
        //   return isJPG
        // }
        if (props.beforeUpload) {
          const result = props.beforeUpload(files[0])//result是true或者flase
          if (!result) {
            return
          }
        }
          fileStatus.value = 'loading'
          const formData = new FormData()
          formData.append('file', files[0])
          axios.post(props.action, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        }).then(resp => {
          fileStatus.value = 'success'
          uploadedData.value = resp.data
          //那么后台做了什么是呢 就是把这个文件变成url给返回了
          //成功的时候 把图片链接传出去这是精华之一 可以在父组件弹出message  
          context.emit('file-uploaded', resp.data)
        }).catch((error) => {
          fileStatus.value = 'error'
          //错误i的时候
          context.emit('file-uploaded-error', { error })
        }).finally(() => {
          //最后的最后 重置到最新状态
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        })
      }
    }
    return {
      fileInput,
      triggerUpload,
      fileStatus,
      uploadedData,
      handleFileChange
    }
  }
})
</script>
