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

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}
