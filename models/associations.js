const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Goods = require('./Goods');

// 设置模型关联
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Goods, { foreignKey: 'goods_id', as: 'goods' });

module.exports = {
  Order,
  OrderItem,
  Goods
};