<template>
  <view class="page">
    <!-- 顶部切换栏 -->
    <view class="tab-bar">
      <view
        v-for="(t, i) in tabs"
        :key="i"
        :class="['tab-item', active === i && 'active']"
        @click="switchTab(i)"
      >
        <text>{{ t }}</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <view v-if="list.length" class="order-list">
        <!-- 后续用 v-for 渲染订单卡片 -->
        <view v-for="(item, idx) in list" :key="idx" class="order-card">
          <text>订单号：{{ item.no }}</text>
          <text>状态：{{ item.status }}</text>
        </view>
      </view>

      <!-- 空态 -->
      <view v-else class="empty">
        <image src="/static/logo.png" mode="aspectFit" />
        <text>暂无数据</text>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      tabs: ['全部', '待付款', '待配送'],
      active: 0,
      list: [] // 先空，后续接口赋值
    };
  },
  methods: {
    switchTab(idx) {
      this.active = idx;
      // 这里可调用不同接口，先简单重置
      this.list = [];
    }
  }
};
</script>
<style scoped>
.page {
  background-color: #f8f8f8;
  min-height: 100vh;
}
.tab-bar {
  display: flex;
  height: 44px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #666;
}
.tab-item.active {
  color: #6a1b9a;
  font-weight: bold;
}
.content {
  padding: 20rpx;
}
.empty {
  margin-top: 200rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
.empty image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
}
.order-card {
  background: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
}
</style>
