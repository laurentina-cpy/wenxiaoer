<template>
  <view class="evaluate-list-page">
    <!-- 标题栏 -->
    <view class="page-title">我的评价</view>

    <!-- 评价列表 -->
    <view class="evaluate-list">
      <!-- 评价卡片 -->
      <view class="evaluate-card" v-for="item in evaluateList" :key="item.id">
        <view class="order-header">
          <text class="shop-name">{{ item.shopName }}</text>
          <text class="evaluate-time">{{ item.createTime }}</text>
        </view>
        
        <!-- 商品信息 -->
        <view class="goods-item">
          <image :src="item.goodsImage || '/static/icons/default-goods.png'" class="goods-img" mode="aspectFill" />
          <view class="goods-text">
            <text class="goods-name">{{ item.goodsName }}</text>
            <text class="goods-price">¥{{ item.goodsPrice }}</text>
          </view>
        </view>

        <!-- 评分和评价内容 -->
        <view class="evaluate-content">
          <view class="star-group">
            <text class="star" :class="{ active: item.score >= 1 }">★</text>
            <text class="star" :class="{ active: item.score >= 2 }">★</text>
            <text class="star" :class="{ active: item.score >= 3 }">★</text>
            <text class="star" :class="{ active: item.score >= 4 }">★</text>
            <text class="star" :class="{ active: item.score >= 5 }">★</text>
          </view>
          <text class="evaluate-text">{{ item.content || '暂无评价内容' }}</text>
        </view>
      </view>

      <!-- 空评价提示 -->
      <view class="empty-evaluate" v-if="evaluateList.length === 0">
        <image src="/static/icons/empty-order.png" class="empty-img"></image>
        <text>暂无评价</text>
        <button class="go-evaluate-btn" @click="goToOrder">去评价订单</button>
      </view>
    </view>

    <!-- 全局底部导航条 -->
    <view class="bottom-tabbar">
      <view 
        class="tabbar-item" 
        :class="{ active: activeTab === 'shop' }"
        @click="switchTo('shop')"
      >
        <image 
          class="tabbar-icon" 
          :src="activeTab === 'shop' ? '/static/icons/tab-home-active.png' : '/static/icons/tab-home.png'"
        ></image>
        <text class="tabbar-text">小店</text>
      </view>
      <view 
        class="tabbar-item" 
        :class="{ active: activeTab === 'order' }"
        @click="switchTo('order')"
      >
        <image 
          class="tabbar-icon" 
          :src="activeTab === 'order' ? '/static/icons/tab-order-active.png' : '/static/icons/tab-order.png'"
        ></image>
        <text class="tabbar-text">订单</text>
      </view>
      <view 
        class="tabbar-item" 
        :class="{ active: activeTab === 'mine' }"
        @click="switchTo('mine')"
      >
        <image 
          class="tabbar-icon" 
          :src="activeTab === 'mine' ? '/static/icons/tab-mine-active.png' : '/static/icons/tab-mine.png'"
        ></image>
        <text class="tabbar-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 底部导航激活态
const activeTab = ref('mine')

// 评价列表模拟数据
const evaluateList = ref([
  {
    id: 1,
    shopName: '城院“城小二”求真1+2幢',
    createTime: '2025-11-08 13:00',
    goodsName: '红烧牛肉面',
    goodsPrice: '5.00',
    goodsImage: '/static/icons/noodle1.png',
    score: 5,
    content: '配送速度很快，面也很好吃！'
  }
])

// 页面加载
onMounted(() => {
  // 实际项目从接口获取评价列表
})

// 去订单页评价
const goToOrder = () => {
  uni.switchTab({ url: '/pages/order/order' })
}

// 底部导航跳转
const switchTo = (tab) => {
  activeTab.value = tab
  switch (tab) {
    case 'shop':
      uni.switchTab({ url: '/pages/index/index' })
      break
    case 'order':
      uni.switchTab({ url: '/pages/order/order' })
      break
    case 'mine':
      break
  }
}
</script>

<style scoped>
.evaluate-list-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx;
}

/* 标题栏 */
.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 24rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

/* 评价列表 */
.evaluate-list {
  padding: 20rpx;
}

.evaluate-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.shop-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.evaluate-time {
  font-size: 22rpx;
  color: #999;
}

/* 商品信息 */
.goods-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.goods-img {
  width: 60px;
  height: 60px;
  border-radius: 8rpx;
  margin-right: 10px;
}

.goods-text {
  flex: 1;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.goods-price {
  font-size: 28rpx;
  color: #FF7D00;
  font-weight: bold;
}

/* 评价内容 */
.evaluate-content {
  padding-top: 16rpx;
}

.star-group {
  display: flex;
  font-size: 32rpx;
  margin-bottom: 12rpx;
}

.star {
  color: #E5E5E5;
  margin-right: 8rpx;
}

.star.active {
  color: #FFD700;
}

.evaluate-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

/* 空评价提示 */
.empty-evaluate {
  text-align: center;
  padding: 100rpx 0;
}

.empty-img {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.5;
  margin-bottom: 20rpx;
}

.empty-evaluate text {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 40rpx;
}

.go-evaluate-btn {
  width: 180rpx;
  height: 60rpx;
  line-height: 60rpx;
  border: 2rpx solid #FF7D00;
  color: #FF7D00;
  background-color: #fff;
  border-radius: 30rpx;
  font-size: 24rpx;
}

/* 全局底部导航 */
.bottom-tabbar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  z-index: 99;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabbar-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 8rpx;
}

.tabbar-item.active .tabbar-text {
  color: #FF7D00;
}

.tabbar-text {
  font-size: 24rpx;
  color: #666;
}
</style>