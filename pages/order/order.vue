<template>
  <view class="order-page">
    <!-- 页面标题 -->
    <view class="page-title">我的订单</view>

    <!-- 订单筛选栏 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        v-for="(item, index) in filterList" 
        :key="index"
        @click="selectFilter(index)"
      >
        <text :class="{ active: currentFilter === index }">{{ item.name }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-scroll" scroll-y>
      <!-- 订单项 -->
      <view class="order-item" v-for="(order, index) in filteredOrderList" :key="order.order_id">
        <view class="order-header">
          <text class="order-no">订单编号：{{ order.order_number }}</text>
          <text class="order-status" :style="{ color: statusColor[order.status] }">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-goods">
          <view class="goods-item" v-for="goods in order.orderItems" :key="goods.order_item_id">
            <image class="goods-img" :src="goods.goods_image || '/static/icons/default-goods.png'" mode="aspectFit"></image>
            <view class="goods-info">
              <text class="goods-name">{{ goods.goods_name }}</text>
              <text class="goods-spec">x{{ goods.quantity }}</text>
              <text class="goods-price">¥{{ goods.unit_price }}</text>
            </view>
          </view>
        </view>
        <view class="order-footer">
          <text class="total-price">合计：¥{{ order.total_amount }}</text>
          <view class="btn-group">
            <button class="operate-btn" v-if="order.status === 0" @click="cancelOrder(order.order_id)">取消订单</button>
            <button class="operate-btn primary" v-if="order.status === 0" @click="payOrder(order.order_id)">去支付</button>
            <button class="operate-btn" v-if="order.status === 1" @click="confirmReceipt(order.order_id)">确认收货</button>
            <button class="operate-btn" v-if="order.status === 2" @click="deleteOrder(order.order_id)">删除订单</button>
          </view>
        </view>
      </view>

      <!-- 空订单提示 -->
      <view class="empty-order" v-if="filteredOrderList.length === 0">
        <image src="/static/icons/empty-order.png" class="empty-img"></image>
        <text>暂无订单记录~</text>
        <button class="go-shop-btn" @click="goToShop">去下单</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getOrderList, cancelOrder as cancelOrderAPI } from '../../api/order';

// 订单筛选类型
const filterList = ref([
  { name: '全部' },
  { name: '待付款' },
  { name: '待收货' },
  { name: '已完成' },
  { name: '已取消' }
]);
const currentFilter = ref(0);

// 订单列表
const orderList = ref([]);

// 从后端API获取订单
const fetchOrderList = async () => {
  try {
    const res = await getOrderList();
    if (res.code === 200) {
      orderList.value = res.data;
    } else {
      uni.showToast({ title: res.message || '获取订单失败', icon: 'none' });
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' });
    console.error('获取订单失败:', error);
  }
};

// 初始化订单数据
const initOrderList = () => {
  fetchOrderList();
};

// 状态颜色
const statusColor = ref({
  0: '#FF7D00', // 待付款-橙色
  1: '#1989FA', // 已支付-蓝色
  2: '#1989FA', // 配送中-蓝色
  3: '#1989FA', // 已送达-蓝色
  4: '#52C41A', // 已完成-绿色
  5: '#999999', // 已取消-灰色
  6: '#999999'  // 已退款-灰色
});

// 筛选后的订单列表
const filteredOrderList = computed(() => {
  if (currentFilter.value === 0) return orderList.value;
  // 匹配筛选状态：1-待付款(0) 2-待收货(1+2) 3-已完成(4) 4-已取消(5+6)
  if (currentFilter.value === 1) {
    return orderList.value.filter(order => order.status === 0);
  } else if (currentFilter.value === 2) {
    return orderList.value.filter(order => order.status === 1 || order.status === 2);
  } else if (currentFilter.value === 3) {
    return orderList.value.filter(order => order.status === 4);
  } else if (currentFilter.value === 4) {
    return orderList.value.filter(order => order.status === 5 || order.status === 6);
  }
  return orderList.value;
});

// 页面加载时初始化
onMounted(() => {
  initOrderList();
});

// 获取状态文字
const getStatusText = (status) => {
  const statusMap = ['待付款', '已支付', '配送中', '已送达', '已完成', '已取消', '已退款'];
  return statusMap[status] || '未知状态';
};

// 选择筛选条件
const selectFilter = (index) => {
  currentFilter.value = index;
};

// 修改取消订单函数（大约在160行左右）
const cancelOrder = (orderId) => {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 使用重命名后的API函数
          const result = await cancelOrderAPI(orderId);
          if (result.code === 200) {
            uni.showToast({ title: '订单已取消', icon: 'success' });
            // 刷新订单列表
            fetchOrderList();
          } else {
            uni.showToast({ title: result.message || '取消订单失败', icon: 'none' });
          }
        } catch (error) {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          console.error('取消订单失败:', error);
        }
      }
    }
  });
};

