const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const Goods = require('../../models/Goods');
const { generateId } = require('../../utils');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取供应商列表
router.get('/list', checkPermission('suppliers:view'), async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status !== undefined) where.status = status;
    if (keyword) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { contact: { [require('sequelize').Op.like]: `%${keyword}%` } },
        { license_number: { [require('sequelize').Op.like]: `%${keyword}%` } }
      ];
    }
    
    const { count, rows } = await Supplier.findAndCountAll({
      where,
      order: [['create_time', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    // 获取每个供应商的商品数量
    const suppliersWithGoodsCount = await Promise.all(
      rows.map(async (supplier) => {
        const goodsCount = await Goods.count({
          where: { supplier_id: supplier.supplier_id }
        });
        
        return {
          ...supplier.toJSON(),
          goods_count: goodsCount
        };
      })
    );
    
    res.json({
      code: 200,
      data: {
        list: suppliersWithGoodsCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取供应商列表失败：' + err.message });
  }
});

// 创建供应商
router.post('/create', checkPermission('suppliers:create'), async (req, res) => {
  try {
    const {
      name, contact, license_number, license_image, address
    } = req.body;
    
    if (!name || !contact || !license_number) {
      return res.json({ code: 400, message: '供应商名称、联系方式和许可证编号不能为空' });
    }
    
    // 检查许可证编号是否已存在
    const existingSupplier = await Supplier.findOne({ where: { license_number } });
    if (existingSupplier) {
      return res.json({ code: 400, message: '许可证编号已存在' });
    }
    
    const supplier = await Supplier.create({
      supplier_id: generateId(),
      name,
      contact,
      license_number,
      license_image,
      address
    });
    
    res.json({
      code: 200,
      data: supplier,
      message: '供应商创建成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建供应商失败：' + err.message });
  }
});

// 更新供应商
router.put('/update/:supplier_id', checkPermission('suppliers:update'), async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.supplier_id);
    if (!supplier) {
      return res.json({ code: 404, message: '供应商不存在' });
    }
    
    // 如果更新许可证编号，检查是否重复
    if (req.body.license_number && req.body.license_number !== supplier.license_number) {
      const existingSupplier = await Supplier.findOne({
        where: { license_number: req.body.license_number }
      });
      if (existingSupplier) {
        return res.json({ code: 400, message: '许可证编号已存在' });
      }
    }
    
    await supplier.update(req.body);
    
    res.json({
      code: 200,
      data: supplier,
      message: '供应商更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新供应商失败：' + err.message });
  }
});

// 删除供应商
router.delete('/delete/:supplier_id', checkPermission('suppliers:delete'), async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.supplier_id);
    if (!supplier) {
      return res.json({ code: 404, message: '供应商不存在' });
    }
    
    // 检查供应商下是否有商品
    const goodsCount = await Goods.count({
      where: { supplier_id: req.params.supplier_id }
    });
    
    if (goodsCount > 0) {
      return res.json({ code: 400, message: '该供应商下还有商品，无法删除' });
    }
    
    await supplier.destroy();
    
    res.json({
      code: 200,
      message: '供应商删除成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除供应商失败：' + err.message });
  }
});

// 更新供应商状态
router.patch('/status/:supplier_id', checkPermission('suppliers:manage'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const supplier = await Supplier.findByPk(req.params.supplier_id);
    if (!supplier) {
      return res.json({ code: 404, message: '供应商不存在' });
    }
    
    await supplier.update({ status });
    
    res.json({
      code: 200,
      message: `供应商${status == 1 ? '启用' : '禁用'}成功`
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新供应商状态失败：' + err.message });
  }
});

// 获取供应商详情
router.get('/detail/:supplier_id', checkPermission('suppliers:view'), async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.supplier_id);
    if (!supplier) {
      return res.json({ code: 404, message: '供应商不存在' });
    }
    
    // 获取供应商的商品列表
    const goods = await Goods.findAll({
      where: { supplier_id: req.params.supplier_id },
      include: [{ model: require('../../models/Category'), as: 'category' }],
      order: [['create_time', 'DESC']]
    });
    
    res.json({
      code: 200,
      data: {
        supplier,
        goods
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取供应商详情失败：' + err.message });
  }
});

module.exports = router;