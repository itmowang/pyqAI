import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 401错误：token过期或无效
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token过期，清除登录信息');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        // 如果不是登录或注册请求，提示用户重新登录
        const url = error.config?.url || '';
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          alert('登录已过期，请重新登录');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
