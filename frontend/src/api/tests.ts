import api from './client';

export interface Test {
  id: number;
  title: string;
  description?: string;
  passcode: string;
  teacherId: number;
  questionCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTestPayload {
  title: string;
  description?: string;
  passcode: string;
}

export const listTeacherTests = () =>
  api.get<Test[]>('/teacher/tests');

export const createTest = (data: CreateTestPayload) =>
  api.post<Test>('/teacher/tests', data);

export const updateTest = (testId: number, data: CreateTestPayload) =>
  api.put<Test>(`/teacher/tests/${testId}`, data);

export const deleteTest = (testId: number) =>
  api.delete(`/teacher/tests/${testId}`);
