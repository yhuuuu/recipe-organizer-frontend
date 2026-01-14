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
  // Register a new user
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.errors?.[0]?.msg || 'Registration failed');
    }
    
    const data: AuthResponse = await response.json();
    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    return data;
  },

  // Login
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data: AuthResponse = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    return data;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  },

  // Get current token
  getToken: (): string | null => localStorage.getItem('token'),

  // Check if authenticated
  isAuthenticated: (): boolean => !!localStorage.getItem('token'),

  // Get current user info
  getCurrentUser: (): User => ({
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username')
  })
};
