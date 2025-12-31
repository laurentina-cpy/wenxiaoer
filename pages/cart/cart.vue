<template>
  <view class="cart-container">
    <!-- 空购物车 -->
    <view class="empty-cart" v-if="cartStore.isEmpty">
      <image src="/static/icons/empty-cart.png" class="empty-img" />
      <text class="empty-text">购物车空空如也~</text>
      <button class="go-shopping-btn" @click="goShopping">去逛逛</button>
    </view>

    <!-- 购物车列表 -->
    <scroll-view class="cart-list" scroll-y v-else>
      <view class="cart-item" v-for="item in cartStore.list" :key="item.goodsId">
        <image :src="item.imgUrl" class="item-img" mode="aspectFill" />
        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-price">¥{{ item.price }}</text>
          <view class="item-ctrl">
            <button class="ctrl-btn minus" @click="reduce(item.goodsId)">-</button>
            <text class="ctrl-num">{{ item.quantity }}</text>
            <button class="ctrl-btn plus" @click="add(item)">+</button>
            <button class="delete-btn" @click="deleteItem(item.goodsId)">删除</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="!cartStore.isEmpty">
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ cartStore.totalAmount }}</text>
      </view>
      <button class="checkout-btn" @click="toCheckout">结算</button>
    </view>
  </view>
</template>

<script setup>
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'

const cartStore = useCartStore()
const userStore = useUserStore()

// 增加数量
const add = (item) => {
  cartStore.addGoods(item)
}

// 减少数量
const reduce = (goodsId) => {
  cartStore.reduceGoods(goodsId)
}

// 删除商品
const deleteItem = (goodsId) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.deleteGoods(goodsId)
      }
    }
  })
}

// 去首页
const goShopping = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

// 去结算
const toCheckout = () => {
  if (!userStore.defaultAddress) {
    uni.showToast({ title: '请先选择收货地址', icon: 'none' })
    uni.navigateTo({ url: '/pages/address/address' })
    return
  }
  uni.navigateTo({ url: '/pages/checkout/checkout' })
}
</script>

<style scoped>
.cart-container {
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 空购物车 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.empty-img {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 24px;
}

.go-shopping-btn {
  width: 120px;
  height: 40px;
  background: #FF7D00;
  color: #FFFFFF;
  border-radius: 20px;
  font-size: 14px;
}

/* 购物车列表 */
.cart-list {
  height: calc(100vh - 60px);
  padding: 10px;
}

.cart-item {
  display: flex;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.item-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 10px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 15px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 16px;
  color: #FF7D00;
  font-weight: bold;
}

.item-ctrl {
  display: flex;
  align-items: center;
}

.ctrl-btn {
  width: 28px;
  height: 28px;
  line-height: 28px;
  padding: 0;
  margin: 0;
  font-size: 18px;
  border-radius: 50%;
  background: #F5F5F5;
  color: #333;
}

.ctrl-num {
  margin: 0 10px;
  font-size: 14px;
  width: 24px;
  text-align: center;
}

.delete-btn {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
  background: transparent;
  border: none;
}

/* 底部结算栏 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background: #FFFFFF;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.total-info {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 18px;
  color: #FF7D00;
  font-weight: bold;
  margin-left: 4px;
}

.checkout-btn {
  width: 120px;
  height: 40px;
  background: #FF7D00;
  color: #FFFFFF;
  border-radius: 20px;
  font-size: 15px;
}
</style>