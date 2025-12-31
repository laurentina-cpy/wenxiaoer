const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Address = sequelize.define('address', {
  address_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '地址ID'
  },
  user_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '用户ID'
  },
  building: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '宿舍楼（1-20栋）'
  },
  room: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '房间号'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    comment: '联系人姓名'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    comment: '联系人电话'
  },
  is_default: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否默认：1-是，0-否'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-有效，0-删除'
  }
}, {
  comment: '用户地址表'
});

// 关联关系
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Address;