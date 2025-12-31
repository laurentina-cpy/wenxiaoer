const express = require('express');
const router = express.Router();
const Goods = require('../../models/Goods');
const Category = require('../../models/Category');
const Supplier = require('../../models/Supplier');
const { generateId } = require('../../utils');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取商品列表（管理员版本，包含所有商品）
router.get('/list', checkPermission('goods:view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, supplier_id, shelf_status, keyword } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (category_id) where.category_id = category_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (shelf_status !== undefined) where.shelf_status = shelf_status;
    if (keyword) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { description: { [require('sequelize').Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Goods.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['category_name'] },
        { model: Supplier, as: 'supplier', attributes: ['name'] }
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
    res.status(500).json({ code: 500, message: '获取商品列表失败：' + err.message });
  }
});

// 创建商品
router.post('/create', checkPermission('goods:create'), async (req, res) => {
  try {
    const {
      name, price, stock, category_id, img_url, specification,
      supplier_id, description, shelf_status = 0
    } = req.body;
    
    if (!name || !price || !category_id) {
      return res.json({ code: 400, message: '商品名称、价格和分类不能为空' });
    }
    
    const goods = await Goods.create({
      goods_id: generateId(),
      name,
      price,
      stock: stock || 0,
      category_id,
      img_url,
      specification,
      supplier_id,
      description,
      shelf_status
    });
    
    res.json({
      code: 200,
      data: goods,
      message: '商品创建成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建商品失败：' + err.message });
  }
});

// 更新商品
router.put('/update/:goods_id', checkPermission('goods:update'), async (req, res) => {
  try {
    const goods = await Goods.findByPk(req.params.goods_id);
    if (!goods) {
      return res.json({ code: 404, message: '商品不存在' });
    }
    
    await goods.update(req.body);
    
    res.json({
      code: 200,
      data: goods,
      message: '商品更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新商品失败：' + err.message });
  }
});

// 删除商品
router.delete('/delete/:goods_id', checkPermission('goods:delete'), async (req, res) => {
  try {
    const goods = await Goods.findByPk(req.params.goods_id);
    if (!goods) {
      return res.json({ code: 404, message: '商品不存在' });
    }
    
    await goods.destroy();
    
    res.json({
      code: 200,
      message: '商品删除成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除商品失败：' + err.message });
  }
});

// 批量上架/下架
router.patch('/batch-shelf', checkPermission('goods:update'), async (req, res) => {
  try {
    const { goods_ids, shelf_status } = req.body;
    
    if (!Array.isArray(goods_ids) || goods_ids.length === 0) {
      return res.json({ code: 400, message: '请选择商品' });
    }
    
    await Goods.update(
      { shelf_status },
      { where: { goods_id: goods_ids } }
    );
    
    res.json({
      code: 200,
      message: `商品${shelf_status == 1 ? '上架' : '下架'}成功`
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '批量操作失败：' + err.message });
  }
});

module.exports = router;