const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');
const Supplier = require('./Supplier');

const Goods = sequelize.define('goods', {
  goods_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '商品唯一标识'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价（精确到分）'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '库存数量'
  },
  category_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '分类ID'
  },
  img_url: {
    type: DataTypes.STRING(255),
    comment: '商品图片链接'
  },
  shelf_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '上架状态：0-未上架，1-已上架'
  },
  specification: {
    type: DataTypes.STRING(100),
    comment: '规格'
  },
  supplier_id: {
    type: DataTypes.STRING(32),
    comment: '供应商ID'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '商品描述'
  },
  sales_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '销量'
  }
}, {
  comment: '商品表'
});

// 关联关系
Goods.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Goods.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

module.exports = Goods;