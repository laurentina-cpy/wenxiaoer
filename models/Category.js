const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('category', {
  category_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '分类ID'
  },
  category_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序序号'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  comment: '商品分类表'
});

module.exports = Category;