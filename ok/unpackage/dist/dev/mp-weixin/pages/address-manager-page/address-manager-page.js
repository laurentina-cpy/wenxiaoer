"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      buildings: ["求真一", "求真二"],
      selectedBuilding: "",
      receiverName: "",
      phone: "",
      detailAddress: ""
    };
  },
  methods: {
    onBuildingChange(e) {
      this.selectedBuilding = this.buildings[e.detail.value];
    },
    saveAddress() {
      common_vendor.index.__f__("log", "at pages/address-manager-page/address-manager-page.vue:43", "保存地址信息", {
        building: this.selectedBuilding,
        name: this.receiverName,
        phone: this.phone,
        detail: this.detailAddress
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.selectedBuilding || "请选择楼栋"),
    b: $data.buildings,
    c: common_vendor.o((...args) => $options.onBuildingChange && $options.onBuildingChange(...args)),
    d: $data.receiverName,
    e: common_vendor.o(($event) => $data.receiverName = $event.detail.value),
    f: $data.phone,
    g: common_vendor.o(($event) => $data.phone = $event.detail.value),
    h: $data.detailAddress,
    i: common_vendor.o(($event) => $data.detailAddress = $event.detail.value),
    j: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-965fcd04"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address-manager-page/address-manager-page.js.map
