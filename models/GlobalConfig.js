const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const GlobalConfig = sequelize.define('global_config', {
  config_id: {
    type: DataTypes.STRING(64),
    primaryKey: true,
    defaultValue: () => uuidv4().replace(/-/g, ''),
    comment: '配置ID'
  },
  config_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '配置键'
  },
  config_value: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '配置值'
  },
  config_desc: {
    type: DataTypes.STRING(200),
    comment: '配置描述'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  comment: '全局配置表'
});

// 初始化配置数据
GlobalConfig.findOrCreate({
  where: { config_key: 'MIN_BUILDING' },
  defaults: { config_value: '1', config_desc: '最小楼栋号' }
});
GlobalConfig.findOrCreate({
  where: { config_key: 'MAX_BUILDING' },
  defaults: { config_value: '20', config_desc: '最大楼栋号' }
});
GlobalConfig.findOrCreate({
  where: { config_key: 'ORDER_PAY_TIMEOUT' },
  defaults: { config_value: '15', config_desc: '订单支付超时时间（分钟）' }
});

module.exports = GlobalConfig;