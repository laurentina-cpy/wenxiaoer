<template>
  <view class="container">
    <view class="header">
      <text>首页</text>
    </view>
    <view class="content">
      <text>欢迎来到城小二首页</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f8f8f8;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
.content {
  text-align: center;
  font-size: 24px;
}
</style>
