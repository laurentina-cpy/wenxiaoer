<template>
  <view class="container">
    <scroll-view scroll-y class="content">
      <view class="header">
        <text class="title">城小二隐私保护政策</text>
        <text class="date">发布时间：2025年9月30日</text>
      </view>

      <view class="section">
        <text class="section-title">一、我们为何收集您的信息</text>
        <text class="section-text">
          城小二（以下简称“我们”）仅在你使用小程序下单、收货、客服沟通等功能时，收集必要的个人信息，用于完成订单履约、身份验证与售后服务。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、我们收集哪些信息</text>
        <text class="section-text">
          - 基本信息：收货人姓名、手机号、宿舍楼栋与门牌号\n
          - 订单信息：商品内容、订单编号、支付金额\n
          - 设备信息：微信OpenID、登录状态（用于身份识别）
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、信息如何使用</text>
        <text class="section-text">
          - 完成订单配送与售后处理\n
          - 提供客服支持（如退单、补货）\n
          - 保障交易安全，防止恶意下单
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、信息是否共享</text>
        <text class="section-text">
          我们不会将你的个人信息共享给任何第三方，除非：\n
          - 你明确同意\n
          - 法律法规要求\n
          - 为完成配送履约而委托的校内配送员（仅显示必要信息）
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、信息保存期限</text>
        <text class="section-text">
          - 订单完成后保留30天，用于售后服务\n
          - 你可在“我的”页面手动删除收货地址\n
          - 注销账号后，我们将删除所有关联信息
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、你的权利</text>
        <text class="section-text">
          - 查看与修改收货信息\n
          - 删除地址或注销账户\n
          - 拒绝授权位置或相册（部分功能可能受限）
        </text>
      </view>

      <view class="section">
        <text class="section-title">七、联系我们</text>
        <text class="section-text">
          如有疑问，请联系客服微信：chengxiao2_kefu\n
          或拨打客服电话：123-4567-8901（工作日 9:00-21:00）
        </text>
      </view>

      <view class="footer">
        <text class="footer-text">城小二团队 保留对本政策的最终解释权</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: "PrivacyPage"
}
</script>

<style scoped>
.container {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding: 20rpx;
}

.content {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.date {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #444;
  margin-bottom: 10rpx;
}

.section-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.footer {
  margin-top: 60rpx;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #aaa;
}
</style>
