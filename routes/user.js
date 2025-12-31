const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateId, maskPhone } = require('../utils');

// 微信登录
router.post('/wxLogin', async (req, res) => {
  try {
    const { code, nickname, avatarUrl, phone } = req.body;
    // 模拟微信code换openid（实际需调用微信接口）
    const openid = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 查询或创建用户
    let user = await User.findOne({ where: { openid } });
    if (!user) {
      user = await User.create({
        user_id: generateId(),
        openid,
        nickname: nickname || `用户${Math.floor(Math.random() * 9000 + 1000)}`,
        avatar_url: avatarUrl || '',
        phone: phone || '',
        phone_masked: phone ? maskPhone(phone) : '',
        last_login_time: new Date()
      });
    } else {
      // 更新最后登录时间
      await user.update({ last_login_time: new Date() });
    }

    // 生成token
    const token = jwt.sign({ user_id: user.user_id }, 'chengxiaoer_secret', { expiresIn: '7d' });

    res.json({
      code: 200,
      data: {
        token,
        user: {
          user_id: user.user_id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          phone_masked: user.phone_masked
        }
      },
      message: '登录成功'
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '登录失败：' + err.message
    });
  }
});

// 获取用户信息
router.get('/info', async (req, res) => {
  try {
    // 从 Authorization 头解析 Token（前端格式：Bearer <token>）
    const authHeader = req.headers.authorization; // 获取 Authorization 头
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ code: 401, message: '未登录（缺少有效 Token）' });
    }
    // 提取 Bearer 后的 Token（去掉前缀 "Bearer "）
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, 'chengxiaoer_secret');
    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.json({ code: 404, message: '用户不存在' });

    res.json({
      code: 200,
      data: {
        user_id: user.user_id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        phone_masked: user.phone_masked,
        create_time: user.create_time
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取信息失败：' + err.message });
  }
});

module.exports = router;