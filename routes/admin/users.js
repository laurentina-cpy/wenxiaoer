const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Order = require('../../models/Order');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取用户列表
router.get('/list', checkPermission('users:view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status !== undefined) where.status = status;
    if (keyword) {
      where[require('sequelize').Op.or] = [
        { nickname: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { phone: { [require('sequelize').Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['openid'] },
      order: [['create_time', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // 获取每个用户的订单统计
    const usersWithStats = await Promise.all(
      rows.map(async (user) => {
        const orderStats = await Order.findAll({
          where: { user_id: user.user_id },
          attributes: [
            [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'total_orders'],
            [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
          ],
          raw: true
        });
        
        return {
          ...user.toJSON(),
          total_orders: parseInt(orderStats[0].total_orders) || 0,
          total_amount: parseFloat(orderStats[0].total_amount) || 0
        };
      })
    );
    
    res.json({
      code: 200,
      data: {
        list: usersWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户列表失败：' + err.message });
  }
});

// 获取用户详情
router.get('/detail/:user_id', checkPermission('users:view'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id, {
      attributes: { exclude: ['openid'] },
      include: [{
        model: Order,
        as: 'orders',
        order: [['create_time', 'DESC']],
        limit: 10
      }]
    });
    
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' });
    }
    
    // 获取用户统计信息
    const orderStats = await Order.findAll({
      where: { user_id: req.params.user_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'total_orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
      ],
      raw: true
    });
    
    res.json({
      code: 200,
      data: {
        ...user.toJSON(),
        total_orders: parseInt(orderStats[0].total_orders) || 0,
        total_amount: parseFloat(orderStats[0].total_amount) || 0
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户详情失败：' + err.message });
  }
});

// 禁用/启用用户
router.patch('/status/:user_id', checkPermission('users:manage'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const user = await User.findByPk(req.params.user_id);
    if (!user) {
      return res.json({ code: 404, message: '用户不存在' });
    }
    
    await user.update({ status });
    
    res.json({
      code: 200,
      message: `用户${status == 1 ? '启用' : '禁用'}成功`
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新用户状态失败：' + err.message });
  }
});

// 获取用户订单列表
router.get('/:user_id/orders', checkPermission('users:view'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Order.findAndCountAll({
      where: { user_id: req.params.user_id },
      include: [{ model: require('../../models/OrderItem'), as: 'orderItems' }],
      order: [['create_time', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户订单失败：' + err.message });
  }
});

module.exports = router;