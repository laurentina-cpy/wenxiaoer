const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const User = require('../../models/User');
const DeliveryPerson = require('../../models/DeliveryPerson');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取订单列表
router.get('/list', checkPermission('orders:view'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date,
      keyword,
      user_id
    } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status !== undefined) where.status = status;
    if (user_id) where.user_id = user_id;
    if (start_date && end_date) {
      where.create_time = {
        [require('sequelize').Op.between]: [start_date, end_date]
      };
    }
    if (keyword) {
      where[require('sequelize').Op.or] = [
        { order_number: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { delivery_address: { [require('sequelize').Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'nickname', 'phone_masked']
        },
        {
          model: DeliveryPerson,
          as: 'deliveryPerson',
          attributes: ['delivery_person_id', 'name', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems'
        }
      ],
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
    res.status(500).json({ code: 500, message: '获取订单列表失败：' + err.message });
  }
});

// 获取订单详情
router.get('/detail/:order_id', checkPermission('orders:view'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.order_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'nickname', 'phone_masked']
        },
        {
          model: DeliveryPerson,
          as: 'deliveryPerson',
          attributes: ['delivery_person_id', 'name', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems'
        },
        {
          model: require('../../models/Address'),
          as: 'address'
        }
      ]
    });
    
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' });
    }
    
    res.json({
      code: 200,
      data: order
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取订单详情失败：' + err.message });
  }
});

// 更新订单状态
router.patch('/status/:order_id', checkPermission('orders:manage'), async (req, res) => {
  try {
    const { status, delivery_person_id, remark } = req.body;
    
    const order = await Order.findByPk(req.params.order_id);
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' });
    }
    
    const updateData = { status };
    if (delivery_person_id) {
      updateData.delivery_person_id = delivery_person_id;
    }
    
    // 根据状态更新时间字段
    if (status == 1 && !order.pay_time) {
      updateData.pay_time = new Date();
    } else if (status == 4 && !order.finish_time) {
      updateData.finish_time = new Date();
    }
    
    await order.update(updateData);
    
    res.json({
      code: 200,
      message: '订单状态更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新订单状态失败：' + err.message });
  }
});

// 订单统计
router.get('/statistics', checkPermission('orders:view'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    
    if (start_date && end_date) {
      where.create_time = {
        [require('sequelize').Op.between]: [start_date, end_date]
      };
    }
    
    // 总订单数、总金额
    const totalStats = await Order.findAll({
      where,
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'total_orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_amount']
      ],
      raw: true
    });
    
    // 各状态订单数
    const statusStats = await Order.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // 每日订单数（最近7天）
    const dailyStats = await Order.findAll({
      where: {
        create_time: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('create_time')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('order_id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'amount']
      ],
      group: [require('sequelize').fn('DATE', require('sequelize').col('create_time'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('create_time')), 'ASC']],
      raw: true
    });
    
    res.json({
      code: 200,
      data: {
        total: totalStats[0] || { total_orders: 0, total_amount: 0 },
        byStatus: statusStats,
        daily: dailyStats
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取统计数据失败：' + err.message });
  }
});

// 导出订单
router.get('/export', checkPermission('orders:export'), async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;
    
    const where = {};
    if (status !== undefined) where.status = status;
    if (start_date && end_date) {
      where.create_time = {
        [require('sequelize').Op.between]: [start_date, end_date]
      };
    }
    
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['nickname', 'phone_masked']
        },
        {
          model: OrderItem,
          as: 'orderItems'
        }
      ],
      order: [['create_time', 'DESC']]
    });
    
    // 这里可以生成Excel文件并返回下载链接
    // 为了简化，这里直接返回JSON数据
    res.json({
      code: 200,
      data: orders,
      message: '导出数据成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '导出订单失败：' + err.message });
  }
});

module.exports = router;