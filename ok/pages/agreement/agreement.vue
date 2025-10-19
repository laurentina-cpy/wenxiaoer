<template>
  <scroll-view scroll-y class="container">
    <view class="header">
      <text class="title">城小二用户协议</text>
      <text class="date">生效时间：2025年9月30日</text>
    </view>

    <view class="section">
      <text class="section-title">1. 接受条款</text>
      <text class="section-text">
        使用“城小二”小程序（以下简称“本服务”），即表示您已阅读并同意本用户协议。如您不同意，请停止使用。
      </text>
    </view>

    <view class="section">
      <text class="section-title">2. 服务内容</text>
      <text class="section-text">
        本服务为校园用户提供宿舍楼内零食配送服务，包括浏览商品、下单、支付、配送等功能。我们努力确保信息准确，但价格、库存等信息可能因系统延迟略有差异。
      </text>
    </view>

    <view class="section">
      <text class="section-title">3. 用户账号</text>
      <text class="section-text">
        您需使用微信授权登录，并填写真实宿舍楼、手机号等信息。请妥善保管账号信息，如发现异常请及时联系客服。
      </text>
    </view>

    <view class="section">
      <text class="section-title">4. 订单与支付</text>
      <text class="section-text">
        下单即视为购买意向，订单信息将推送至对应楼长进行配送。支持微信支付，支付过程由微信官方保障安全。
      </text>
    </view>

    <view class="section">
      <text class="section-title">5. 配送服务</text>
      <text class="section-text">
        配送由楼长或校内兼职人员完成，通常于下单后10分钟内送达。遇高峰期、恶劣天气等可能延迟，敬请谅解。
      </text>
    </view>

    <view class="section">
      <text class="section-title">6. 用户行为</text>
      <text class="section-text">
        禁止恶意下单、虚假收货、刷单等行为。我们有权对异常账号进行限制或封禁处理。
      </text>
    </view>

    <view class="section">
      <text class="section-title">7. 知识产权</text>
      <text class="section-text">
        本服务界面、图标、代码等内容版权归“城小二”团队所有，未经许可不得擅自复制、修改或用于商业用途。
      </text>
    </view>

    <view class="section">
      <text class="section-title">8. 免责声明</text>
      <text class="section-text">
        因不可抗力（如系统故障、网络中断、校园封闭等）导致服务中断或订单延误，我们将尽力协调，但不承担赔偿责任。
      </text>
    </view>

    <view class="section">
      <text class="section-title">9. 协议变更</text>
      <text class="section-text">
        我们可根据运营需要更新本协议，更新后的内容将在小程序内公示，继续使用即视为接受。
      </text>
    </view>

    <view class="section">
      <text class="section-title">10. 法律适用与争议解决</text>
      <text class="section-text">
        本协议适用中华人民共和国法律。如发生争议，双方应协商解决，协商不成的，任一方可向“城小二”运营方所在地法院提起诉讼。
      </text>
    </view>

    <view class="footer">
      <text class="footer-text">城小二团队保留对本协议最终解释权</text>
    </view>
  </scroll-view>
</template>

<script>
export default {
  name: "AgreementPage"
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
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
