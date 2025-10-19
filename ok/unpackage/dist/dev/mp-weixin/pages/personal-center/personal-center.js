"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      menuItems: ["地址管理", "隐私政策", "用户协议", "消费者权益"]
    };
  },
  methods: {
    navigateToPage(index) {
      const paths = [
        "/pages/address-manager-page/address-manager-page",
        "/pages/privacy/privacy",
        "/pages/agreement/agreement",
        "/pages/consumer/consumer"
      ];
      common_vendor.index.navigateTo({ url: paths[index] });
    },
    logout() {
      common_vendor.index.__f__("log", "at pages/personal-center/personal-center.vue:40", "退出登录");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.f($data.menuItems, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index,
        c: common_vendor.o(($event) => $options.navigateToPage(index), index)
      };
    }),
    c: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e2fdecdd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/personal-center/personal-center.js.map
