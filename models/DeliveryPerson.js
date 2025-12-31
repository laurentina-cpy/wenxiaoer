const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeliveryPerson = sequelize.define('delivery_person', {
  delivery_person_id: {
    type: DataTypes.STRING(32),
    primaryKey: true,
    comment: '配送员ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '姓名'
  },
  student_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '学号'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号'
  },
  id_card: {
    type: DataTypes.STRING(100),
    comment: '学生证照片'
  },
  delivery_area: {
    type: DataTypes.JSON,
    comment: '常用配送区域'
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总接单数'
  },
  completed_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '完成订单数'
  },
  completion_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: '完成率'
  },
  total_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '总佣金'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态：0-待审核，1-正常，2-暂停，3-禁用'
  },
  audit_remark: {
    type: DataTypes.STRING(200),
    comment: '审核备注'
  },
  last_login_time: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
  }
}, {
  comment: '配送员表'
});

module.exports = DeliveryPerson;