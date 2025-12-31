<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 登录态检查
  uni.checkSession({
    fail() {
      uni.redirectTo({ url: '/pages/login/login' })
    }
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #F5F5F5;
}

/* 清除默认样式 */
button::after {
  border: none;
}

/* 全局主题色 */
:root {
  --theme-color: #FF7D00;
  --text-color: #333333;
  --gray-color: #666666;
  --light-gray: #999999;
  --red-color: #FF4D4F;
}
</style>