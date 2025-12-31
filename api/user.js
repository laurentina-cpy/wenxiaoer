import { request } from './index'

// 微信登录
export const wxLogin = (data) => {
  return request({
    url: '/api/user/wxLogin',
    method: 'POST',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/user/info',
    method: 'GET'
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/api/user/logout',
    method: 'POST'
  })
}