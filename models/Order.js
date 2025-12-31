const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const DeliveryPerson = require('./DeliveryPerson');
const Address = require('./Address');

const Order = sequelize.define('order', {
  order_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '订单唯一标识'
  },
  user_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '下单用户ID'
  },
  delivery_person_id: {
    type: DataTypes.STRING(32),
    comment: '配送员ID'
  },
  order_number: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单编号(CXY+日期+6位随机数)'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总金额'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '订单状态：0-待支付，1-已支付，2-配送中，3-已送达，4-已完成，5-已取消，6-已退款'
  },
  address_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '收货地址ID'
  },
  delivery_address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '收货地址（冗余存储）'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  refund_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '退款状态：0-无退款，1-待审核，2-已退款，3-审核驳回'
  },
  pay_time: {
    type: DataTypes.DATE,
    comment: '支付时间'
  },
  finish_time: {
    type: DataTypes.DATE,
    comment: '完成时间'
  }
}, {
  comment: '订单表'
});

// 关联关系
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(DeliveryPerson, { foreignKey: 'delivery_person_id', as: 'deliveryPerson' });
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Order.hasMany(require('./OrderItem'), { foreignKey: 'order_id', as: 'orderItems' });

module.exports = Order;