"use strict";
const common_vendor = require("../common/vendor.js");
const utils_token = require("../utils/token.js");
const request = (options) => {
  const baseUrl = "http://localhost:3000";
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: baseUrl + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        // 使用与后端一致的Bearer Token格式
        "Authorization": `Bearer ${utils_token.TokenManager.getToken()}`
      },
      success: (res) => {
        if (res.statusCode !== 200) {
          common_vendor.index.showToast({ title: "请求失败", icon: "none" });
          reject(res);
          return;
        }
        if (res.data.code !== 200) {
          common_vendor.index.showToast({ title: res.data.message || "请求失败", icon: "none" });
          reject(res.data);
          return;
        }
        resolve(res.data);
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
        reject(err);
      }
    });
  });
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/index.js.map
