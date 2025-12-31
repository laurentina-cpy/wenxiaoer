const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
  user_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '用户唯一标识'
  },
  openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: '微信OpenID'
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '昵称'
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    comment: '头像链接'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '手机号（完整）'
  },
  phone_masked: {
    type: DataTypes.STRING(20),
    comment: '脱敏手机号'
  },
  last_login_time: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-正常，0-禁用'
  }
}, {
  comment: '用户表'
});

module.exports = User;