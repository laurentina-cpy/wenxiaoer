const { v4: uuidv4 } = require('uuid');

// 生成订单编号：CXY + 日期 + 6位随机数
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.getFullYear() + 
                  String(date.getMonth() + 1).padStart(2, '0') + 
                  String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900000 + 100000); // 6位随机数
  return `CXY${dateStr}${random}`;
};

// 生成32位唯一ID
const generateId = () => uuidv4().replace(/-/g, '');

// 脱敏手机号：138****1234
const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

module.exports = {
  generateOrderNumber,
  generateId,
  maskPhone
};