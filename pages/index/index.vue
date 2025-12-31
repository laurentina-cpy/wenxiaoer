<template>
  <view class="home-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">城小二·校园小店</text>
      <text class="nav-cart-badge" v-if="cartCount > 0">{{ cartCount }}</text>
    </view>

    <!-- 商家信息 -->
    <view class="merchant-info">
      <image class="merchant-avatar" src="/static/icons/shop-avatar.png" mode="aspectFill"></image>
      <view class="merchant-detail">
        <text class="merchant-name">城院“城小二”求真1+2幢</text>
        <text class="merchant-score">⭐ 5.0分</text>
        <text class="merchant-meta">约20分钟送达 | 月售1000+</text>
      </view>
      <text class="merchant-notice">公告：欢迎光临，下单满20减3~</text>
    </view>

    <!-- 地址选择 -->
    <view class="address-wrap" @click="openAddressSelect">
      <text class="address-icon">📍</text>
      <view class="address-content" v-if="selectedAddress">
        <text class="address-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</text>
        <text class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</text>
      </view>
      <text class="address-empty" v-else>请选择收货地址</text>
      <text class="address-arrow">→</text>
    </view>

    <!-- 配送信息 -->
    <view class="delivery-info">
      <text class="delivery-time">预计配送：15-30分钟 | 配送费1元封顶</text>
      <text class="delivery-discount">🔥 满20减3 | 满30减5</text>
    </view>

    <!-- 商品分类 -->
    <scroll-view class="category-scroll" scroll-x>
      <text class="category-item" :class="{ active: activeCategory === '' }" @click="changeCategory('')">全部</text>
      <text class="category-item" v-for="(category, index) in categories" :key="category.category_id" :class="{ active: activeCategory === category.category_id }" @click="changeCategory(category.category_id)">
        {{ category.category_name }}
      </text>
    </scroll-view>

    <!-- 商品列表 -->
    <scroll-view class="goods-scroll" scroll-y>
      <view class="goods-item" v-for="(item, index) in filteredGoods" :key="item.goods_id || item.id">
        <image class="goods-img" :src="item.image" mode="aspectFill"></image>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.desc }}</text>
          <text class="goods-price">¥{{ item.price }}</text>
          <button class="buy-btn" @click="addToCart(item.id)">购买</button>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定购物车 -->
    <view class="fixed-cart-bar" v-if="cartCount > 0">
      <view class="cart-list" v-if="showCartList">
        <view class="cart-item" v-for="item in cartGoods" :key="item.goods_id || item.id">
          <text class="cart-name">{{ item.name }}</text>
          <view class="cart-ctrl">
            <button class="ctrl-btn minus" @click="updateCart(item.id, -1)">-</button>
            <text class="ctrl-count">{{ item.count }}</text>
            <button class="ctrl-btn plus" @click="updateCart(item.id, 1)">+</button>
          </view>
          <text class="cart-price">¥{{ (item.price * item.count).toFixed(2) }}</text>
        </view>
      </view>
      <view class="cart-footer" @click="showCartList = !showCartList">
        <view class="cart-summary">
          <text class="cart-label">购物车：</text>
          <text class="cart-count">{{ cartCount }}件</text>
          <text class="cart-total">¥{{ cartTotal }}</text>
        </view>
        <button class="checkout-btn" @click.stop="goToCheckout">去结算</button>
      </view>
    </view>
  </view>
</template>

<script setup>
// 核心修复：Vue API 从 vue 导入，uni 生命周期从 @dcloudio/uni-app 导入
import { ref, computed } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { TokenManager } from '@/utils/token'
import { post, get } from '@/utils/request' // 引入带Token的请求
import { getGoodsCategories } from '@/api/goods' // 引入获取分类列表的API

// 地址逻辑
const selectedAddress = ref(null);
// 商品分类
const activeCategory = ref(''); // 修改为字符串类型，空字符串表示全部
const categories = ref([]); // 从后端获取的分类列表
// 购物车列表展开/收起
const showCartList = ref(false);
// 商品列表
const goodsList = ref([]); // 初始化为空数组，从后端加载

