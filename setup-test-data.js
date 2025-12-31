const sequelize = require('./config/db');
const Goods = require('./models/Goods');
const Category = require('./models/Category');
const Supplier = require('./models/Supplier');
const { generateId } = require('./utils');

async function setupTestData() {
  try {
    // 创建测试分类
    let category = await Category.findByPk('cat_test');
    if (!category) {
      category = await Category.create({
        category_id: 'cat_test',
        category_name: '测试分类',
        sort_order: 0,
        status: 1
      });
      console.log('测试分类创建成功:', category.category_id);
    }

    // 创建测试供应商
    let supplier = await Supplier.findByPk('sup_test');
    if (!supplier) {
      supplier = await Supplier.create({
        supplier_id: 'sup_test',
        name: '测试供应商',
        contact_phone: '13800138000',
        contact_address: '测试地址'
      });
      console.log('测试供应商创建成功:', supplier.supplier_id);
    }

    // 创建测试商品
    let goods = await Goods.findByPk('goods_test123');
    if (!goods) {
      goods = await Goods.create({
        goods_id: 'goods_test123',
        name: '测试商品',
        price: 99.99,
        stock: 100,
        sales_count: 0,
        description: '这是一个测试商品',
        image_url: 'https://example.com/product.jpg',
        category_id: 'cat_test',
        supplier_id: 'sup_test',
        status: 1
      });
      console.log('测试商品创建成功:', goods.goods_id);
    } else {
      console.log('测试商品已存在:', goods.goods_id);
    }
    
  } catch (error) {
    console.error('设置测试数据失败:', error);
  }
}

setupTestData();