const express = require('express');
const router = express.Router();
const DeliveryPerson = require('../../models/DeliveryPerson');
const Order = require('../../models/Order');
const { generateId } = require('../../utils');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取配送员列表
router.get('/list', checkPermission('delivery:view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status !== undefined) where.status = status;
    if (keyword) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { phone: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { student_id: { [require('sequelize').Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await DeliveryPerson.findAndCountAll({
      where,
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
    res.status(500).json({ code: 500, message: '获取配送员列表失败：' + err.message });
  }
});

// 获取待审核配送员列表
router.get('/pending', checkPermission('delivery:audit'), async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.findAll({
      where: { status: 0 },
      order: [['create_time', 'ASC']]
    });
    
    res.json({
      code: 200,
      data: deliveryPersons
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取待审核列表失败：' + err.message });
  }
});

// 审核配送员
router.patch('/audit/:delivery_person_id', checkPermission('delivery:audit'), async (req, res) => {
  try {
    const { status, audit_remark } = req.body;
    
    const deliveryPerson = await DeliveryPerson.findByPk(req.params.delivery_person_id);
    if (!deliveryPerson) {
      return res.json({ code: 404, message: '配送员不存在' });
    }
    
    await deliveryPerson.update({
      status,
      audit_remark
    });
    
    const statusText = {
      1: '审核通过',
      2: '审核驳回',
      3: '禁用'
    };
    
    res.json({
      code: 200,
      message: `${statusText[status] || '状态更新'}成功`
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '审核失败：' + err.message });
  }
});

// 获取配送员详情
router.get('/detail/:delivery_person_id', checkPermission('delivery:view'), async (req, res) => {
  try {
    const deliveryPerson = await DeliveryPerson.findByPk(req.params.delivery_person_id);
    if (!deliveryPerson) {
      return res.json({ code: 404, message: '配送员不存在' });
    }
    
    // 获取配送员的订单统计
    const orderStats = await Order.findAll({
      where: { delivery_person_id: req.params.delivery_person_id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'total_orders'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 4 THEN 1 END')), 'completed_orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
      ],
      raw: true
    });
    
    // 获取最近订单
    const recentOrders = await Order.findAll({
      where: { delivery_person_id: req.params.delivery_person_id },
      include: [
        {
          model: require('../../models/User'),
          as: 'user',
          attributes: ['nickname']
        }
      ],
      order: [['create_time', 'DESC']],
      limit: 10
    });
    
    res.json({
      code: 200,
      data: {
        ...deliveryPerson.toJSON(),
        stats: orderStats[0] || { total_orders: 0, completed_orders: 0, total_amount: 0 },
        recentOrders
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取配送员详情失败：' + err.message });
  }
});

// 更新配送员状态
router.patch('/status/:delivery_person_id', checkPermission('delivery:manage'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const deliveryPerson = await DeliveryPerson.findByPk(req.params.delivery_person_id);
    if (!deliveryPerson) {
      return res.json({ code: 404, message: '配送员不存在' });
    }
    
    await deliveryPerson.update({ status });
    
    res.json({
      code: 200,
      message: '配送员状态更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新配送员状态失败：' + err.message });
  }
});

// 配送员统计
router.get('/statistics', checkPermission('delivery:view'), async (req, res) => {
  try {
    // 总配送员数
    const totalCounts = await DeliveryPerson.findAll({
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('delivery_person_id')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 1 THEN 1 END')), 'active'],
        [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN status = 0 THEN 1 END')), 'pending']
      ],
      raw: true
    });
    
    // 接单排行榜
    const topDeliveryPersons = await DeliveryPerson.findAll({
      where: { status: 1 },
      order: [['total_orders', 'DESC']],
      limit: 10,
      attributes: ['delivery_person_id', 'name', 'total_orders', 'completed_orders', 'completion_rate']
    });
    
    res.json({
      code: 200,
      data: {
        counts: totalCounts[0] || { total: 0, active: 0, pending: 0 },
        topDeliveryPersons
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取统计数据失败：' + err.message });
  }
});

module.exports = router;