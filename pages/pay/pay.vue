<template>
  <view class="pay-page">
    <!-- 页面标题 -->
    <view class="page-title">订单支付</view>

    <!-- 订单信息卡片 -->
    <view class="order-card">
      <text class="card-title">订单详情</text>
      <view class="order-item">
        <text class="item-label">订单编号</text>
        <text class="item-value">{{ orderInfo.orderId || '未知订单' }}</text>
      </view>
      <view class="order-item">
        <text class="item-label">下单时间</text>
        <text class="item-value">{{ orderInfo.createTime || new Date().toLocaleString() }}</text>
      </view>
      <view class="order-item">
        <text class="item-label">收货地址</text>
        <text class="item-value">{{ orderInfo.address?.name }} {{ orderInfo.address?.phone }}
          <text class="address-detail">{{ orderInfo.address?.province }}{{ orderInfo.address?.city }}{{ orderInfo.address?.district }}{{ orderInfo.address?.detail }}</text>
        </text>
      </view>
      <view class="order-item">
        <text class="item-label">商品总数</text>
        <text class="item-value">{{ getGoodsTotalCount() }}件</text>
      </view>
    </view>

    <!-- 支付金额 -->
    <view class="pay-amount">
      <text class="amount-label">实付金额</text>
      <text class="amount-value">¥{{ orderInfo.totalPrice || 0.00 }}</text>
    </view>

    <!-- 支付方式选择 -->
    <view class="pay-method-wrap">
      <text class="method-title">选择支付方式</text>
      <view class="method-item" @click="selectPayMethod('wechat')" :class="{ active: selectedMethod === 'wechat' }">
        <image class="method-icon" src="/static/icons/wechat-pay.png" mode="aspectFit"></image>
        <text class="method-name">微信支付</text>
        <image class="select-icon" src="/static/icons/select.png" mode="aspectFit" v-if="selectedMethod === 'wechat'"></image>
      </view>
      <view class="method-item" @click="selectPayMethod('alipay')" :class="{ active: selectedMethod === 'alipay' }">
        <image class="method-icon" src="/static/icons/alipay.png" mode="aspectFit"></image>
        <text class="method-name">支付宝支付</text>
        <image class="select-icon" src="/static/icons/select.png" mode="aspectFit" v-if="selectedMethod === 'alipay'"></image>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <button class="pay-btn" @click="handlePay" :disabled="!orderInfo.orderId">立即支付 ¥{{ orderInfo.totalPrice || 0.00 }}</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TokenManager } from '@/utils/token'
import { post } from '@/utils/request' // 引入封装的POST请求

// 响应式变量：订单信息（从checkout页传递）
const orderInfo = ref({})
// 响应式变量：选中的支付方式（默认微信支付）
const selectedMethod = ref('wechat')

// 页面挂载时接收订单参数
onMounted(() => {
  // 登录校验
  if (!TokenManager.isLogin()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return uni.navigateTo({ url: '/pages/login/login' })
  }

  // 获取当前页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  // 解析订单信息（URL编码后的JSON字符串）
  if (options.order) {
    try {
      orderInfo.value = JSON.parse(decodeURIComponent(options.order))
      console.log('接收的订单信息：', orderInfo.value)
    } catch (error) {
      console.error('解析订单信息失败：', error)
      uni.showToast({ title: '订单信息异常', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack() // 返回上一页
      }, 1500)
    }
  } else {
    uni.showToast({ title: '未获取到订单信息', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack() // 返回上一页
    }, 1500)
  }
})

// 计算商品总件数
const getGoodsTotalCount = () => {
  if (!orderInfo.value.goodsList || orderInfo.value.goodsList.length === 0) {
    return 0
  }
  return orderInfo.value.goodsList.reduce((total, item) => total + item.count, 0)
}

// 选择支付方式
const selectPayMethod = (method) => {
  selectedMethod.value = method
  console.log('选中支付方式：', method)
}