// 过滤商品
const filteredGoods = computed(() => {
  if (activeCategory.value === '') return goodsList.value;
  return goodsList.value.filter(item => item.category === activeCategory.value);
});

// 购物车商品
const cartGoods = computed(() => {
  return goodsList.value.filter(item => item.count > 0);
});

// 购物车数量
const cartCount = computed(() => {
  return goodsList.value.reduce((sum, item) => sum + item.count, 0);
});

// 购物车总价
const cartTotal = computed(() => {
  return goodsList.value.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2);
});

// 页面加载
onLoad(async () => {
  // 登录校验（核心）
  if (!TokenManager.isLogin()) {
    uni.showModal({
      title: '提示',
      content: '请先登录后下单',
      showCancel: false,
      success: () => {
        uni.navigateTo({ url: '/pages/login/login' });
      }
    });
  }
  
  // 从后端加载分类数据
  await loadCategoriesFromBackend();
  
  // 从后端加载商品数据
  await loadGoodsFromBackend();
  
  getDefaultAddress();
  // 读取本地购物车
  const storedCart = uni.getStorageSync('cart');
  if (storedCart) {
    storedCart.forEach(item => {
      const target = goodsList.value.find(g => g.id === item.id || g.goods_id === item.goods_id);
      if (target) target.count = item.count;
    });
  }
  uni.$on('selectAddress', handleAddressSelect);
});

// 从后端加载分类数据（只保留这一个函数定义）
const loadCategoriesFromBackend = async () => {
  try {
    const res = await getGoodsCategories();
    console.log('后端返回的分类数据:', res.data); // 添加调试信息
    
    if (res.code === 200 && res.data) {
      // 过滤掉不需要的分类，只保留快餐、饮品、小吃、水果
      const filtered = res.data.filter(category => {
        const allowedCategories = ['快餐', '饮品', '小吃', '水果'];
        return allowedCategories.includes(category.category_name);
      });
      
      console.log('过滤后的分类数据:', filtered); // 添加调试信息
      categories.value = filtered;
      
      // 如果过滤后没有数据，使用默认分类
      if (filtered.length === 0) {
        categories.value = [
          { category_id: '1', category_name: '快餐' },
          { category_id: '2', category_name: '饮品' },
          { category_id: '3', category_name: '小吃' },
          { category_id: '4', category_name: '水果' }
        ];
      }
    }
  } catch (error) {
    console.error('加载分类失败:', error);
    // 加载失败时使用默认分类
    categories.value = [
      { category_id: '1', category_name: '快餐' },
      { category_id: '2', category_name: '饮品' },
      { category_id: '3', category_name: '小吃' },
      { category_id: '4', category_name: '水果' }
    ];
  }
  
  console.log('最终的分类数据:', categories.value); // 添加调试信息
};

// 页面显示
onShow(() => {
  // 登录状态刷新
  if (!TokenManager.isLogin()) return;
  
  getDefaultAddress();
  
  // 重新读取本地购物车数据
  const storedCart = uni.getStorageSync('cart') || [];
  const cartMap = new Map(storedCart.map(item => [item.id || item.goods_id, item]));
  
  // 更新商品列表中的数量
  goodsList.value.forEach(item => {
    const cartItem = cartMap.get(item.id || item.goods_id);
    item.count = cartItem ? cartItem.count : 0;
  });
});

// 页面卸载
onUnload(() => {
  // 只保存数量大于0的商品
  const cartData = goodsList.value
    .filter(item => item.count > 0)
    .map(item => ({
      id: item.id,
      goods_id: item.goods_id || item.id,
      name: item.name,
      price: item.price,
      count: item.count,
      image: item.image
    }));
  
  uni.setStorageSync('cart', cartData);
  uni.$off('selectAddress', handleAddressSelect);
});

// 读取默认地址
const getDefaultAddress = () => {
  const addressList = uni.getStorageSync('addressList') || [];
  const defaultAddress = addressList.find(item => item.isDefault);
  if (defaultAddress) selectedAddress.value = defaultAddress;
};

// 处理地址选择
const handleAddressSelect = (address) => {
  if (address) selectedAddress.value = address;
};

