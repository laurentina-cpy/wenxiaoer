<template>
  <view class="address-page">
    <!-- 页面标题栏（区分「地址管理」和「地址选择」模式） -->
    <view class="nav-bar">
      <text class="nav-title">{{ isSelectMode ? '选择收货地址' : '收货地址' }}</text>
      <!-- 管理模式：新增按钮 -->
      <button class="add-btn" @click="openAddForm" v-if="!isSelectMode">+ 新增地址</button>
      <!-- 选择模式：取消按钮 -->
      <button class="cancel-btn" @click="goBack" v-if="isSelectMode">取消</button>
    </view>

    <!-- 选择模式：确认按钮（默认地址自动选中后可直接确认） -->
    <view class="confirm-bar" v-if="isSelectMode && selectedIndex !== -1">
      <button class="confirm-btn" @click="confirmSelect">确认选择该地址</button>
    </view>

    <!-- 地址表单（新增/编辑共用） -->
    <view class="address-form" v-if="formVisible">
      <view class="form-item">
        <text class="label">姓名</text>
        <input v-model="form.name" placeholder="请输入收货人姓名" class="input" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input v-model="form.phone" placeholder="请输入手机号" class="input" type="number" />
      </view>
      <view class="form-item">
        <text class="label">省市区</text>
        <picker @change="onRegionChange" :value="form.region" mode="region">
          <view class="picker-text">{{ form.region.join("") }}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <input v-model="form.detail" placeholder="请输入详细地址（如楼栋、房间号）" class="input" />
      </view>
      <view class="form-item checkbox-wrap">
        <checkbox :checked="form.isDefault" class="checkbox" @click="toggleDefault" />
        <text class="checkbox-text">设为默认地址</text>
      </view>
      <button class="save-btn" @click="saveAddress">
        {{ isEdit ? "保存修改" : "保存地址" }}
      </button>
      <button class="close-form-btn" @click="closeForm">取消</button>
    </view>

    <!-- 地址列表 -->
    <scroll-view class="address-scroll" scroll-y v-if="!formVisible">
      <view 
        class="address-item" 
        v-for="(item, index) in addressList" 
        :key="index"
        @click="selectAddress(index)"
        :class="{ selected: selectedIndex === index && isSelectMode }"
      >
        <view class="address-header">
          <text class="user-name">{{ item.name }}</text>
          <text class="user-phone">{{ item.phone }}</text>
          <text class="default-tag" v-if="item.isDefault">默认地址</text>
        </view>
        <view class="address-content">
          <text class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
        </view>
        <!-- 仅地址管理模式显示操作按钮 -->
        <view class="address-operate" v-if="!isSelectMode">
          <button class="edit-btn" @click.stop="openEditForm(index)">编辑</button>
          <button class="delete-btn" @click.stop="deleteAddress(index)">删除</button>
          <button class="default-btn" @click.stop="setDefaultAddress(index)" v-if="!item.isDefault">设为默认</button>
        </view>
        <!-- 地址选择模式显示选中图标（用文本替代图片） -->
        <text 
          class="selected-icon" 
          v-if="selectedIndex === index && isSelectMode"
        >✓</text>
      </view>

      <!-- 空地址提示（移除图片依赖） -->
      <view class="empty-address" v-if="addressList.length === 0">
        <text class="empty-text">{{ isSelectMode ? '暂无收货地址，请先添加' : '暂无收货地址~' }}</text>
        <button class="add-first-btn" @click="openAddForm">添加地址</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
// 核心修复：从 uni-app 导入页面生命周期钩子，而非 vue
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

// 判断是否为「地址选择模式」（从结算页/下单页跳转）
const isSelectMode = ref(false);
// 选中的地址索引
const selectedIndex = ref(-1);
// 表单状态
const formVisible = ref(false);
const isEdit = ref(false);
// 表单数据
const form = ref({
  name: "",
  phone: "",
  region: ["浙江省", "杭州市", "钱塘区"],
  detail: "",
  isDefault: false
});
const editIndex = ref(-1);

// 地址列表（本地存储持久化）
const addressList = ref(uni.getStorageSync('addressList') || [
  {
    name: '城院学生',
    phone: '13812345678',
    province: '浙江省',
    city: '杭州市',
    district: '钱塘区',
    detail: '求真1幢,302室',
    isDefault: true
  },
  {
    name: '城院学生',
    phone: '13987654321',
    province: '浙江省',
    city: '杭州市',
    district: '钱塘区',
    detail: '求真2幢,201室',
    isDefault: false
  }
]);

