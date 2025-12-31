import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    list: [], // 购物车列表 [{ goodsId, name, price, imgUrl, stock, quantity }]
  }),
  getters: {
    // 总数量
    totalQuantity: (state) => state.list.reduce((sum, item) => sum + item.quantity, 0),
    // 总金额
    totalAmount: (state) => {
      return state.list.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    },
    // 是否为空
    isEmpty: (state) => state.list.length === 0
  },
  actions: {
    // 添加商品到购物车
    addGoods(goods) {
      const existItem = this.list.find(item => item.goodsId === goods.goodsId)
      if (existItem) {
        // 已存在，数量+1（不超过库存）
        if (existItem.quantity < goods.stock) {
          existItem.quantity += 1
        } else {
          uni.showToast({ title: '库存不足', icon: 'none' })
        }
      } else {
        // 不存在，新增
        this.list.push({ ...goods, quantity: 1 })
      }
    },
    // 减少商品数量
    reduceGoods(goodsId) {
      const existItem = this.list.find(item => item.goodsId === goodsId)
      if (existItem) {
        if (existItem.quantity > 1) {
          existItem.quantity -= 1
        } else {
          // 数量为1，删除
          this.list = this.list.filter(item => item.goodsId !== goodsId)
        }
      }
    },
    // 删除商品
    deleteGoods(goodsId) {
      this.list = this.list.filter(item => item.goodsId !== goodsId)
    },
    // 清空购物车
    clearCart() {
      this.list = []
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