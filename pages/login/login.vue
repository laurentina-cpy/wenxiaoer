<template>
  <view class="login-container">
    <view class="logo-wrapper">
      <image src="/static/images/logo.png" class="login-logo" mode="aspectFit" />
      <text class="login-title">城小二</text>
      <text class="login-subtitle">校园即时配送专家</text>
    </view>

    <button class="wx-login-btn" @click="wxLogin" :disabled="loginLock">
      <text class="wx-text">✓</text>
      <text class="login-text">微信快捷登录</text>
    </button>

    <text class="login-tip">登录即表示同意《用户协议》和《隐私政策》</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { TokenManager } from '@/utils/token'
// 导入post方法（已确认后端接口修复后放开）
import { post } from '@/utils/request'

const loginLock = ref(false)

const wxLogin = async () => {
  if (TokenManager.isLogin()) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }

  if (loginLock.value) return
  loginLock.value = true

  try {
    uni.showLoading({ title: '登录中' })
    
    // 获取微信登录凭证
    const loginRes = await uni.login()
    if (loginRes.errMsg !== 'login:ok') {
      throw new Error('获取登录凭证失败')
    }

    // 调用后端登录接口（使用正确路径）
    const res = await post('/user/wxLogin', { 
      code: loginRes.code,
      nickname: '微信用户',
      avatarUrl: '',
      phone: ''
    });
    
    // 关键修复：使用接口返回的真实数据，而非未定义的mock变量
    TokenManager.setToken(res.data.token, res.data.user); // 保存后端返回的token和用户信息
    
    // 登录成功提示+跳转
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.switchTab({ url: '/pages/index/index' })

  } catch (error) {
    console.error('登录失败：', error)
    uni.showToast({ 
      title: `登录失败：${error.message || '未知错误'}`, 
      icon: 'none',
      duration: 3000
    })
  } finally {
    uni.hideLoading()
    loginLock.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding: 40px 20px;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #FF7D00;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666666;
}

.wx-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  line-height: 48px;
  background-color: #07C160;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  margin-bottom: 20px;
}

.wx-text {
  font-size: 20px;
  margin-right: 8px;
}

.wx-login-btn[disabled] {
  background-color: #95e1b4;
  color: #f5f5f5;
}

.login-tip {
  font-size: 12px;
  color: #999999;
  text-align: center;
}
</style>