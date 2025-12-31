<template>
  <view class="goods-card">
    <image :src="goods.imgUrl || '/static/images/default-goods.png'" class="goods-img" mode="aspectFill" />
    <view class="goods-info">
      <text class="goods-name">{{ goods.name }}</text>
      <text class="goods-price">¥{{ goods.price }}</text>
      <text class="goods-stock" v-if="goods.stock <= 0">已售罄</text>
      <view class="goods-ctrl" v-else>
        <button class="ctrl-btn minus" @click="reduce">-</button>
        <text class="ctrl-num">{{ quantity }}</text>
        <button class="ctrl-btn plus" @click="add">+</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '@/store/cart'

const cartStore = useCartStore()

// 接收父组件传值
const props = defineProps({
  goods: {
    type: Object,
    required: true
  }
})

// 本地数量（同步购物车）
const quantity = ref(0)

// 监听购物车变化，同步数量
watch(
  () => cartStore.list,
  (newList) => {
    const item = newList.find(item => item.goodsId === props.goods.goodsId)
    quantity.value = item ? item.quantity : 0
  },
  { immediate: true }
)

// 增加数量
const add = () => {
  cartStore.addGoods(props.goods)
  // 通知父组件
  emit('add-to-cart', props.goods)
}

// 减少数量
const reduce = () => {
  cartStore.reduceGoods(props.goods.goodsId)
}

// 定义事件
const emit = defineEmits(['add-to-cart'])
</script>

<style scoped>
.goods-card {
  width: 48%;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
}

.goods-img {
  width: 100%;
  height: 120px;
  border-radius: 4px;
}

.goods-info {
  padding: 8px 0;
}

.goods-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.goods-price {
  font-size: 16px;
  font-weight: bold;
  color: #FF7D00;
  margin-bottom: 8px;
  display: block;
}

.goods-stock {
  font-size: 12px;
  color: #999;
}

.goods-ctrl {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ctrl-btn {
  width: 24px;
  height: 24px;
  line-height: 24px;
  padding: 0;
  margin: 0;
  font-size: 16px;
  border-radius: 50%;
  background: #F5F5F5;
  color: #333;
}

.ctrl-num {
  margin: 0 8px;
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.plus {
  color: #FF7D00;
}
</style>