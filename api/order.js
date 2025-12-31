import { request } from './index'

// 创建订单
export const createOrder = (data) => {
  return request({
    url: '/api/order/create',
    method: 'POST',
    data
  })
}

// 获取订单列表
export const getOrderList = (params) => {
  return request({
    url: '/api/order/list',
    method: 'GET',
    data: params
  })
}

// 获取订单详情
export const getOrderDetail = (orderId) => {
  return request({
    url: `/api/order/detail/${orderId}`,
    method: 'GET'
  })
}

// 取消订单
export const cancelOrder = (orderId) => {
  return request({
    url: `/api/order/cancel/${orderId}`,
    method: 'PATCH'
  })
}