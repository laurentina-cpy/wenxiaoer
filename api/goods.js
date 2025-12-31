import { request } from './index'

// 获取商品列表
export const getGoodsList = () => {
  return request({
    url: '/api/goods/list',
    method: 'GET'
  })
}

// 获取商品分类
export const getGoodsCategories = () => {
  return request({
    url: '/api/goods/categories',
    method: 'GET'
  })
}

// 获取商品详情
export const getGoodsDetail = (goodsId) => {
  return request({
    url: `/api/goods/detail/${goodsId}`,
    method: 'GET'
  })
}