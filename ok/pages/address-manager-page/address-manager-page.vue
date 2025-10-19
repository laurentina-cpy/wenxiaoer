<template>
  <view class="container">
    <view class="form-item">
      <text>所在楼栋/宿舍</text>
      <picker mode="selector" :range="buildings" @change="onBuildingChange">
        <view class="picker">
          {{ selectedBuilding || '请选择楼栋' }}
        </view>
      </picker>
    </view>
    <view class="form-item">
      <text>收货人</text>
      <input type="text" placeholder="请输入收货人姓名" v-model="receiverName" />
    </view>
    <view class="form-item">
      <text>手机号</text>
      <input type="number" placeholder="收货人手机" v-model="phone" />
    </view>
    <view class="form-item">
      <text>详细门牌号</text>
      <input type="text" placeholder="请填写详细门牌号" v-model="detailAddress" />
    </view>
    <button class="save-button" @click="saveAddress">保存</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      buildings: ['求真一', '求真二'],
      selectedBuilding: '',
      receiverName: '',
      phone: '',
      detailAddress: ''
    };
  },
  methods: {
    onBuildingChange(e) {
      this.selectedBuilding = this.buildings[e.detail.value];
    },
    saveAddress() {
      console.log('保存地址信息', {
        building: this.selectedBuilding,
       name: this.receiverName,
       phone: this.phone,
       detail: this.detailAddress
      });
      // 这里可以添加保存地址的逻辑，比如发送到服务器
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.form-item {
  margin-bottom: 15px;
}
.picker {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
.save-button {
  width: 100%;
  padding: 15px;
  background-color: #6a1b9a;
  color: white;
  border: none;
  border-radius: 5px;
}
</style>
