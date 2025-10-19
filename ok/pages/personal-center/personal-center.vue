<template>
  <view class="container">
    <view class="header">
      <image class="avatar" src="/static/logo.png"></image>
      <text class="username">陈鹏宇</text>
    </view>

    <view
      class="menu-item"
      v-for="(item, index) in menuItems"
      :key="index"
      @click="navigateToPage(index)"
    >
      <text>{{ item }}</text>
      <text class="arrow">></text>
    </view>

    <button class="logout-button" @click="logout">退出登录</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      menuItems: ['地址管理', '隐私政策', '用户协议', '消费者权益']
    };
  },
  methods: {
    navigateToPage(index) {
      const paths = [
        '/pages/address-manager-page/address-manager-page',
        '/pages/privacy/privacy',
        '/pages/agreement/agreement',
        '/pages/consumer/consumer'
      ];
      uni.navigateTo({ url: paths[index] });
    },
    logout() {
      console.log('退出登录');
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f8f8f8;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 10px;
}
.username {
  font-size: 18px;
  font-weight: bold;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}
.arrow {
  font-size: 16px;
  color: #888;
}
.logout-button {
  width: 100%;
  padding: 15px;
  background-color: #6a1b9a;
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
  font-size: 16px;
}
</style>
