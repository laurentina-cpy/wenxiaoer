const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');
const Goods = require('./Goods');

const OrderItem = sequelize.define('order_item', {
  order_item_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '订单项ID'
  },
  order_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '订单ID'
  },
  goods_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '商品ID'
  },
  goods_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  goods_image: {
    type: DataTypes.STRING(255),
    comment: '商品图片'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总价'
  }
}, {
  comment: '订单项表'
});

// 关联关系 (延迟加载以避免循环依赖)
setTimeout(() => {
  const Order = require('./Order');
  const Goods = require('./Goods');
  
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Goods, { foreignKey: 'goods_id', as: 'goods' });
}, 0);

module.exports = OrderItem;