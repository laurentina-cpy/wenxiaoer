const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('admin', {
  admin_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '管理员ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码哈希'
  },
  salt: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '密码盐值'
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '手机号'
  },
  role: {
    type: DataTypes.TINYINT,
    defaultValue: 2,
    comment: '角色：1-超级管理员，2-普通管理员'
  },
  permissions: {
    type: DataTypes.JSON,
    comment: '权限列表'
  },
  last_login_time: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  },
  last_login_ip: {
    type: DataTypes.STRING(50),
    comment: '最后登录IP'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-正常，0-禁用'
  }
}, {
  comment: '管理员表'
});

module.exports = Admin;