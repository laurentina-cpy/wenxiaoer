const http = require('http');

function makeRequest(path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testOrderCreate() {
  try {
    console.log('开始测试订单创建...');
    
    // 首先登录获取token
    const loginResponse = await makeRequest('/api/user/wxLogin', {
      code: 'test_code_123',
      nickname: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '13800138000'
    });
    
    const token = loginResponse.data.data?.token;
    console.log('登录响应:', loginResponse);
    console.log('token:', token ? '已获取' : '未获取');
    
    if (!token) {
      console.error('无法获取token，退出测试');
      return;
    }
    
    // 创建订单请求
    const orderData = {
      address_id: 'addr_test123',
      goods_list: [
        {
          goods_id: 'goods_test123',
          quantity: 2,
          price: 99.99
        }
      ],
      total_amount: 199.98,
      payment_method: 'wechat'
    };
    
    console.log('发送订单创建请求...', orderData);
    
    const orderResponse = await makeRequest('/api/order/create', orderData, token);
    
    console.log('订单创建响应:');
    console.log('状态码:', orderResponse.status);
    console.log('响应数据:', orderResponse.data);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testOrderCreate();