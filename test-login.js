// 测试登录并获取新token
const http = require('http');

const loginData = JSON.stringify({
  code: 'test_code_' + Date.now(),
  nickname: '测试用户',
  avatarUrl: '',
  phone: '13800000000'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/wxLogin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('测试登录...');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('登录响应:', body);
    const response = JSON.parse(body);
    if (response.code === 200 && response.data.token) {
      console.log('新token:', response.data.token);
      console.log('用户ID:', response.data.user.user_id);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.write(loginData);
req.end();