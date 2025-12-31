# 城小二管理系统后端 - 快速开始指南

## 项目概述

基于原有的城小二校内外送小程序后端，新增了完整的管理系统API，支持对货物、使用者、订单等内容进行全面管理。

## 环境要求

- Node.js 14+
- MySQL 5.7+
- npm 或 yarn

## 安装步骤

### 1. 安装依赖
```bash
cd "chengxiaoer-backend test"
npm install
```

### 2. 配置数据库

编辑 `config/db.js` 文件，修改数据库连接信息：
```javascript
const sequelize = new Sequelize('数据库名', '用户名', '密码', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  // ...
});
```

### 3. 初始化数据库

确保MySQL数据库已创建，然后运行初始化脚本：

```bash
# 创建默认管理员账户
npm run init-admin

# 创建测试数据（可选）
npm run create-test-data
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动

## 默认账户

系统会创建一个默认管理员账户：
- 用户名：`admin`
- 密码：`admin123`

## 主要功能模块

### 🏪 商品管理
- ✅ 商品列表查询（支持分页、搜索、筛选）
- ✅ 创建/编辑/删除商品
- ✅ 商品上架/下架管理
- ✅ 库存管理

### 👥 用户管理
- ✅ 用户列表查询
- ✅ 用户详情查看
- ✅ 用户状态管理（启用/禁用）
- ✅ 用户订单历史

### 📦 订单管理
- ✅ 订单列表查询（多条件筛选）
- ✅ 订单详情查看
- ✅ 订单状态更新
- ✅ 订单统计分析
- ✅ 订单导出功能

### 🏷️ 分类管理
- ✅ 分类CRUD操作
- ✅ 分类排序
- ✅ 分类状态管理

### 🚚 供应商管理
- ✅ 供应商信息管理
- ✅ 供应商状态控制
- ✅ 供应商商品关联

### 🛵 配送员管理
- ✅ 配送员信息管理
- ✅ 配送员审核流程
- ✅ 配送统计功能

### 📊 数据统计
- ✅ 仪表板统计
- ✅ 销售趋势分析
- ✅ 热门商品排行
- ✅ 实时动态展示

## API使用示例

### 1. 管理员登录
```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 2. 获取商品列表
```bash
GET /api/admin/goods/list?page=1&limit=10&keyword=苹果
Authorization: Bearer <token>
```

### 3. 创建商品
```bash
POST /api/admin/goods/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新商品",
  "price": 10.00,
  "stock": 100,
  "category_id": "xxx",
  "description": "商品描述"
}
```

### 4. 获取仪表板统计
```bash
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```

## 权限系统

系统采用基于角色的权限控制（RBAC）：

### 角色类型
- **超级管理员 (role: 1)**: 拥有所有权限
- **普通管理员 (role: 2)**: 拥有分配的特定权限

### 权限列表
- `goods:*` - 商品管理相关权限
- `users:*` - 用户管理相关权限
- `orders:*` - 订单管理相关权限
- `categories:*` - 分类管理相关权限
- `suppliers:*` - 供应商管理相关权限
- `delivery:*` - 配送员管理相关权限

## 文件结构

```
chengxiaoer-backend test/
├── app.js                      # 主应用入口
├── config/
│   └── db.js                   # 数据库配置
├── models/                     # 数据模型
│   ├── Admin.js               # 管理员模型
│   ├── User.js                # 用户模型
│   ├── Goods.js               # 商品模型
│   ├── Order.js               # 订单模型
│   └── ...                    # 其他模型
├── routes/                     # 路由文件
│   ├── admin.js               # 管理员认证
│   └── admin/                 # 管理员功能模块
│       ├── goods.js           # 商品管理
│       ├── users.js           # 用户管理
│       ├── orders.js          # 订单管理
│       ├── categories.js      # 分类管理
│       ├── suppliers.js       # 供应商管理
│       ├── delivery.js        # 配送员管理
│       └── dashboard.js       # 仪表板
├── utils/                      # 工具函数
│   ├── auth.js                # 权限验证
│   ├── encryption.js          # 密码加密
│   └── index.js               # 通用工具
├── scripts/                    # 脚本文件
│   ├── init-admin.js          # 初始化管理员
│   └── create-test-data.js    # 创建测试数据
└── ADMIN_README.md            # 详细文档
```

## 开发建议

### 1. 使用Postman测试
推荐使用Postman等API测试工具来测试各个接口，记得设置正确的Authorization头。

### 2. 查看日志
开发过程中可以启用SQL日志来调试：
```javascript
// config/db.js
logging: console.log,
```

### 3. 错误处理
所有API都包含完善的错误处理，会返回标准的错误码和错误信息。

## 安全特性

- ✅ JWT Token认证
- ✅ 密码BCrypt加密
- ✅ 权限中间件验证
- ✅ SQL注入防护
- ✅ 请求参数验证

## 常见问题

### Q: 如何修改管理员密码？
A: 可以直接运行 `npm run init-admin` 来重置默认管理员，或者通过数据库直接修改。

### Q: 如何添加新的权限？
A: 在创建管理员时在permissions数组中添加新权限，并修改相应的权限检查中间件。

### Q: 如何部署到生产环境？
A: 确保设置正确的环境变量，使用PM2等进程管理器，并配置HTTPS。

## 技术支持

如有问题，请参考 `ADMIN_README.md` 文件获取更详细的API文档。