// 从后端加载商品数据
const loadGoodsFromBackend = async () => {
  try {
    const res = await get('/goods/list');
    if (res.code === 200 && res.data) {
      // 将后端数据转换为前端格式
      goodsList.value = res.data.map(item => ({
        id: item.goods_id,
        category: item.category_id,
        image: item.img_url || '/static/images/default-goods.png',
        name: item.name,
        desc: item.description || '暂无描述',
        price: Number(item.price),
        count: 0,
        stock: item.stock,
        sales_count: item.sales_count
      }));
    }
  } catch (error) {
    console.error('加载商品失败:', error);
    uni.showToast({ title: '加载商品失败', icon: 'none' });
    // 加载失败时使用模拟数据
    goodsList.value = [
      {
        id: '1',
        category: '1',
        image: "/static/images/food1.png",
        name: "番茄鸡蛋盖浇饭",
        desc: "酸甜可口，配米饭超香",
        price: 15.9,
        count: 0,
        stock: 100,
        sales_count: 100
      },
      {
        id: '2',
        category: '2',
        image: "/static/images/food2.png",
        name: "珍珠奶茶",
        desc: "大杯/三分糖/去冰",
        price: 8.9,
        count: 0,
        stock: 100,
        sales_count: 100
      },
      {
        id: '3',
        category: '3',
        image: "/static/images/food3.png",
        name: "炸鸡排",
        desc: "酥脆可口，配番茄酱",
        price: 12.9,
        count: 0,
        stock: 100,
        sales_count: 100
      },
      {
        id: '4',
        category: '4',
        image: "/static/images/food4.png",
        name: "草莓果切",
        desc: "新鲜现切，半斤装",
        price: 16.9,
        count: 0,
        stock: 100,
        sales_count: 100
      }
    ];
  }
};

// 切换分类
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId;
};

// 加入购物车
const addToCart = (id) => {
  if (!TokenManager.isLogin()) {
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  
  // 兼容后端返回的goods_id和前端模拟的id
  const target = goodsList.value.find(item => item.id === id || item.goods_id === id);
  if (!target) return;
  if (target.stock <= target.count) {
    uni.showToast({ title: '库存不足', icon: 'none' });
    return;
  }
  target.count += 1;
  // 保存购物车数据
  const cartData = goodsList.value
    .filter(item => item.count > 0)
    .map(item => ({
      id: item.id,
      goods_id: item.goods_id || item.id,
      name: item.name,
      price: item.price,
      count: item.count,
      image: item.image
    }));
  uni.setStorageSync('cart', cartData);
  uni.showToast({ title: '已加入购物车', icon: 'success', duration: 1000 });
  showCartList.value = true;
};

// 更新购物车
const updateCart = (id, num) => {
  const target = goodsList.value.find(item => item.id === id || item.goods_id === id);
  if (!target) return;
  
  target.count += num;
  if (target.count < 0) target.count = 0;
  
  // 更新本地存储
  const cartData = goodsList.value
    .filter(item => item.count > 0)
    .map(item => ({
      id: item.id,
      goods_id: item.goods_id || item.id,
      name: item.name,
      price: item.price,
      count: item.count,
      image: item.image
    }));
  uni.setStorageSync('cart', cartData);
};

// 跳转到结算页面（优化后：过滤空商品，添加空校验）
const goToCheckout = () => {
  // 只过滤count>0的商品，避免传递空商品数据
  const validCartData = goodsList.value
    .filter(item => item.count > 0)
    .map(item => ({
      id: item.id,
      goods_id: item.goods_id || item.id,
      name: item.name,
      price: item.price,
      count: item.count,
      image: item.image
    }));
  
  // 校验购物车是否为空
  if (validCartData.length === 0) {
    return uni.showToast({ title: '购物车为空，无法结算', icon: 'none' });
  }
  
  uni.setStorageSync('cartList', validCartData); 
  uni.navigateTo({ url: '/pages/checkout/checkout' });
};

// 打开地址选择（优化后：添加登录拦截）
const openAddressSelect = () => {
  if (!TokenManager.isLogin()) {
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  uni.navigateTo({ url: '/pages/address/address' });
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #FF7D00;
  color: #fff;
  position: relative;
}
.nav-title {
  font-size: 32rpx;
  font-weight: bold;
}
.nav-cart-badge {
  position: absolute;
  right: 24rpx;
  top: 10rpx;
  width: 30rpx;
  height: 30rpx;
  line-height: 30rpx;
  background-color: #FF4D4F;
  color: #fff;
  border-radius: 15rpx;
  font-size: 20rpx;
  text-align: center;
}

/* 商家信息 */
.merchant-info {
  padding: 20rpx 24rpx;
  background-color: #fff;
  margin-bottom: 15rpx;
}
.merchant-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-bottom: 10rpx;
}
.merchant-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.merchant-score {
  font-size: 24rpx;
  color: #FFB800;
  margin-right: 20rpx;
}
.merchant-meta {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin: 5rpx 0;
}
.merchant-notice {
  font-size: 22rpx;
  color: #FF4D4F;
  display: block;
  margin-top: 10rpx;
  background-color: #FFF0F0;
  padding: 5rpx 10rpx;
  border-radius: 4rpx;
}

/* 地址选择 */
.address-wrap {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #fff;
  margin-bottom: 15rpx;
}
.address-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}
.address-content {
  flex: 1;
}
.address-name {
  font-size: 26rpx;
  color: #333;
  display: block;
}
.address-detail {
  font-size: 24rpx;
  color: #666;
  display: block;
  line-height: 32rpx;
}
.address-empty {
  flex: 1;
  font-size: 26rpx;
  color: #999;
}
.address-arrow {
  font-size: 28rpx;
  color: #ccc;
}

