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
export interface Exam {
    id: string;
    title: string;
    description?: string;
    teacherId: string;
    questions: Question[];
    createdAt: string;
}

export interface Result {
    id: string;             // attemptId
    examId: string;
    examTitle: string;
    studentName: string;
    score: number;
    totalPoints: number;
    submittedAt: string;
    answers: StudentAnswer[];
}


export interface StudentAnswer {
    questionText: string;
    selectedOptionText: string;
    correctOptionText: string;
    selectedOption: number;
    correctOption: number;
    points: number;
}