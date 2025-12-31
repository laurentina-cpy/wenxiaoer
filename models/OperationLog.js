const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OperationLog = sequelize.define('operation_log', {
  log_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '日志ID'
  },
  admin_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '操作管理员ID'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作模块'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '操作描述'
  },
  target_id: {
    type: DataTypes.STRING(32),
    comment: '操作目标ID'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    comment: 'IP地址'
  },
  user_agent: {
    type: DataTypes.STRING(500),
    comment: '用户代理'
  },
  request_data: {
    type: DataTypes.JSON,
    comment: '请求数据'
  }
}, {
  comment: '操作日志表',
  updatedAt: false
});

module.exports = OperationLog;