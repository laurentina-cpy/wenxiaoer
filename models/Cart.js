const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Goods = require('./Goods');

const Cart = sequelize.define('cart', {
  cart_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '购物车ID'
  },
  user_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '用户ID'
  },
  goods_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '商品ID'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '数量'
  },
  selected: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否选中：1-是，0-否'
  }
}, {
  comment: '购物车表',
  indexes: [
    { unique: true, fields: ['user_id', 'goods_id'] }
  ]
});

// 关联关系
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Goods, { foreignKey: 'goods_id', as: 'goods' });

module.exports = Cart;