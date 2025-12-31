<template>
  <view class="checkout-page">
    <!-- 页面标题 -->
    <view class="page-title">确认订单</view>

    <!-- 收货地址 -->
    <view class="address-wrap" @click="openAddressSelect">
      <text class="address-title">收货地址</text>
      <view class="address-info" v-if="selectedAddress">
        <text class="user-info">{{ selectedAddress.name }} {{ selectedAddress.phone }}</text>
        <text class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</text>
      </view>
      <text class="address-placeholder" v-else>请选择收货地址</text>
      <image src="/static/icons/arrow-right.png" class="arrow-icon" />
    </view>

    <!-- 订单商品列表 -->
    <view class="goods-title">订单商品</view>
    <view class="goods-list">
      <view class="goods-item" v-for="(item, index) in cartList" :key="index">
        <image class="goods-img" :src="item.image || '/static/icons/default-goods.png'" mode="aspectFit"></image>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-price">¥{{ item.price }}</text>
        </view>
        <text class="goods-count">x{{ item.count }}</text>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="price-wrap">
      <view class="price-item">
        <text class="price-label">商品总价</text>
        <text class="price-value">¥{{ totalPrice }}</text>
      </view>
      <view class="price-item">
        <text class="price-label">配送费</text>
        <text class="price-value">¥1</text>
      </view>
      <view class="price-item total">
        <text class="price-label">实付款</text>
        <text class="price-value">¥{{ (Number(totalPrice) + 1).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 提交订单按钮 -->
    <button class="submit-btn" @click="submitOrder" :disabled="!selectedAddress">提交订单</button>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { TokenManager } from '@/utils/token';
import { post } from '@/utils/request'; // 引入带Token的请求

// 选中的地址
const selectedAddress = ref(null);
// 购物车数据
const cartList = ref([]);

// 页面加载时解析URL参数
onMounted(() => {
  // 登录校验（核心）
  if (!TokenManager.isLogin()) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.navigateTo({ url: '/pages/login/login' });
    return;
  }

  // 获取页面参数（商品数据）
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;
  
  if (options.goods) {
    cartList.value = JSON.parse(decodeURIComponent(options.goods))
      .filter(item => item.count > 0); // 过滤掉数量为0的商品
    uni.setStorageSync('cartList', cartList.value);
  } else {
    // 如果没有页面参数，尝试从本地存储获取
    const localCart = (uni.getStorageSync('cartList') || uni.getStorageSync('cart') || [])
      .filter(item => item.count > 0); // 过滤掉数量为0的商品
    if (localCart.length > 0) {
      cartList.value = localCart;
    }
  }

  // 获取默认地址
  const addressList = uni.getStorageSync('addressList') || [];
  const defaultAddress = addressList.find(item => item.isDefault);
  if (defaultAddress) {
    selectedAddress.value = defaultAddress;
  }

  // 监听地址选择事件
  uni.$on('selectAddress', handleSelectAddress);
});

// 取消监听
onUnmounted(() => {
  uni.$off('selectAddress', handleSelectAddress);
});

// 商品总价
const totalPrice = computed(() => {
  return cartList.value.reduce((total, item) => {
    // 将价格转换为数字类型后再计算
    return total + Number(item.price) * item.count;
  }, 0).toFixed(2);
});

// 处理选中的地址
const handleSelectAddress = (address) => {
  selectedAddress.value = address;
};

// 打开地址选择页
const openAddressSelect = () => {
  uni.navigateTo({
    url: '/pages/address/address?selectMode=1'
  });
};

// 提交订单（带Token调用后端接口）
const submitOrder = async () => {
  if (!TokenManager.isLogin()) {
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  
  if (!selectedAddress.value) {
    uni.showToast({ title: '请先选择收货地址', icon: 'none' });
    return;
  }
  
  if (cartList.value.length === 0) {
    uni.showToast({ title: '购物车为空，无法下单', icon: 'none' });
    return;
  }

  if (!selectedAddress.value) {
    uni.showToast({ title: '请先选择收货地址', icon: 'none' });
    return;
  }

  // 构造订单数据 - 匹配后端API格式
  const orderData = {
    address_id: selectedAddress.value.address_id || selectedAddress.value.id || `addr_${Date.now()}`,
    goods_list: cartList.value.map(item => ({
      goods_id: item.goods_id || item.id,
      quantity: item.count,
      price: item.price
    })),
    total_amount: (Number(totalPrice.value) + 1).toFixed(2)
  };

  try {
    uni.showLoading({ title: '提交订单中' });
    
    // 调用后端下单接口（自动携带Token）
    const res = await post('/order/create', orderData);
    
    if (res.code !== 200) {
      throw new Error(res.message || '下单失败');
    }

    // 创建订单对象保存到本地
    const newOrder = {
      orderId: res.data.order_number,
      status: 0, // 0-待付款
      totalPrice: orderData.total_amount,
      createTime: new Date().toLocaleString(),
      address: selectedAddress.value,
      goodsList: cartList.value.map(item => ({
        goodsId: item.goods_id || item.id,
        name: item.name,
        price: item.price,
        count: item.count,
        image: item.image
      }))
    };

    // 保存订单到本地存储
    const existingOrders = uni.getStorageSync('orderList') || [];
    existingOrders.unshift(newOrder);
    uni.setStorageSync('orderList', existingOrders);

    // 下单成功提示
    uni.hideLoading();
    uni.showModal({
      title: '下单成功',
      content: `订单号：${res.data.order_number}\n收货地址：${selectedAddress.value.detail || selectedAddress.value.building + '栋' + selectedAddress.value.room}\n总价：¥${orderData.total_amount}`,
      showCancel: false,
      success: () => {
        // 【新增：跳转支付页，保留原有清空购物车功能】
        // 传递订单信息到支付页（URL编码防止参数异常）
        uni.navigateTo({
          url: `/pages/pay/pay?order=${encodeURIComponent(JSON.stringify(newOrder))}`
        });

        // 清空购物车 - 确保同时清空两个键（原有功能不变）
        uni.setStorageSync('cartList', []);
        uni.setStorageSync('cart', []); // 同步首页购物车
        cartList.value = [];

        // 注释原有跳转到订单列表的逻辑，如需保留可二选一，此处优先跳转支付页
        // uni.switchTab({ url: '/pages/order/order' });
      }
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: `下单失败：${error.message || '未知错误'}`, icon: 'none' });
  }
};
</script>

<style scoped>
.checkout-page {
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

/* 收货地址 */
.address-wrap {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}
.address-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}
.address-info {
  margin-bottom: 10rpx;
}
.user-info {
  font-size: 26rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}
.address-detail {
  font-size: 24rpx;
  color: #666;
  line-height: 36rpx;
}
.address-placeholder {
  font-size: 26rpx;
  color: #999;
  padding: 20rpx 0;
}
.arrow-icon {
  align-self: flex-end;
  width: 24rpx;
  height: 24rpx;
  color: #999;
}

/* 订单商品 */
.goods-title {
  font-size: 28rpx;
  color: #333;
  padding: 15rpx 20rpx;
  background-color: #fff;
  margin-top: 15rpx;
}
.goods-list {
  background-color: #fff;
  padding: 0 20rpx;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.goods-item:last-child {
  border-bottom: none;
}
.goods-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 15rpx;
}
.goods-info {
  flex: 1;
}
.goods-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-price {
  font-size: 26rpx;
  color: #FF7D00;
  font-weight: bold;
}
.goods-count {
  font-size: 26rpx;
  color: #666;
}

/* 价格信息 */
.price-wrap {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
}
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.price-item:last-child {
  border-bottom: none;
}
.price-item.total {
  padding-top: 20rpx;
}
.price-label {
  font-size: 28rpx;
  color: #333;
}
.price-value {
  font-size: 28rpx;
  color: #FF7D00;
  font-weight: bold;
}
.price-item.total .price-value {
  font-size: 32rpx;
}

/* 提交按钮 */
.submit-btn {
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
}
.submit-btn:disabled {
  background: #ccc;
  color: #fff;
}
</style>