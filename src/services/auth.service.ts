import api from '../api/config';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

class AuthService {
  // Register new user
  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/auth/register', userData);
    
    if (response.data.token) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/auth/login', credentials);
    
    if (response.data.token) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Store auth data in localStorage
  private setAuthData(data: ApiResponse<User>): void {
    localStorage.setItem('token', data.token || '');
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles || []
    }));
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

const authService = new AuthService();
export default authService;

