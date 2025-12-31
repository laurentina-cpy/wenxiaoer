const http = require('http');

const testData = {
  address_id: 'addr_123',
  goods_list: [{
    goods_id: '9536829ed4774e24bb3b490898e3f432',
    quantity: 2,
    price: 3.00
  }],
  total_amount: '7.00'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/order/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN2I2OWRjZWRiZmI2NDJhOGIzMzljMDUyMDJmNmNmMTciLCJpYXQiOjE3NjU5NDk5MzEsImV4cCI6MTc2NjU1NDczMX0.U9CJkIxfmMqPshkZnEA9Wa8ynF8_7QHQfSKrNYGavVQ'
  }
};

console.log('发送订单创建请求...');
console.log('请求数据:', postData);
console.log('请求头:', options.headers);

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('响应内容:', body);
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.write(postData);
req.end();