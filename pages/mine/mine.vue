<template>
  <view class="mine-page">
    <!-- 个人信息头部 -->
    <view class="user-header">
      <view class="avatar-wrap">
        <image class="avatar" :src="userInfo.avatar || '/static/icons/avatar.png'" mode="aspectFit"></image>
        <text class="user-name">{{ userInfo.nickname || '未登录' }}</text>
      </view>
      <button class="login-btn" @click="handleLogin" v-if="!TokenManager.isLogin()">登录/注册</button>
    </view>

    <!-- 功能列表（仅保留已实现功能：收货地址、关于我们、退出登录） -->
    <view class="func-list">
      <view class="func-item" @click="goToAddress">
        <image class="func-icon" src="/static/icons/address.png" mode="aspectFit"></image>
        <text class="func-text">收货地址</text>
        <image class="arrow-icon" src="/static/icons/arrow-right.png" mode="aspectFit"></image>
      </view>
      <view class="func-item" @click="goToAbout">
        <image class="func-icon" src="/static/icons/about.png" mode="aspectFit"></image>
        <text class="func-text">关于我们</text>
        <image class="arrow-icon" src="/static/icons/arrow-right.png" mode="aspectFit"></image>
      </view>
      <view class="func-item" @click="handleLogout" v-if="TokenManager.isLogin()">
        <image class="func-icon" src="/static/icons/logout.png" mode="aspectFit"></image>
        <text class="func-text">退出登录</text>
        <image class="arrow-icon" src="/static/icons/arrow-right.png" mode="aspectFit"></image>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">v1.0.0 城小二校园外卖</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { TokenManager } from '@/utils/token'

// 响应式用户信息
const userInfo = ref({
  nickname: '',
  avatar: '/static/icons/avatar.png',
  phone: ''
})

// 页面显示时刷新登录状态
onShow(() => {
  if (TokenManager.isLogin()) {
    userInfo.value = TokenManager.getUserInfo()
  } else {
    userInfo.value = {
      nickname: '未登录',
      avatar: '/static/icons/avatar.png',
      phone: ''
    }
  }
})

// 登录/注册
const handleLogin = () => {
  if (!TokenManager.isLogin()) {
    uni.navigateTo({ url: '/pages/login/login' })
  }
}

// 退出登录（核心：清除 Token）
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除 Token + 用户信息
        TokenManager.clearToken()
        // 刷新用户信息
        userInfo.value = {
          nickname: '未登录',
          avatar: '/static/icons/avatar.png',
          phone: ''
        }
        uni.showToast({ title: '退出成功', icon: 'success' })
      }
    }
  })
}

// 跳转到收货地址
const goToAddress = () => {
  // 未登录拦截
  if (!TokenManager.isLogin()) {
    return uni.navigateTo({ url: '/pages/login/login' })
  }
  uni.navigateTo({ url: '/pages/address/address' })
}

// 跳转到关于我们
const goToAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '城小二校园外卖平台，专注为城院师生提供便捷的外卖服务~',
    showCancel: false
  })
}
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx; /* 适配全局tabBar高度 */
}

/* 个人信息头部 */
.user-header {
  background-color: #FF7D00;
  padding: 60rpx 30rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 20rpx 20rpx;
}
.avatar-wrap {
  display: flex;
  align-items: center;
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  margin-right: 20rpx;
}
.user-name {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}
.login-btn {
  width: 160rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  background: #fff;
  color: #FF7D00;
  font-size: 24rpx;
  border: none;
}

/* 功能列表 */
.func-list {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.func-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.func-item:last-child {
  border-bottom: none;
}
.func-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}
.func-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  color: #999;
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 40rpx 0;
}
.version-text {
  font-size: 24rpx;
  color: #999;
}
</style>