onLoad((options) => {
  if (options.selectMode === '1') {
    isSelectMode.value = true;
    const defaultIndex = addressList.value.findIndex(item => item.isDefault);
    if (defaultIndex !== -1) {
      selectedIndex.value = defaultIndex;
      // 核心优化：自动传递默认地址到下单页
      const defaultAddress = addressList.value[defaultIndex];
      uni.$emit('selectAddress', defaultAddress);
    }
  }
});

onShow(() => {
  const storedAddresses = uni.getStorageSync('addressList');
  if (storedAddresses) {
    addressList.value = storedAddresses;
    if (isSelectMode.value) {
      const defaultIndex = addressList.value.findIndex(item => item.isDefault);
      if (defaultIndex !== -1) {
        selectedIndex.value = defaultIndex;
        // 页面刷新后重新传递默认地址
        const defaultAddress = addressList.value[defaultIndex];
        uni.$emit('selectAddress', defaultAddress);
      }
    }
  }
});

// 选择地址（仅选择模式生效）
const selectAddress = (index) => {
  if (!isSelectMode.value) return;
  selectedIndex.value = index;
  const selectedAddress = addressList.value[index];
  // 手动选择地址时立即传递
  uni.$emit('selectAddress', selectedAddress);
};

// 确认选择地址（选择模式专用）
const confirmSelect = () => {
  if (selectedIndex.value === -1) {
    return uni.showToast({ title: '请先选择地址', icon: 'none' });
  }
  const selectedAddress = addressList.value[selectedIndex.value];
  uni.$emit('selectAddress', selectedAddress);
  uni.navigateBack();
};

// 打开新增地址表单
const openAddForm = () => {
  form.value = {
    name: "",
    phone: "",
    region: ["浙江省", "杭州市", "钱塘区"],
    detail: "",
    isDefault: false
  };
  isEdit.value = false;
  formVisible.value = true;
};

// 打开编辑地址表单
const openEditForm = (index) => {
  const item = addressList.value[index];
  form.value = {
    name: item.name,
    phone: item.phone,
    region: [item.province, item.city, item.district],
    detail: item.detail,
    isDefault: item.isDefault
  };
  editIndex.value = index;
  isEdit.value = true;
  formVisible.value = true;
};

// 关闭表单
const closeForm = () => {
  formVisible.value = false;
};

// 省市区选择
const onRegionChange = (e) => {
  form.value.region = e.detail.value;
};

// 切换默认地址
const toggleDefault = () => {
  form.value.isDefault = !form.value.isDefault;
};

// 保存地址（新增/编辑）
const saveAddress = () => {
  // 基础校验
  if (!form.value.name) return uni.showToast({ title: "请输入姓名", icon: "none" });
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) return uni.showToast({ title: "请输入正确手机号", icon: "none" });
  if (!form.value.detail) return uni.showToast({ title: "请输入详细地址", icon: "none" });

  const newAddress = {
    name: form.value.name,
    phone: form.value.phone,
    province: form.value.region[0],
    city: form.value.region[1],
    district: form.value.region[2],
    detail: form.value.detail,
    isDefault: form.value.isDefault
  };

  // 处理默认地址
  if (newAddress.isDefault) {
    addressList.value.forEach(item => item.isDefault = false);
  }

  if (isEdit.value) {
    addressList.value[editIndex.value] = newAddress;
    uni.showToast({ title: "修改成功", icon: "success" });
  } else {
    addressList.value.push(newAddress);
    uni.showToast({ title: "添加成功", icon: "success" });
  }

  uni.setStorageSync('addressList', addressList.value);
  formVisible.value = false;

  // 新增/编辑后若为选择模式，自动选中新地址并传递
  if (isSelectMode.value) {
    const newIndex = addressList.value.findIndex(item => item.name === newAddress.name && item.phone === newAddress.phone);
    if (newIndex !== -1) {
      selectedIndex.value = newIndex;
      uni.$emit('selectAddress', newAddress);
    }
  }
};

