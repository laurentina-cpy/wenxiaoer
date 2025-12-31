<template>
  <view class="evaluate-container">
    <!-- 订单信息 -->
    <view class="order-info">
      <text class="order-title">订单评价</text>
      <text class="order-desc">订单号：{{ orderId }}</text>
    </view>

    <!-- 商品信息（模拟关联订单商品） -->
    <view class="goods-item">
      <image 
        :src="goodsImage || '/static/icons/default-goods.png'" 
        class="goods-img" 
        mode="aspectFill" 
      />
      <view class="goods-text">
        <text class="goods-name">{{ goodsName || '订单商品' }}</text>
        <text class="goods-price">¥{{ goodsPrice || '0.00' }}</text>
      </view>
    </view>

    <!-- 评分星级 -->
    <view class="score-section">
      <text class="score-title">配送体验评分</text>
      <view class="star-group">
        <text 
          class="star" 
          :class="{ active: score >= 1 }"
          @click="setScore(1)"
        >★</text>
        <text 
          class="star" 
          :class="{ active: score >= 2 }"
          @click="setScore(2)"
        >★</text>
        <text 
          class="star" 
          :class="{ active: score >= 3 }"
          @click="setScore(3)"
        >★</text>
        <text 
          class="star" 
          :class="{ active: score >= 4 }"
          @click="setScore(4)"
        >★</text>
        <text 
          class="star" 
          :class="{ active: score >= 5 }"
          @click="setScore(5)"
        >★</text>
      </view>
    </view>

    <!-- 评价输入 -->
    <view class="input-section">
      <text class="input-title">评价内容（选填）</text>
      <textarea 
        class="evaluate-input" 
        placeholder="请输入你的评价（如：配送速度快、商品新鲜）"
        v-model="evaluateText"
      ></textarea>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @click="submitEvaluate" :disabled="score === 0">
      提交评价
    </button>
  </view>
</template>

<script setup>
import { ref } from 'vue'; // 移除 onLoad 导入

// 接收订单参数
const orderId = ref('');
const goodsName = ref('');
const goodsPrice = ref('');
const goodsImage = ref('');

// 评分（默认0分）
const score = ref(0);
// 评价文本
const evaluateText = ref('');

// uni-app 页面生命周期 onLoad，无需导入，直接使用
onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId;
    // 根据订单ID模拟商品信息（实际项目对接接口）
    mockGoodsInfo(options.orderId);
  }
});

// 模拟根据订单ID获取商品信息
const mockGoodsInfo = (id) => {
  if (id == 1) {
    goodsName.value = '红烧牛肉面';
    goodsPrice.value = '5.00';
    goodsImage.value = '/static/icons/noodle1.png';
  } else if (id == 2) {
    goodsName.value = '香辣牛肉面 + 可乐';
    goodsPrice.value = '7.00';
    goodsImage.value = '/static/icons/noodle2.png';
  } else {
    goodsName.value = '订单商品';
    goodsPrice.value = '0.00';
  }
};

// 设置评分
const setScore = (num) => {
  score.value = num;
};

// 提交评价
const submitEvaluate = () => {
  if (score.value === 0) {
    uni.showToast({ title: '请先选择评分', icon: 'none' });
    return;
  }

  // 模拟提交评价接口
  uni.showLoading({ title: '提交中' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '评价提交成功', icon: 'success' });
    // 返回订单页
    uni.navigateBack();
  }, 1000);
};
</script>

<style scoped>
.evaluate-container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding: 10px;
  padding-bottom: 100rpx; /* 适配底部tabBar */
}

/* 订单信息 */
.order-info {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 16px;
  margin-bottom: 10px;
}

.order-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.order-desc {
  font-size: 24rpx;
  color: #999;
}

/* 商品信息 */
.goods-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 10px;
  margin-bottom: 10px;
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

/* 评分区域 */
.score-section {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 16px;
  margin-bottom: 10px;
}

.score-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.star-group {
  display: flex;
  font-size: 48rpx;
}

.star {
  color: #E5E5E5;
  margin-right: 16rpx;
}

.star.active {
  color: #FFD700;
}

/* 输入区域 */
.input-section {
  background: #FFFFFF;
  border-radius: 12rpx;
  padding: 16px;
  margin-bottom: 20px;
}

.input-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.evaluate-input {
  width: 100%;
  min-height: 200rpx;
  border: 1px solid #F5F5F5;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #FF7D00;
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.submit-btn[disabled] {
  background: #E5E5E5;
  color: #999;
}
</style>