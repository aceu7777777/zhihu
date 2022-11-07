import { Namespaces } from '@vue/compiler-core'
import { ColumnProps, ImageProps, UserProps } from './store'
//得到图片的函数
export function generateFitUrl(data: ImageProps, width: number, height: number, format = ['m_pad']) {
  if (data && data.url) {
    const formatStr = format.reduce((prev, current) => {
      return current + ',' + prev
    }, '')
    data.fitUrl = data.url + `?x-oss-process=image/resize,${formatStr}h_${height},w_${width}`
  }
}

export function addColumnAvatar(data: ColumnProps | UserProps, width: number, height: number) {
  if (data.avatar) {
    generateFitUrl(data.avatar, width, height)
  } else {
    const parseCol = data as ColumnProps
    data.avatar = {
      fitUrl: require(parseCol.title ? '@/assets/column.jpg' : '@/assets/avatar.jpg')
    }
  }
}

//判断文件的格式和大小
interface CheckCondition {
  format?: string[];
  size?: number;
}
type ErrorType = 'size' | 'format' | null
//约束文件的函数
export function beforeUploadCheck(file: File, condition: CheckCondition) {
  const { format, size } = condition
  //？的作用是判断format存不存在 存在的话就继续判断合不合法  format.includes(file.type) 包含这个类型就是合法的
  //         三元运算符如果没有传来format就直接通过返回true     其中file.type是传过来的  
  const isValidFormat = format ? format.includes(file.type) : true
  const isValidSize = size ? (file.size / 1024 / 1024 < size) : true
  let error: ErrorType = null
  if (!isValidFormat) {
    error = 'format'
  }
  if (!isValidSize) {
    error = 'size'
  }
  return {
    passed: isValidFormat && isValidSize,//通过没通过验证? 两个都通过才算通过
    error//为什么没通过
  }
}

//先想想需求是什么 需求是我们传到这个函数里文件 和判断的条件的一个对象 这个对象里包含判断的size和format格式
//自然而然的想到定义错误类型 和 需要判断的标准的接口  
// interface CheckCondition {
//   format?:string[],
//   size?:number,
// }
// type Errortype = 'size' | 'format' | null
// export function fn(file:File, Check:CheckCondition){
//   //拿到属性 通过解构
//   const { format, size } = Check
//   //判断并返回 是哪里出错了 
//   //存在的话才判断 不然直接true 表示没有出错
//   const isFormatErr = format? format.includes(file.type) : true
//   //转为mb
//   const isSizeErr = size ? (file.size / 1024 / 1024 < size) : true
//   //给错误命名
//   let err:Errortype = null
//   if(!isFormatErr){
//     err = 'format'
//   }
//   if(!isSizeErr){
//     err = 'size'
//   }
//   return {
//     passed: isFormatErr && isSizeErr,//通过没通过验证? 两个都通过才算通过 没有通过就在那边提示
//     err//为什么没通过
//   }
// }



//帮助理解
interface TestProps {
  _id: string;
  name: string;
}
const testData: TestProps[] = [{ _id: '1', name: 'a' }, { _id: '2', name: 'b' }]
//测试数组转对象方法(哈希储存方式)  
//                      这个时候我们要确定arr的类型 自然而然的就想到了泛型
// 约束泛型 如果不用的话 if (current._id)会报错   T extends { _id?: string }约束这个泛型里可能有id
export const arrToObj = <T extends { _id?: string }>(arr: Array<T>) => {
  return arr.reduce((prev, current) => {
    if (current._id) {
      //current是{ _id: '1', name: 'a' }这样的每一项  是遍历
      prev[current._id] = current
    }
    return prev
    //一开始prev初始化的是一个空的{} 直接往里边prev[current._id]是不行的  我们使用断言成理想的格式
  }, {} as { [key: string]: T })
}
const result = arrToObj(testData)
console.log(result)

export const arrGetObj = <T extends { _id?: string }>(arr:Array<T>) => {
  //prev是{}空对象
  return arr.reduce((prev, current) => {
    if(current._id){//提示T上没有id 这时候泛型约束 首先T是数组 然后里面可能包含id
      //current是{ _id: '1', name: 'a' }这样的每一项  是遍历
      //prev[current._id]代表着给prev加了一个键名
      prev[current._id] = current //说在 prev找不到string 我们得处理第三个参数{}
    }
    //把新的每一项return出去
    return prev
  }, {} as { [key: string]: T })
} 









//对象转数组方法
//                      这个时候我们要确定obj的类型 自然而然的就想到了泛型
export const objToArr = <T>(obj: {[key: string]: T}) => {
  //keys后得到它索引的数组 然后将key映射成obj[key]
  return Object.keys(obj).map(key => obj[key])
}
//                key是可索引类型 [] 代表着方括号里是可变的类型  这里是string
const testData2: {[key: string]: TestProps} = {
  1: { _id: '1', name: 'a' },
  2: { _id: '2', name: 'b' }
}

const result2 = objToArr(testData2)
console.log(result2)
