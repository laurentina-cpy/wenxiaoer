const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Supplier = sequelize.define('supplier', {
  supplier_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '供应商ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '供应商名称'
  },
  contact: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系方式'
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '食品经营许可证编号'
  },
  license_image: {
    type: DataTypes.STRING(255),
    comment: '许可证照片'
  },
  address: {
    type: DataTypes.STRING(200),
    comment: '地址'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-合作中，0-已终止'
  }
}, {
  comment: '供应商表'
});

module.exports = Supplier;