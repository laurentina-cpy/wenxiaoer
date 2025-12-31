import { TokenManager } from './token';

// 后端接口基础地址（替换为你的真实后端地址）
const BASE_URL = 'http://localhost:3000';

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * 请求封装：自动携带 Token + 统一处理 Token 失效
 * @param {Object} options - 请求配置 { url, method, data }
 */
export const request = (options) => {
  // 1. 请求拦截：添加 Token 到请求头
  const header = {
    'Content-Type': 'application/json',
    // 后端主流格式：Bearer + 空格 + Token（和后端约定）
    'Authorization': `Bearer ${TokenManager.getToken()}`
  };

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + '/api' + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        // 2. 响应拦截：处理 Token 失效（后端约定 401 = Token 过期/无效）
        if (res.statusCode === 401) {
          // 清除无效 Token
          TokenManager.clearToken();
          // 提示并跳登录页
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 });
          uni.navigateTo({ url: '/pages/login/login' });
          reject(new Error('Token失效'));
          return;
        }

        // 正常响应：只返回后端数据
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          uni.showToast({ title: res.data?.msg || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        // 开发环境下显示更详细的错误信息
        if (isDev) {
          console.error('请求失败详情:', err);
          if (err.errMsg && err.errMsg.includes('url not in domain list')) {
            uni.showToast({ 
              title: '开发环境域名限制，请在小程序开发者工具中关闭域名校验', 
              icon: 'none',
              duration: 3000
            });
            return;
          }
        }
        uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 简化 GET/POST 调用
export const get = (url, data) => request({ url, method: 'GET', data });
export const post = (url, data) => request({ url, method: 'POST', data });