/* 配送信息 */
.delivery-info {
  padding: 15rpx 24rpx;
  background-color: #fff;
  margin-bottom: 15rpx;
}
.delivery-time {
  font-size: 24rpx;
  color: #666;
  display: block;
}
.delivery-discount {
  font-size: 24rpx;
  color: #FF7D00;
  display: block;
  margin-top: 5rpx;
}

/* 商品分类 */
.category-scroll {
  white-space: nowrap;
  padding: 10rpx 24rpx;
  background-color: #fff;
  margin-bottom: 15rpx;
}
.category-item {
  display: inline-block;
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 20rpx;
}
.category-item.active {
  background-color: #FF7D00;
  color: #fff;
}

/* 商品列表 */
.goods-scroll {
  height: calc(100vh - 450rpx);
  padding-bottom: 20rpx;
}
.goods-item {
  display: flex;
  padding: 20rpx 24rpx;
  background-color: #fff;
  margin-bottom: 15rpx;
  border-radius: 12rpx;
}
.goods-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}
.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.goods-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}
.goods-desc {
  font-size: 22rpx;
  color: #999;
  margin: 5rpx 0;
}
.goods-price {
  font-size: 28rpx;
  color: #FF4D4F;
}
.buy-btn {
  width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  background-color: #FF7D00;
  color: #fff;
  border-radius: 30rpx;
  border: none;
  font-size: 26rpx;
  align-self: flex-end;
}

/* 底部固定购物车 */
.fixed-cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  z-index: 999;
}
.cart-list {
  max-height: 250rpx;
  overflow-y: auto;
  padding: 15rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.cart-name {
  font-size: 24rpx;
  color: #333;
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cart-ctrl {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}
.ctrl-btn {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  background-color: #f5f5f5;
  color: #333;
  border-radius: 20rpx;
  border: none;
  font-size: 24rpx;
}
.ctrl-btn.plus {
  background-color: #FF7D00;
  color: #fff;
}
.ctrl-count {
  font-size: 24rpx;
  margin: 0 10rpx;
}
.cart-price {
  font-size: 24rpx;
  color: #FF4D4F;
  flex: 1;
  text-align: right;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
}
.cart-summary {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.cart-label {
  font-size: 26rpx;
  color: #333;
}
.cart-count {
  font-size: 24rpx;
  color: #999;
}
.cart-total {
  font-size: 28rpx;
  color: #FF4D4F;
  font-weight: bold;
}
.checkout-btn {
  width: 200rpx;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #FF7D00;
  color: #fff;
  border-radius: 35rpx;
  border: none;
  font-size: 28rpx;
}
.checkout-btn:disabled {
  background-color: #ccc;
}
</style>