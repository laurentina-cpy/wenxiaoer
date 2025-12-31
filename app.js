const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

const userRoutes = require('./routes/user');
const goodsRoutes = require('./routes/goods');
const orderRoutes = require('./routes/order');

// 管理员路由
const adminRoutes = require('./routes/admin');
const adminGoodsRoutes = require('./routes/admin/goods');
const adminUsersRoutes = require('./routes/admin/users');
const adminOrdersRoutes = require('./routes/admin/orders');
const adminCategoriesRoutes = require('./routes/admin/categories');
const adminSuppliersRoutes = require('./routes/admin/suppliers');
const adminDeliveryRoutes = require('./routes/admin/delivery');
const adminDashboardRoutes = require('./routes/admin/dashboard');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 记录所有请求
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// 静态文件服务
app.use(express.static('public'));

// 根路由 - API文档页面
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 路由注册
app.use('/api/user', userRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/order', orderRoutes);

// 管理员路由
app.use('/api/admin', adminRoutes);
app.use('/api/admin/goods', adminGoodsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/suppliers', adminSuppliersRoutes);
app.use('/api/admin/delivery', adminDeliveryRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// 仅验证数据库连接，不做任何表同步
sequelize.authenticate()
  .then(() => {
    console.log('MySQL连接成功');
    // 直接启动服务，不执行任何表结构修改
    app.listen(PORT, () => {
      console.log(`后端服务运行在 http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MySQL连接失败:', err));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('全局错误处理器捕获错误:', err.stack);
  console.error('请求URL:', req.url);
  console.error('请求方法:', req.method);
  console.error('请求体:', JSON.stringify(req.body));
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});