const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { generateId } = require('../utils');
const { encryptPassword, verifyPassword } = require('../utils/encryption');

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({ code: 400, message: '用户名和密码不能为空' });
    }
    
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.json({ code: 400, message: '用户名或密码错误' });
    }
    
    if (admin.status !== 1) {
      return res.json({ code: 400, message: '账户已被禁用' });
    }
    
    // 验证密码
    const isValid = verifyPassword(password, admin.salt, admin.password_hash);
    if (!isValid) {
      return res.json({ code: 400, message: '用户名或密码错误' });
    }
    
    // 更新最后登录时间
    await admin.update({
      last_login_time: new Date(),
      last_login_ip: req.ip || req.connection.remoteAddress
    });
    
    // 生成token
    const token = jwt.sign({ admin_id: admin.admin_id }, 'chengxiaoer_admin_secret', { expiresIn: '24h' });
    
    res.json({
      code: 200,
      data: {
        token,
        admin: {
          admin_id: admin.admin_id,
          username: admin.username,
          real_name: admin.real_name,
          role: admin.role,
          permissions: admin.permissions
        }
      },
      message: '登录成功'
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '登录失败：' + err.message });
  }
});

// 获取管理员信息
router.get('/info', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效Token）' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'chengxiaoer_admin_secret');
    
    const admin = await Admin.findByPk(decoded.admin_id, {
      attributes: { exclude: ['password_hash', 'salt'] }
    });
    
    if (!admin) {
      return res.json({ code: 404, message: '管理员不存在' });
    }
    
    res.json({
      code: 200,
      data: admin
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取信息失败：' + err.message });
  }
});

module.exports = router;