const sequelize = require('../config/db');
const Admin = require('../models/Admin');
const { generateId } = require('../utils');
const { encryptPassword } = require('../utils/encryption');

async function initAdmin() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查是否已存在管理员
    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('管理员账户已存在');
      return;
    }

    // 创建默认超级管理员
    const { salt, hash } = encryptPassword('admin123');
    const admin = await Admin.create({
      admin_id: generateId(),
      username: 'admin',
      password_hash: hash,
      salt: salt,
      real_name: '系统管理员',
      role: 1,
      permissions: [
        'goods:view', 'goods:create', 'goods:update', 'goods:delete',
        'users:view', 'users:manage',
        'orders:view', 'orders:manage', 'orders:export',
        'categories:view', 'categories:create', 'categories:update', 'categories:delete',
        'suppliers:view', 'suppliers:create', 'suppliers:update', 'suppliers:delete', 'suppliers:manage',
        'delivery:view', 'delivery:audit', 'delivery:manage'
      ]
    });

    console.log('默认管理员账户创建成功:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('管理员ID:', admin.admin_id);

  } catch (error) {
    console.error('初始化管理员失败:', error);
  } finally {
    await sequelize.close();
  }
}

initAdmin();