const { Sequelize } = require('sequelize');

// 连接MySQL
const sequelize = new Sequelize('xcx', 'root', 'yang2020', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: false, // 关闭SQL日志
  define: {
    timestamps: true, // 自动生成create_time/update_time
    createdAt: 'create_time', // 映射Sequelize的createdAt到create_time
    updatedAt: 'update_time', // 映射Sequelize的updatedAt到update_time
    underscored: true, // 启用下划线命名（匹配数据库字段）
    freezeTableName: true // 禁用表名复数化
  }
});

// 测试连接
sequelize.authenticate()
  .then(() => console.log('MySQL连接成功'))
  .catch(err => console.error('MySQL连接失败:', err));

module.exports = sequelize;