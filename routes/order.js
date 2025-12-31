const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db')
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Address = require('../models/Address');
const Goods = require('../models/Goods');
const { generateId, generateOrderNumber } = require('../utils');

// 创建订单
router.post('/create', async (req, res) => {
  const transaction = await sequelize.transaction();
  let decoded = null;
  
  try {
    // 从 Authorization 头解析 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效 Token）' });
    }
    const token = authHeader.split(' ')[1];

    decoded = jwt.verify(token, 'chengxiaoer_secret');
    const { address_id, goods_list, address_detail } = req.body;

    // 验证必需字段
    if (!address_id || !goods_list || !Array.isArray(goods_list) || goods_list.length === 0) {
      return res.json({ code: 400, message: '请求参数不完整' });
    }

    // 创建临时地址（如果不存在）
    let address = await Address.findByPk(address_id);
    if (!address) {
      if (address_id.startsWith('addr_')) {
        // 解析地址详情，如果有
        let building = '1';
        let room = '101';
        
        if (address_detail) {
          // 尝试从地址详情中提取楼栋和房间号
          const buildingMatch = address_detail.match(/(\d+)栋/);
          const roomMatch = address_detail.match(/(\d+)/);
          
          if (buildingMatch) building = buildingMatch[1];
          if (roomMatch) room = roomMatch[1];
        }
        
        address = await Address.create({
          address_id: address_id,
          user_id: decoded.user_id,
          building: building,
          room: room,
          contact_name: '临时用户',
          contact_phone: '13800000000',
          is_default: 0,
          status: 1
        }, { transaction });
      } else {
        return res.json({ code: 400, message: '地址无效' });
      }
    }
    
    // 验证地址归属
    if (address.user_id !== decoded.user_id) {
      return res.json({ code: 400, message: '地址无效' });
    }

    // 验证商品库存
    for (const item of goods_list) {
      // 支持不同的商品ID字段名
      const goodsId = item.goods_id || item.id;
      if (!goodsId) {
        await transaction.rollback();
        return res.json({ code: 400, message: '商品ID无效' });
      }
      
      const goods = await Goods.findByPk(goodsId);
      if (!goods || goods.stock < item.quantity) {
        await transaction.rollback();
        return res.json({ code: 400, message: `${goods?.name || '商品'}库存不足` });
      }
    }

    // 计算总金额
    const total_amount = goods_list.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    // 创建订单
    const order = await Order.create({
      order_id: generateId(),
      user_id: decoded.user_id,
      order_number: generateOrderNumber(),
      total_amount,
      address_id,
      delivery_address: `${address.building}栋${address.room}`,
      contact_phone: address.contact_phone,
      status: 0 // 待支付
    }, { transaction });

    // 创建订单项
    for (const item of goods_list) {
      // 支持不同的商品ID字段名
      const goodsId = item.goods_id || item.id;
      const goods = await Goods.findByPk(goodsId);
      
      await OrderItem.create({
        order_item_id: generateId(),
        order_id: order.order_id,
        goods_id: goods.goods_id,
        goods_name: goods.name,
        goods_image: goods.img_url,
        quantity: item.quantity,
        unit_price: goods.price,
        total_price: goods.price * item.quantity
      }, { transaction });

      // 扣减库存
      await goods.update({ 
        stock: goods.stock - item.quantity,
        sales_count: goods.sales_count + item.quantity
      }, { transaction });
    }

    await transaction.commit();
    res.json({
      code: 200,
      data: { order_id: order.order_id, order_number: order.order_number },
      message: '订单创建成功'
    });
  } catch (err) {
    await transaction.rollback();
    console.error('订单创建失败详情:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user_id: decoded?.user_id
    });
    res.status(500).json({ code: 500, message: '创建订单失败：' + err.message });
  }
});

// 获取订单列表
router.get('/list', async (req, res) => {
  try {
    // 从 Authorization 头解析 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效 Token）' });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, 'chengxiaoer_secret');
    const orders = await Order.findAll({
      where: { user_id: decoded.user_id },
      order: [['create_time', 'DESC']],
      include: [{ model: OrderItem, as: 'orderItems' }]
    });

    res.json({ code: 200, data: orders });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取订单失败：' + err.message });
  }
});

// 取消订单
router.patch('/cancel/:order_id', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 从 Authorization 头解析 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效 Token）' });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, 'chengxiaoer_secret');
    const orderId = req.params.order_id;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' });
    }

    // 验证订单归属
    if (order.user_id !== decoded.user_id) {
      return res.json({ code: 403, message: '无权操作此订单' });
    }

    // 验证订单状态（只有待支付的订单可以取消）
    if (order.status !== 0) {
      return res.json({ code: 400, message: '只有待支付的订单可以取消' });
    }

    // 获取订单项
    const orderItems = await OrderItem.findAll({ where: { order_id: orderId } });

    // 恢复商品库存
    for (const item of orderItems) {
      const goods = await Goods.findByPk(item.goods_id);
      if (goods) {
        await goods.update({
          stock: goods.stock + item.quantity,
          sales_count: Math.max(0, goods.sales_count - item.quantity)
        }, { transaction });
      }
    }

    // 更新订单状态为已取消
    await order.update({ status: 5 }, { transaction });

    await transaction.commit();
    res.json({ code: 200, message: '订单已成功取消' });
  } catch (err) {
    await transaction.rollback();
    console.error('取消订单失败:', err);
    res.status(500).json({ code: 500, message: '取消订单失败：' + err.message });
  }
});

// 取消订单接口（添加到现有代码中）
router.patch('/cancel/:order_id', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 从 Authorization 头解析 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效 Token）' });
    }
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, 'chengxiaoer_secret');
    const orderId = req.params.order_id;

    // 查找订单
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.json({ code: 404, message: '订单不存在' });
    }

    // 验证订单归属
    if (order.user_id !== decoded.user_id) {
      return res.json({ code: 403, message: '无权操作此订单' });
    }

    // 验证订单状态（只有待支付的订单可以取消）
    if (order.status !== 0) {
      return res.json({ code: 400, message: '只有待支付的订单可以取消' });
    }

    // 获取订单项
    const orderItems = await OrderItem.findAll({ where: { order_id: orderId } });

    // 恢复商品库存
    for (const item of orderItems) {
      const goods = await Goods.findByPk(item.goods_id);
      if (goods) {
        await goods.update({
          stock: goods.stock + item.quantity,
          sales_count: Math.max(0, goods.sales_count - item.quantity)
        }, { transaction });
      }
    }

    // 确保这里设置的是5（已取消）
    await order.update({ status: 5 }, { transaction });

    await transaction.commit();
    res.json({ code: 200, message: '订单已成功取消' });
  } catch (err) {
    await transaction.rollback();
    console.error('取消订单失败:', err);
    res.status(500).json({ code: 500, message: '取消订单失败：' + err.message });
  }
});

module.exports = router;