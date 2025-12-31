// 基础请求封装
import { TokenManager } from '../utils/token';

export const request = (options) => {
  // 基础配置
  const baseUrl = 'http://localhost:3000' // 替换为你的后端接口地址

  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        // 使用与后端一致的Bearer Token格式
        'Authorization': `Bearer ${TokenManager.getToken()}`
      },
      success: (res) => {
        // 统一错误处理
        if (res.statusCode !== 200) {
          uni.showToast({ title: '请求失败', icon: 'none' })
          reject(res)
          return
        }
        if (res.data.code !== 200) {
          uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(res.data)
          return
        }
        resolve(res.data)
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}