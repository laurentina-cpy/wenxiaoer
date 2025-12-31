const sequelize = require('../config/db');

// 导入所有模型
const User = require('../models/User');
const Admin = require('../models/Admin');
const Goods = require('../models/Goods');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Address = require('../models/Address');
const DeliveryPerson = require('../models/DeliveryPerson');
const OperationLog = require('../models/OperationLog');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步所有表结构（更新现有表结构）
    await User.sync({ alter: true });
    await Admin.sync({ alter: true });
    await Category.sync({ alter: true });
    await Supplier.sync({ alter: true });
    await Goods.sync({ alter: true });
    await Address.sync({ alter: true });
    await DeliveryPerson.sync({ alter: true });
    await Order.sync({ alter: true });
    await OrderItem.sync({ alter: true });
    await OperationLog.sync({ alter: true });

    console.log('数据库表结构同步完成！');

  } catch (error) {
    console.error('数据库同步失败:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();