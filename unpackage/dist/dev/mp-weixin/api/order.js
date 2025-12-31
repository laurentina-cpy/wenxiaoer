"use strict";
const api_index = require("./index.js");
const getOrderList = (params) => {
  return api_index.request({
    url: "/api/order/list",
    method: "GET",
    data: params
  });
};
const cancelOrder = (orderId) => {
  return api_index.request({
    url: `/api/order/cancel/${orderId}`,
    method: "PATCH"
  });
};
exports.cancelOrder = cancelOrder;
exports.getOrderList = getOrderList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
