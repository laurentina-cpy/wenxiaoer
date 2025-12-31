"use strict";
const api_index = require("./index.js");
const getGoodsCategories = () => {
  return api_index.request({
    url: "/api/goods/categories",
    method: "GET"
  });
};
exports.getGoodsCategories = getGoodsCategories;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/goods.js.map
