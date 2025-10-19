"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      tabs: ["全部", "待付款", "待配送"],
      active: 0,
      list: []
      // 先空，后续接口赋值
    };
  },
  methods: {
    switchTab(idx) {
      this.active = idx;
      this.list = [];
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (t, i, i0) => {
      return {
        a: common_vendor.t(t),
        b: i,
        c: common_vendor.n($data.active === i && "active"),
        d: common_vendor.o(($event) => $options.switchTab(i), i)
      };
    }),
    b: $data.list.length
  }, $data.list.length ? {
    c: common_vendor.f($data.list, (item, idx, i0) => {
      return {
        a: common_vendor.t(item.no),
        b: common_vendor.t(item.status),
        c: idx
      };
    })
  } : {
    d: common_assets._imports_0
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-93207a4f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/order.js.map
