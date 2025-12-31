// 商品分类
export const GOODS_CATEGORY = [
  { id: '1', name: '零食小吃' },
  { id: '2', name: '饮料饮品' },
  { id: '3', name: '生活用品' },
  { id: '4', name: '学习用品' },
  { id: '5', name: '水果生鲜' }
]

// 订单状态
export const ORDER_STATUS = {
  0: '待支付',
  1: '已支付',
  2: '配送中',
  3: '已送达',
  4: '已完成',
  5: '已取消',
  6: '已退款'
}

// 支付超时时间（15分钟）
export const ORDER_PAY_TIMEOUT = 15 * 60 * 1000