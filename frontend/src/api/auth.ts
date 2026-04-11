import api from './client';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const register = (data: RegisterPayload) =>
  api.post<User>('/auth/register', data);

export const login = (data: LoginPayload) =>
  api.post<LoginResponse>('/auth/login', data);
