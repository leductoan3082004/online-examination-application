import api from './client';

export interface AnswerOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface Question {
  id?: number;
  questionText: string;
  points: number;
  displayOrder: number;
  options: AnswerOption[];
}

export const listQuestions = (testId: number) =>
  api.get<Question[]>(`/teacher/tests/${testId}/questions`);

export const addQuestion = (testId: number, data: Omit<Question, 'id'>) =>
  api.post<Question>(`/teacher/tests/${testId}/questions`, data);

export const updateQuestion = (testId: number, questionId: number, data: Omit<Question, 'id'>) =>
  api.put<Question>(`/teacher/tests/${testId}/questions/${questionId}`, data);

export const deleteQuestion = (testId: number, questionId: number) =>
  api.delete(`/teacher/tests/${testId}/questions/${questionId}`);

export const reorderQuestions = (testId: number, questionIds: number[]) =>
  api.put(`/teacher/tests/${testId}/questions/reorder`, { questionIds });
