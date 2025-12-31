const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// 验证管理员token中间件
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效Token）' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'chengxiaoer_admin_secret');
    
    const admin = await Admin.findByPk(decoded.admin_id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!admin || admin.status !== 1) {
      return res.json({ code: 401, message: '账户不存在或已被禁用' });
    }
    
    req.admin = admin;
    next();
  } catch (err) {
    return res.json({ code: 401, message: 'Token无效或已过期' });
  }
};

// 验证超级管理员权限
const verifySuperAdmin = (req, res, next) => {
  if (req.admin.role !== 1) {
    return res.json({ code: 403, message: '权限不足，需要超级管理员权限' });
  }
  next();
};

// 权限检查中间件
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin.role === 1) {
      // 超级管理员拥有所有权限
      return next();
    }
    
    const permissions = req.admin.permissions || [];
    if (!permissions.includes(permission)) {
      return res.json({ code: 403, message: '权限不足' });
    }
    
    next();
  };
};

module.exports = {
  verifyAdminToken,
  verifySuperAdmin,
  checkPermission
};