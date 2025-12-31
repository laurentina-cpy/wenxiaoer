# 城小二管理系统后端

基于原有城小二校内外送小程序后端，新增的管理系统API，提供对货物、使用者、订单等内容的管理功能。

## 功能模块

### 1. 管理员认证
- 管理员登录
- 权限验证
- Token认证

### 2. 货物管理
- 商品列表查询（支持分页、筛选、搜索）
- 创建商品
- 更新商品信息
- 删除商品
- 批量上架/下架

### 3. 用户管理
- 用户列表查询（支持分页、搜索）
- 用户详情查看
- 用户状态管理（启用/禁用）
- 用户订单查看

### 4. 订单管理
- 订单列表查询（支持多条件筛选）
- 订单详情查看
- 订单状态更新
- 订单统计数据
- 订单导出

### 5. 分类管理
- 分类列表查询
- 创建分类
- 更新分类
- 删除分类
- 批量排序

### 6. 供应商管理
- 供应商列表查询
- 创建供应商
- 更新供应商信息
- 供应商状态管理
- 供应商详情查看

### 7. 配送员管理
- 配送员列表查询
- 配送员审核
- 配送员状态管理
- 配送员详情查看
- 配送员统计

### 8. 仪表板
- 总体统计数据
- 销售趋势分析
- 热门商品排行
- 订单状态分布
- 最新动态

## API接口

### 认证相关
```
POST /api/admin/login          # 管理员登录
GET  /api/admin/info           # 获取管理员信息
```

### 商品管理
```
GET    /api/admin/goods/list           # 获取商品列表
POST   /api/admin/goods/create         # 创建商品
PUT    /api/admin/goods/update/:id     # 更新商品
DELETE /api/admin/goods/delete/:id     # 删除商品
PATCH  /api/admin/goods/batch-shelf    # 批量上架/下架
```

### 用户管理
```
GET  /api/admin/users/list            # 获取用户列表
GET  /api/admin/users/detail/:id      # 获取用户详情
PATCH /api/admin/users/status/:id     # 更新用户状态
GET  /api/admin/users/:id/orders      # 获取用户订单
```

### 订单管理
```
GET  /api/admin/orders/list           # 获取订单列表
GET  /api/admin/orders/detail/:id     # 获取订单详情
PATCH /api/admin/orders/status/:id    # 更新订单状态
GET  /api/admin/orders/statistics     # 订单统计
GET  /api/admin/orders/export         # 导出订单
```

### 分类管理
```
GET    /api/admin/categories/list     # 获取分类列表
POST   /api/admin/categories/create   # 创建分类
PUT    /api/admin/categories/update/:id # 更新分类
DELETE /api/admin/categories/delete/:id # 删除分类
PATCH  /api/admin/categories/sort     # 批量更新排序
```

### 供应商管理
```
GET    /api/admin/suppliers/list      # 获取供应商列表
POST   /api/admin/suppliers/create    # 创建供应商
PUT    /api/admin/suppliers/update/:id # 更新供应商
DELETE /api/admin/suppliers/delete/:id # 删除供应商
PATCH  /api/admin/suppliers/status/:id # 更新供应商状态
GET    /api/admin/suppliers/detail/:id # 获取供应商详情
```

### 配送员管理
```
GET  /api/admin/delivery/list         # 获取配送员列表
GET  /api/admin/delivery/pending      # 获取待审核配送员
PATCH /api/admin/delivery/audit/:id    # 审核配送员
GET  /api/admin/delivery/detail/:id    # 获取配送员详情
PATCH /api/admin/delivery/status/:id   # 更新配送员状态
GET  /api/admin/delivery/statistics   # 配送员统计
```

### 仪表板
```
GET /api/admin/dashboard/stats         # 仪表板统计
GET /api/admin/dashboard/sales-trend   # 销售趋势
GET /api/admin/dashboard/hot-goods     # 热门商品
GET /api/admin/dashboard/order-status  # 订单状态分布
GET /api/admin/dashboard/recent-activities # 最新动态
```

## 权限系统

### 角色定义
- 1: 超级管理员（拥有所有权限）
- 2: 普通管理员（拥有指定权限）

### 权限列表
- `goods:view` - 查看商品
- `goods:create` - 创建商品
- `goods:update` - 更新商品
- `goods:delete` - 删除商品
- `users:view` - 查看用户
- `users:manage` - 管理用户
- `orders:view` - 查看订单
- `orders:manage` - 管理订单
- `orders:export` - 导出订单
- `categories:view` - 查看分类
- `categories:create` - 创建分类
- `categories:update` - 更新分类
- `categories:delete` - 删除分类
- `suppliers:view` - 查看供应商
- `suppliers:create` - 创建供应商
- `suppliers:update` - 更新供应商
- `suppliers:delete` - 删除供应商
- `suppliers:manage` - 管理供应商
- `delivery:view` - 查看配送员
- `delivery:audit` - 审核配送员
- `delivery:manage` - 管理配送员

## 初始化

1. 创建数据库表结构
2. 运行初始化脚本创建默认管理员：
```bash
node scripts/init-admin.js
```

默认管理员账户：
- 用户名：admin
- 密码：admin123

## 技术栈

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT认证
- BCrypt密码加密

## 数据库表

### 新增表
- `admin` - 管理员表
- `operation_log` - 操作日志表

### 原有表（保持不变）
- `user` - 用户表
- `goods` - 商品表
- `order` - 订单表
- `category` - 分类表
- `supplier` - 供应商表
- `delivery_person` - 配送员表
- `order_item` - 订单项表
- `address` - 地址表
- `cart` - 购物车表
- `global_config` - 全局配置表

## 安全特性

1. JWT Token认证
2. 密码BCrypt加密存储
3. 权限验证中间件
4. SQL注入防护（Sequelize ORM）
5. 请求参数验证

## 响应格式

所有API响应采用统一格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

## 错误码

- 200: 成功
- 400: 请求参数错误
- 401: 未授权/Token无效
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误