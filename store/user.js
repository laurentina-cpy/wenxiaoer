import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    openid: '',        // 用户唯一标识
    nickname: '',      // 昵称
    avatar: '',        // 头像
    defaultAddress: null, // 默认地址
    token: ''          // 登录令牌
  }),
  getters: {
    // 是否登录
    isLogin: (state) => !!state.openid,
    // 地址文本
    addressText: (state) => {
      if (state.defaultAddress) {
        return `${state.defaultAddress.building}栋${state.defaultAddress.room}室`
      }
      return '请选择收货地址'
    }
  },
  actions: {
    // 设置用户信息
    setUserInfo(info) {
      this.openid = info.openid
      this.nickname = info.nickname
      this.avatar = info.avatar
      this.token = info.token
    },
    // 设置默认地址
    setDefaultAddress(address) {
      this.defaultAddress = address
    },
    // 退出登录
    logout() {
      this.$reset()
      uni.redirectTo({ url: '/pages/login/login' })
    }
  },
  // 持久化到本地存储
  persist: {
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
      removeItem: uni.removeStorageSync
    }
  }
})