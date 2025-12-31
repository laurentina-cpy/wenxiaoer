const express = require('express');
const router = express.Router();
const Goods = require('../models/Goods');
const Category = require('../models/Category');

// 获取商品分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    });
    res.json({ code: 200, data: categories });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取分类失败：' + err.message });
  }
});

// 获取商品列表（支持分类筛选、上架状态筛选）
router.get('/list', async (req, res) => {
  try {
    const { category_id, shelf_status = 1 } = req.query;
    const where = { shelf_status };
    if (category_id) where.category_id = category_id;

    const goodsList = await Goods.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['category_name'] }],
      order: [['sales_count', 'DESC']]
    });
    res.json({ code: 200, data: goodsList });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取商品失败：' + err.message });
  }
});

// 获取商品详情
router.get('/detail/:goods_id', async (req, res) => {
  try {
    const goods = await Goods.findByPk(req.params.goods_id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'supplier', attributes: ['name', 'contact'] }
      ]
    });
    if (!goods) return res.json({ code: 404, message: '商品不存在' });
    res.json({ code: 200, data: goods });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取详情失败：' + err.message });
  }
});

module.exports = router;