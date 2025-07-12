// API配置文件
const isDevelopment = import.meta.env.DEV;

// 开发环境使用代理，生产环境使用相对路径
export const API_BASE_URL = isDevelopment ? '' : '';

// API端点配置
export const API_ENDPOINTS = {
  // 用户相关
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  ME: '/api/me',
  USERS: '/api/users',
  
  // 题目相关
  PROBLEMS: '/api/problems',
  
  // 评测记录相关
  JUDGE_RECORDS: '/api/judgerecords',
  
  // 题解相关
  SOLUTIONS: '/api/solutions',
  
  // 公告相关
  ANNOUNCEMENTS: '/api/announcements'
};

// 创建axios实例
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 