import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'
export interface ResponseType<P = {}> {
  code: number;
  msg: string;
  data: P;
}
export interface UserProps {
  isLogin: boolean;
  nickName?: string;
  _id?: string;
  column?: string;
  email?: string;
  avatar?: ImageProps;
  description?: string;
}
export interface ImageProps {
  _id?: string;
  url?: string;
  createdAt?: string;
  fitUrl?: string;
}
export interface ColumnProps {
  _id: string;
  title: string;
  avatar?: ImageProps;
  description: string;
}
export interface PostProps {
  _id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: ImageProps | string;
  createdAt?: string;
  column: string;
  author?: string | UserProps;
}
export interface GlobalErrorProps {
  status: boolean;
  message?: string;
}
export interface GlobalDataProps {
  token: string;
  error: GlobalErrorProps;
  loading: boolean;
  columns: ColumnProps[];
  posts: PostProps[];
  user: UserProps;
}
//统一的异步请求封装           请求的url        要调用的mutations方法  commit方法    其他配置
const asyncAndCommit = async(url: string, mutationName: string, commit: Commit, config: AxiosRequestConfig = { method: 'get' }) => {
  const { data } = await axios(url, config)
  commit(mutationName, data)
  return data
}

const store = createStore<GlobalDataProps>({
  state: {
    token: localStorage.getItem('token') || '',
    error: { status: false },
    loading: false,
    columns: [],//全部专栏/单个专栏
    posts: [],//我的文章/单个文章
    user: { isLogin: false }
  },
  mutations: {
    //新建文章
    createPost(state, newPost) {
      state.posts.push(newPost)
    },
    //全部专栏
    fetchColumns(state, rawData) {
      state.columns = rawData.data.list
    },
    //单个专栏
    fetchColumn(state, rawData) {
      state.columns = [rawData.data]
    },
    //我的全部文章
    fetchPosts(state, rawData) {
      state.posts = rawData.data.list
    },
    //找单个文章？
    fetchPost(state, rawData) {
      state.posts = [rawData.data]
    },
    //删除文章
    deletePost(state, { data }) {
      state.posts = state.posts.filter(post => post._id !== data._id)
    },
    //更新文章 data是返回的数据
    updatePost(state, { data }) {
      state.posts = state.posts.map(post => {
        //找到id 成功映射
        if (post._id === data._id) {
          return data
        } else {
          return post
        }
      })
    },
      //加载中
      setLoading(state, status) {
        state.loading = status
      },
    //错误
    setError(state, e: GlobalErrorProps) {
      state.error = e
    },
    //用户信息
    fetchCurrentUser(state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    //登录
    login(state, rawData) {
      const { token } = rawData.data
      state.token = token
      localStorage.setItem('token', token)
      //登录了就在每次请求都自带token  还有一种是在请求拦截器中配置
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    //退出登录
    logout(state) {
      state.token = ''
      state.user = { isLogin: false }
      localStorage.remove('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    //获取全部专栏
    fetchColumns({ commit }) {
      return asyncAndCommit('/columns', 'fetchColumns', commit)
    },
    //获取指定专栏的信息
    fetchColumn({ commit }, cid) {
      return asyncAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
    },
    //获取指定专栏的文章
    fetchPosts({ commit }, cid) {
      return asyncAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit)
    },
    //获取单个文章信息
    fetchPost({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'fetchPost', commit)
    },
    //更新单个文章信息
    updatePost({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, 'updatePost', commit, { method: 'patch', data: payload})
    },
    //获取当前用户信心
    fetchCurrentUser({ commit }) {
      return asyncAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    //登录
    login({ commit }, payload) {
      return asyncAndCommit('/user/login', 'login', commit, { method: 'post', data: payload })
    },
    //创建文章
    createPost({ commit }, payload) {
      return asyncAndCommit('/posts', 'createPost', commit, { method: 'post', data: payload })
    },
    //删除文章
    deletePost({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'deletePost', commit, { method: 'delete' })
    },
    //登录的时候调用的接口 登录后调用个人信息
    loginAndFetch({ dispatch }, loginData) {
      //先调登录
      return dispatch('login', loginData).then(() => {
        //个人信息
        return dispatch('fetchCurrentUser')
      })
    }
  },
  getters: {
    //根据id找专栏
    getColumnById: (state) => (id: string) => {
      return state.columns.find(c => c._id === id)
    },
    //根据id找专栏里的所有文章
    getPostsByCid: (state) => (cid: string) => {
      return state.posts.filter(post => post.column === cid)
    },
    getCurrentPost: (state) => (id: string) => {
      return state.posts.find(post => post._id === id)
    }
  }
})

export default store
