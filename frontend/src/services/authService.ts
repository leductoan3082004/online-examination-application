import api from './api';

// MOCK DATA để test giao diện khi không có backend
const MOCK_TEACHER = {
  id: 'mock-123',
  name: 'Teacher Demo',
  email: 'teacher@test.com',
  role: 'TEACHER'
};

const MOCK_TOKEN = 'mock-jwt-token-for-ui-testing';

export const login = async (credentials: any) => {
  // GIẢ LẬP: Nếu nhập đúng email/pass này thì cho qua luôn
  if (credentials.email === 'teacher@test.com' && credentials.password === 'password') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: MOCK_TOKEN,
          user: MOCK_TEACHER
        });
      }, 800); // Giả lập độ trễ mạng
    });
  }

  // Nếu không, mới gọi tới API thật (sẽ báo lỗi nếu chưa bật backend)
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  // Giả lập đăng ký thành công cho UI
  if (userData.email.includes('test')) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Mock registration successful' });
      }, 800);
    });
  }

  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};