// 处理支付（核心：调用后端支付接口 + 原生支付API）
const handlePay = async () => {
  if (!orderInfo.value.orderId) {
    return uni.showToast({ title: '订单ID异常，无法支付', icon: 'none' })
  }

  // 构造支付请求参数
  const payData = {
    orderId: orderInfo.value.orderId,
    payMethod: selectedMethod.value,
    totalAmount: orderInfo.value.totalPrice,
    clientType: 'uni-app'
  }

  try {
    uni.showLoading({ title: '发起支付中...' })

    // 调用后端支付接口，获取支付参数（微信/支付宝）
    const res = await post('/pay/create', payData)
    const payParams = res.data
    console.log('后端返回支付参数：', payParams)

    uni.hideLoading()

    // 根据支付方式调用对应原生支付API
    if (selectedMethod.value === 'wechat') {
      // 微信支付
      await uni.requestPayment({
        provider: 'wxpay',
        timeStamp: payParams.timeStamp || '',
        nonceStr: payParams.nonceStr || '',
        package: payParams.package || '',
        signType: payParams.signType || 'MD5',
        paySign: payParams.paySign || '',
        success: (payRes) => {
          // 支付成功回调
          handlePaySuccess()
        },
        fail: (payErr) => {
          // 支付失败/取消支付回调
          uni.showToast({ title: `支付失败：${payErr.errMsg || '用户取消支付'}`, icon: 'none' })
          console.error('微信支付失败：', payErr)
        }
      })
    } else if (selectedMethod.value === 'alipay') {
      // 支付宝支付
      await uni.requestPayment({
        provider: 'alipay',
        orderInfo: payParams.orderInfo || '', // 支付宝订单字符串
        success: (payRes) => {
          // 支付成功回调
          handlePaySuccess()
        },
        fail: (payErr) => {
          // 支付失败/取消支付回调
          uni.showToast({ title: `支付失败：${payErr.errMsg || '用户取消支付'}`, icon: 'none' })
          console.error('支付宝支付失败：', payErr)
        }
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: `发起支付失败：${error.message || '网络异常'}`, icon: 'none' })
    console.error('支付接口调用失败：', error)
  }
}

// 支付成功处理
const handlePaySuccess = () => {
  uni.showModal({
    title: '支付成功',
    content: `订单${orderInfo.value.orderId}已完成支付，等待商家发货~`,
    showCancel: false,
    success: () => {
      // 跳转到订单列表页（tabBar页面，使用switchTab）
      uni.switchTab({ url: '/pages/order/order' })
    }
  })

  // 可选：更新本地订单状态（标记为已支付）
  const localOrderList = uni.getStorageSync('orderList') || []
  const updateOrderList = localOrderList.map(item => {
    if (item.orderId === orderInfo.value.orderId) {
      return { ...item, status: 1 } // 1=待发货（更新订单状态）
    }
    return item
  })
  uni.setStorageSync('orderList', updateOrderList)
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx;
}

/* 页面标题 */
.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 24rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

/* 订单信息卡片 */
.order-card {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
}
.card-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.order-item:last-child {
  border-bottom: none;
}
.item-label {
  font-size: 26rpx;
  color: #666;
  flex-shrink: 0;
  width: 120rpx;
}
.item-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  text-align: right;
}
.address-detail {
  display: block;
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 5rpx;
}

/* 支付金额 */
.pay-amount {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.amount-label {
  font-size: 28rpx;
  color: #333;
}
.amount-value {
  font-size: 36rpx;
  color: #FF4D4F;
  font-weight: bold;
}

/* 支付方式选择 */
.pay-method-wrap {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
}
.method-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 15rpx;
}
.method-item {
  display: flex;
  align-items: center;
  padding: 15rpx 10rpx;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
  position: relative;
}
.method-item:last-child {
  margin-bottom: 0;
}
.method-item.active {
  background-color: #FFF8F0;
  border: 1rpx solid #FF7D00;
}
.method-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 15rpx;
}
.method-name {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}
.select-icon {
  width: 30rpx;
  height: 30rpx;
  position: absolute;
  right: 10rpx;
  top: 50%;
  transform: translateY(-50%);
}

/* 支付按钮 */
.pay-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #FF7D00;
  color: #fff;
  font-size: 32rpx;
  border: none;
  border-radius: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pay-btn:disabled {
  background: #ccc;
  color: #fff;
}
</style>