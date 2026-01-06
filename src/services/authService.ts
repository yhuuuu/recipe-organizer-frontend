const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  username: string;
  email?: string;
}

export interface User {
  id: string | null;
  username: string | null;
}

export const authService = {
  // 注册
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.errors?.[0]?.msg || '注册失败');
    }
    
    const data: AuthResponse = await response.json();
    // 保存 token 和用户信息
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    return data;
  },

  // 登录
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '登录失败');
    }
    
    const data: AuthResponse = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    return data;
  },

  // 登出
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  },

  // 获取当前 token
  getToken: (): string | null => localStorage.getItem('token'),

  // 检查是否已登录
  isAuthenticated: (): boolean => !!localStorage.getItem('token'),

  // 获取当前用户信息
  getCurrentUser: (): User => ({
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username')
  })
};
