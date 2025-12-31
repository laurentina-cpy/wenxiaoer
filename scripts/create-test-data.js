const sequelize = require('../config/db');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Goods = require('../models/Goods');
const { generateId } = require('../utils');

async function createTestData() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 创建测试分类
    const categories = [
      { category_id: generateId(), category_name: '水果', sort_order: 1 },
      { category_id: generateId(), category_name: '饮料', sort_order: 2 },
      { category_id: generateId(), category_name: '零食', sort_order: 3 },
      { category_id: generateId(), category_name: '文具', sort_order: 4 },
      { category_id: generateId(), category_name: '日用品', sort_order: 5 }
    ];

    for (const category of categories) {
      await Category.findOrCreate({
        where: { category_name: category.category_name },
        defaults: category
      });
    }
    console.log('测试分类创建完成');

    // 创建测试供应商
    const suppliers = [
      {
        supplier_id: generateId(),
        name: '阳光水果店',
        contact: '13800138001',
        license_number: 'LS2024001',
        address: '校商业街A区'
      },
      {
        supplier_id: generateId(),
        name: '校园超市',
        contact: '13800138002',
        license_number: 'LS2024002',
        address: '校商业街B区'
      }
    ];

    for (const supplier of suppliers) {
      await Supplier.findOrCreate({
        where: { license_number: supplier.license_number },
        defaults: supplier
      });
    }
    console.log('测试供应商创建完成');

    // 获取创建的分类和供应商
    const fruitCategory = await Category.findOne({ where: { category_name: '水果' } });
    const drinkCategory = await Category.findOne({ where: { category_name: '饮料' } });
    const snackCategory = await Category.findOne({ where: { category_name: '零食' } });
    
    const sunSupplier = await Supplier.findOne({ where: { name: '阳光水果店' } });
    const marketSupplier = await Supplier.findOne({ where: { name: '校园超市' } });

    // 创建测试商品
    const goods = [
      {
        goods_id: generateId(),
        name: '苹果',
        price: 5.50,
        stock: 100,
        category_id: fruitCategory.category_id,
        supplier_id: sunSupplier.supplier_id,
        description: '新鲜红富士苹果',
        shelf_status: 1,
        sales_count: 50
      },
      {
        goods_id: generateId(),
        name: '香蕉',
        price: 3.50,
        stock: 80,
        category_id: fruitCategory.category_id,
        supplier_id: sunSupplier.supplier_id,
        description: '优质香蕉',
        shelf_status: 1,
        sales_count: 30
      },
      {
        goods_id: generateId(),
        name: '可口可乐',
        price: 3.00,
        stock: 200,
        category_id: drinkCategory.category_id,
        supplier_id: marketSupplier.supplier_id,
        description: '330ml可口可乐',
        shelf_status: 1,
        sales_count: 100
      },
      {
        goods_id: generateId(),
        name: '薯片',
        price: 8.00,
        stock: 50,
        category_id: snackCategory.category_id,
        supplier_id: marketSupplier.supplier_id,
        description: '乐事原味薯片',
        shelf_status: 1,
        sales_count: 25
      }
    ];

    for (const item of goods) {
      await Goods.findOrCreate({
        where: { goods_id: item.goods_id },
        defaults: item
      });
    }
    console.log('测试商品创建完成');

    console.log('所有测试数据创建完成！');

  } catch (error) {
    console.error('创建测试数据失败:', error);
  } finally {
    await sequelize.close();
  }
}

createTestData();