// 删除地址
const deleteAddress = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        const isDefault = addressList.value[index].isDefault;
        addressList.value.splice(index, 1);
        if (isDefault && addressList.value.length > 0) {
          addressList.value[0].isDefault = true;
          // 删除默认地址后，自动选中新默认地址并传递
          if (isSelectMode.value) {
            selectedIndex.value = 0;
            uni.$emit('selectAddress', addressList.value[0]);
          }
        } else if (isSelectMode.value && selectedIndex.value === index) {
          selectedIndex.value = addressList.value.length > 0 ? 0 : -1;
          if (addressList.value.length > 0) {
            uni.$emit('selectAddress', addressList.value[0]);
          } else {
            uni.$emit('selectAddress', null);
          }
        }
        uni.setStorageSync('addressList', addressList.value);
        uni.showToast({ title: '删除成功', icon: 'success' });
      }
    }
  });
};

// 设为默认地址
const setDefaultAddress = (index) => {
  addressList.value.forEach(item => item.isDefault = false);
  addressList.value[index].isDefault = true;
  uni.setStorageSync('addressList', addressList.value);
  uni.showToast({ title: '已设为默认地址', icon: 'success' });
  if (isSelectMode.value) {
    selectedIndex.value = index;
    // 设为默认后立即传递地址到下单页
    uni.$emit('selectAddress', addressList.value[index]);
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
/* 页面基础样式 */
.address-page {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 20rpx;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}
.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.add-btn, .cancel-btn {
  font-size: 28rpx;
  color: #FF7D00;
  background: transparent;
  border: none;
  padding: 10rpx 20rpx;
}
.cancel-btn {
  color: #333;
}

/* 确认按钮栏 */
.confirm-bar {
  padding: 15rpx 24rpx;
  background-color: #fff;
}
.confirm-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #FF7D00;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 地址表单 */
.address-form {
  padding: 20rpx;
  background-color: #FFFFFF;
  margin: 15rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.08);
}
.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}
.checkbox-wrap {
  flex-direction: row;
  align-items: center;
}
.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}
.input, .picker-text {
  font-size: 26rpx;
  color: #666;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #eee;
}
.checkbox {
  transform: scale(1.2);
  margin-right: 10rpx;
}
.checkbox-text {
  font-size: 26rpx;
  color: #666;
}
.save-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #FF7D00;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  margin-top: 20rpx;
}
.close-form-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #fff;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: 1rpx solid #eee;
  margin-top: 10rpx;
}

/* 地址列表滚动区域（修复高度） */
.address-scroll {
  height: calc(100vh - 88rpx - (isSelectMode && selectedIndex !== -1 ? 110rpx : 0));
  width: 100%;
  padding-bottom: 20rpx;
}

/* 地址项 */
.address-item {
  background-color: #fff;
  margin: 15rpx;
  border-radius: 12rpx;
  padding: 20rpx;
  position: relative;
  transition: background-color 0.2s;
}
.address-item.selected {
  background-color: #FFF7E6;
  border: 2rpx solid #FF7D00;
}
.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.user-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-right: 20rpx;
}
.user-phone {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}
.default-tag {
  font-size: 22rpx;
  color: #FF7D00;
  background-color: #FFF7E6;
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
}
.address-content {
  margin-bottom: 15rpx;
}
.address-detail {
  font-size: 26rpx;
  color: #333;
  line-height: 40rpx;
}

/* 地址操作按钮（确保显示） */
.address-operate {
  display: flex;
  justify-content: flex-end;
  gap: 15rpx;
}
.edit-btn, .delete-btn, .default-btn {
  font-size: 24rpx;
  padding: 0 15rpx;
  height: 50rpx;
  line-height: 50rpx;
  border-radius: 25rpx;
  background: #fff;
}
.edit-btn {
  color: #666;
  border: 1rpx solid #ccc;
}
.delete-btn {
  color: #FF4D4F;
  border: 1rpx solid #FF4D4F;
}
.default-btn {
  color: #FF7D00;
  border: 1rpx solid #FF7D00;
}

/* 选中图标（文本替代） */
.selected-icon {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 36rpx;
  color: #FF7D00;
  font-weight: bold;
}

/* 空地址提示 */
.empty-address {
  text-align: center;
  padding: 150rpx 0;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 40rpx;
}
.add-first-btn {
  width: 220rpx;
  height: 68rpx;
  line-height: 68rpx;
  background: #FF7D00;
  color: #fff;
  border-radius: 34rpx;
  font-size: 28rpx;
  border: none;
}
</style>