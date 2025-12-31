const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const { generateId } = require('../../utils');
const { verifyAdminToken, checkPermission } = require('../../utils/auth');

// 所有路由都需要管理员权限
router.use(verifyAdminToken);

// 获取分类列表
router.get('/list', checkPermission('categories:view'), async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Category.findAndCountAll({
      order: [['sort_order', 'ASC'], ['create_time', 'DESC']],
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
    res.status(500).json({ code: 500, message: '获取分类列表失败：' + err.message });
  }
});

// 创建分类
router.post('/create', checkPermission('categories:create'), async (req, res) => {
  try {
    const { category_name, sort_order = 0 } = req.body;
    
    if (!category_name) {
      return res.json({ code: 400, message: '分类名称不能为空' });
    }
    
    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ where: { category_name } });
    if (existingCategory) {
      return res.json({ code: 400, message: '分类名称已存在' });
    }
    
    const category = await Category.create({
      category_id: generateId(),
      category_name,
      sort_order
    });
    
    res.json({
      code: 200,
      data: category,
      message: '分类创建成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建分类失败：' + err.message });
  }
});

// 更新分类
router.put('/update/:category_id', checkPermission('categories:update'), async (req, res) => {
  try {
    const { category_name, sort_order, status } = req.body;
    
    const category = await Category.findByPk(req.params.category_id);
    if (!category) {
      return res.json({ code: 404, message: '分类不存在' });
    }
    
    // 如果更新分类名称，检查是否重复
    if (category_name && category_name !== category.category_name) {
      const existingCategory = await Category.findOne({ where: { category_name } });
      if (existingCategory) {
        return res.json({ code: 400, message: '分类名称已存在' });
      }
    }
    
    await category.update({ category_name, sort_order, status });
    
    res.json({
      code: 200,
      data: category,
      message: '分类更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新分类失败：' + err.message });
  }
});

// 删除分类
router.delete('/delete/:category_id', checkPermission('categories:delete'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.category_id);
    if (!category) {
      return res.json({ code: 404, message: '分类不存在' });
    }
    
    // 检查分类下是否有商品
    const Goods = require('../../models/Goods');
    const goodsCount = await Goods.count({ where: { category_id: req.params.category_id } });
    if (goodsCount > 0) {
      return res.json({ code: 400, message: '该分类下还有商品，无法删除' });
    }
    
    await category.destroy();
    
    res.json({
      code: 200,
      message: '分类删除成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除分类失败：' + err.message });
  }
});

// 批量更新排序
router.patch('/sort', checkPermission('categories:update'), async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.json({ code: 400, message: '请提供分类数据' });
    }
    
    // 批量更新排序
    await Promise.all(
      categories.map(item => 
        Category.update(
          { sort_order: item.sort_order },
          { where: { category_id: item.category_id } }
        )
      )
    );
    
    res.json({
      code: 200,
      message: '排序更新成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新排序失败：' + err.message });
  }
});

module.exports = router;