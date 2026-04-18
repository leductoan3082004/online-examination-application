import axios from 'axios';
import type { Question, QuestionPayload } from '../types';

// 1. Thêm đầy đủ URL Backend để tránh gọi nhầm vào Port của Frontend
const API_BASE_URL = 'http://localhost:8080/api/teacher/tests';

// 2. Token của Huy (Lưu ý: Nếu token này hết hạn, Swagger vẫn báo 403)
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhQGdtYWlsLmNvbSIsInJvbGUiOiJURUFDSEVSIiwiaWF0IjoxNzc1ODkzNzY5LCJleHAiOjE3NzU5ODAxNjl9.t-wVa_OLInI5hrq_YzKwVIdujDqswpJ69CJpngB1s94';

const getAuthHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*' // Khớp với cái Swagger yêu cầu
    }
});

export const testService = {
    // BE-3.2: Get Questions
    getQuestions: async (testId: string): Promise<Question[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${testId}/questions`, getAuthHeaders());
            // Đảm bảo trả về mảng, nếu Backend trả về null/undefined thì trả về [] để không crash .map()
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            console.error("Lỗi lấy danh sách câu hỏi:", error.response?.status);
            return []; // Trả về mảng rỗng để QuestionCard không bị lỗi .map
        }
    },

    // BE-3.1: Add Question
    createQuestion: async (testId: string, payload: QuestionPayload): Promise<Question> => {
        const response = await axios.post(`${API_BASE_URL}/${testId}/questions`, payload, getAuthHeaders());
        return response.data;
    },

    // BE-3.3: Update Question
    updateQuestion: async (testId: string, questionId: string | number, payload: QuestionPayload): Promise<Question> => {
        const response = await axios.put(`${API_BASE_URL}/${testId}/questions/${questionId}`, payload, getAuthHeaders());
        return response.data;
    },

    // BE-3.4: Delete Question
    deleteQuestion: async (testId: string, questionId: string | number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/${testId}/questions/${questionId}`, getAuthHeaders());
    },

    // BE-3.5: Reorder Questions
    reorderQuestions: async (testId: string, questionIds: (string | number)[]): Promise<void> => {
        // Kiểm tra xem Backend nhận Body là { questionIds: [...] } hay chỉ là mảng [...]
        await axios.put(`${API_BASE_URL}/${testId}/questions/reorder`, { questionIds }, getAuthHeaders());
    }
};