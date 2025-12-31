const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Goods = require('../../models/Goods');
const Order = require('../../models/Order');
const DeliveryPerson = require('../../models/DeliveryPerson');
const Supplier = require('../../models/Supplier');
const { verifyAdminToken } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 仪表板统计数据
router.get('/stats', async (req, res) => {
  try {
    // 用户统计
    const userStats = await User.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('user_id')), 'total_users'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 1 THEN 1 END')), 'active_users'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END')), 'new_users_7d']
      ],
      raw: true
    });
    
    // 商品统计
    const goodsStats = await Goods.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('goods_id')), 'total_goods'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN shelf_status = 1 THEN 1 END')), 'on_sale_goods'],
        [require('sequelize').fn('SUM', require('sequelize').col('stock')), 'total_stock']
      ],
      raw: true
    });
    
    // 订单统计
    const orderStats = await Order.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'total_orders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status IN (1,2,3) THEN 1 END')), 'pending_orders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN create_time >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END')), 'today_orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
      ],
      raw: true
    });
    
    // 配送员统计
    const deliveryStats = await DeliveryPerson.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('delivery_person_id')), 'total_delivery'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 1 THEN 1 END')), 'active_delivery'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 0 THEN 1 END')), 'pending_delivery']
      ],
      raw: true
    });
    
    // 供应商统计
    const supplierStats = await Supplier.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('supplier_id')), 'total_suppliers'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 1 THEN 1 END')), 'active_suppliers']
      ],
      raw: true
    });
    
    res.json({
      code: 200,
      data: {
        users: userStats[0] || { total_users: 0, active_users: 0, new_users_7d: 0 },
        goods: goodsStats[0] || { total_goods: 0, on_sale_goods: 0, total_stock: 0 },
        orders: orderStats[0] || { total_orders: 0, pending_orders: 0, today_orders: 0, total_amount: 0 },
        delivery: deliveryStats[0] || { total_delivery: 0, active_delivery: 0, pending_delivery: 0 },
        suppliers: supplierStats[0] || { total_suppliers: 0, active_suppliers: 0 }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取统计数据失败：' + err.message });
  }
});

// 销售趋势数据
router.get('/sales-trend', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // 最近N天的销售数据
    const salesTrend = await Order.findAll({
      where: {
        create_time: {
          [require('sequelize').Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('create_time')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'amount']
      ],
      group: [require('sequelize').fn('DATE', require('sequelize').col('create_time'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('create_time')), 'ASC']],
      raw: true
    });
    
    res.json({
      code: 200,
      data: salesTrend
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取销售趋势失败：' + err.message });
  }
});

// 热门商品排行
router.get('/hot-goods', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const hotGoods = await Goods.findAll({
      where: { shelf_status: 1 },
      order: [['sales_count', 'DESC']],
      limit: parseInt(limit),
      attributes: ['goods_id', 'name', 'price', 'sales_count', 'img_url'],
      include: [
        { model: require('../../models/Category'), as: 'category', attributes: ['category_name'] }
      ]
    });
    
    res.json({
      code: 200,
      data: hotGoods
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取热门商品失败：' + err.message });
  }
});

// 订单状态分布
router.get('/order-status', async (req, res) => {
  try {
    const orderStatus = await Order.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // 状态映射
    const statusMap = {
      0: '待支付',
      1: '已支付',
      2: '配送中',
      3: '已送达',
      4: '已完成',
      5: '已取消',
      6: '已退款'
    };
    
    const result = orderStatus.map(item => ({
      status: item.status,
      status_name: statusMap[item.status] || '未知状态',
      count: parseInt(item.count)
    }));
    
    res.json({
      code: 200,
      data: result
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取订单状态分布失败：' + err.message });
  }
});

// 最新动态
router.get('/recent-activities', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // 最新订单
    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['nickname']
        }
      ],
      order: [['create_time', 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2),
      attributes: ['order_id', 'order_number', 'total_amount', 'status', 'create_time']
    });
    
    // 最新注册用户
    const recentUsers = await User.findAll({
      order: [['create_time', 'DESC']],
      limit: Math.ceil(parseInt(limit) / 2),
      attributes: ['user_id', 'nickname', 'create_time']
    });
    
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        title: `新订单 ${order.order_number}`,
        description: `用户 ${order.user.nickname} 下单 ¥${order.total_amount}`,
        time: order.create_time
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        title: '新用户注册',
        description: `用户 ${user.nickname} 加入平台`,
        time: user.create_time
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, parseInt(limit));
    
    res.json({
      code: 200,
      data: activities
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取最新动态失败：' + err.message });
  }
});

module.exports = router;