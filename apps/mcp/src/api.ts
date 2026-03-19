/**
 * API 客户端 - 封装对博客后端的 HTTP 请求
 */

import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 动态设置 token（登录后调用）
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// 当前会话状态
export const session = {
  token: process.env.API_TOKEN || null as string | null,
  userId: null as string | null,
  username: null as string | null,
};

// 初始化时如果有环境变量 token，直接设置
if (session.token) {
  setAuthToken(session.token);
}
