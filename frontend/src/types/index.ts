export interface Option {
    id?: number | string;
    optionText: string;
    isCorrect: boolean;
    displayOrder: number;
}

export interface Question {
    id: number | string;
    questionText: string;
    points: number;
    displayOrder: number;
    options: Option[];
}

export interface QuestionPayload {
    questionText: string;
    points: number;
    displayOrder: number;
    options: Option[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Test {
  id: string;
  title: string;
  description: string;
  passcode: string;
}

export interface SimpleQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}
