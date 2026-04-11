import api from './client';

export interface AccessPayload {
  passcode: string;
  studentName: string;
}

export interface AccessResponse {
  token: string;
  testId: number;
  testTitle: string;
  studentId: number;
}

export interface StudentOption {
  id: number;
  optionText: string;
  displayOrder: number;
}

export interface StudentQuestion {
  id: number;
  questionText: string;
  points: number;
  displayOrder: number;
  options: StudentOption[];
}

export interface StudentTestData {
  testTitle: string;
  testDescription: string;
  totalQuestions: number;
  questions: StudentQuestion[];
}

export interface SubmitAnswer {
  questionId: number;
  selectedOptionId: number;
}

export interface SubmitResponse {
  attemptId: number;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface AttemptQuestion {
  questionId: number;
  questionText: string;
  points: number;
  selectedOptionId: number;
  selectedOptionText: string;
  correctOptionId: number;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface AttemptResult {
  attemptId: number;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  questions: AttemptQuestion[];
}

export interface PastAttempt {
  attemptId: number;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export const studentAccess = (data: AccessPayload) =>
  api.post<AccessResponse>('/student/access', data);

export const getStudentQuestions = (testId: number) =>
  api.get<StudentTestData>(`/student/tests/${testId}/questions`);

export const submitTest = (testId: number, answers: SubmitAnswer[]) =>
  api.post<SubmitResponse>(`/student/tests/${testId}/submit`, { answers });

export const getAttemptResult = (attemptId: number) =>
  api.get<AttemptResult>(`/student/attempts/${attemptId}`);

export const getMyResults = () =>
  api.get<PastAttempt[]>('/student/my-results');
