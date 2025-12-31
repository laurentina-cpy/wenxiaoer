"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/order/order.js";
  "./pages/mine/mine.js";
  "./pages/address/address.js";
  "./pages/checkout/checkout.js";
  "./pages/login/login.js";
  "./pages/evaluate/evaluate.js";
  "./pages/evaluate/evaluate-list.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
      common_vendor.index.checkSession({
        fail() {
          common_vendor.index.redirectTo({ url: "/pages/login/login" });
        }
      });
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:15", "App Show");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  pinia.use(common_vendor.src_default);
  app.use(pinia);
  return {
    app,
    pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