// 支付订单
const payOrder = (orderId) => {
  uni.showModal({
    title: '提示',
    content: '支付功能开发中',
    showCancel: false
  });
};

// 确认收货
const confirmReceipt = (orderId) => {
  uni.showModal({
    title: '提示',
    content: '确定已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        // 这里可以调用后端确认收货API
        uni.showToast({ title: '已确认收货', icon: 'success' });
        // 刷新订单列表
        fetchOrderList();
      }
    }
  });
};

// 删除订单
const deleteOrder = (orderId) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 这里可以调用后端删除订单API
        // 在本地过滤掉该订单
        orderList.value = orderList.value.filter(order => order.order_id !== orderId);
        uni.showToast({ title: '订单已删除', icon: 'success' });
      }
    }
  });
};

// 去首页下单
const goToShop = () => {
  uni.switchTab({ url: '/pages/index/index' });
};

// 将fetchOrderList函数挂载到全局，方便生命周期函数调用
uni.$order = { fetchOrderList };
</script>

<!-- uni-app 页面生命周期 -->
<script>
export default {
  onShow() {
    // 页面显示时刷新订单数据
    if (uni.$order && uni.$order.fetchOrderList) {
      uni.$order.fetchOrderList();
    }
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  padding: 30rpx 0;
  background-color: #fff;
  border-bottom: 1rpx solid #e0e0e0;
}

.filter-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.filter-item {
  padding: 10rpx 20rpx;
}

.filter-item text {
  font-size: 30rpx;
  color: #666;
}

.filter-item text.active {
  color: #FF7D00;
  font-weight: bold;
  border-bottom: 2rpx solid #FF7D00;
}

.order-scroll {
  height: calc(100vh - 200rpx);
}

.order-item {
  background-color: #fff;
  margin: 0 20rpx 20rpx;
  padding: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-no {
  font-size: 28rpx;
  color: #999;
}

.order-status {
  font-size: 30rpx;
  font-weight: bold;
}

.order-goods {
  margin-bottom: 20rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.goods-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 120rpx;
}

.goods-name {
  font-size: 30rpx;
  color: #333;
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-spec {
  font-size: 26rpx;
  color: #666;
  align-self: flex-start;
  margin-top: 10rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #FF7D00;
  font-weight: bold;
  align-self: flex-end;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.total-price {
  font-size: 32rpx;
  color: #FF7D00;
  font-weight: bold;
}

.btn-group {
  display: flex;
  gap: 15rpx;
}

.operate-btn {
  padding: 10rpx 30rpx;
  border: 1rpx solid #ddd;
  border-radius: 50rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #fff;
}

.operate-btn.primary {
  background-color: #FF7D00;
  color: #fff;
  border-color: #FF7D00;
}

.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-order text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-shop-btn {
  padding: 15rpx 60rpx;
  background-color: #FF7D00;
  color: #fff;
  border-radius: 50rpx;
  font-size: 30rpx;
  border: none;
}
</style>