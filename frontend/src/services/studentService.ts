import axios from 'axios';

// Đảm bảo URL này khớp với Port của Backend (ví dụ http://localhost:8080)
const API_BASE_URL = 'http://localhost:8080/api/student';

/**
 * TOKEN TEST (STUDENT ROLE)
 * Huy dán token vào đây để test nhanh nếu chưa làm trang Login
 */
const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwidGVzdElkIjoxLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTc3NTg5NDgyMiwiZXhwIjoxNzc1OTgxMjIyfQ.U53_inbiG517W8tGGniBGvNSSn4WoUOJVUOAjgCD7VU';

const getAuthHeaders = () => {
    // Ưu tiên lấy từ localStorage, nếu không có thì dùng token dán sẵn ở trên
    const token = localStorage.getItem('token') || HARDCODED_TOKEN;

    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    };
};

export const studentService = {
    /**
     * BE-11.1: Lấy danh sách lịch sử làm bài (Past Results)
     * Trả về mảng các bài đã làm của học sinh
     */
    getMyResults: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/my-results`, getAuthHeaders());
            // Trả về mảng rỗng nếu data bị null để tránh lỗi .map() ở UI
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            console.error("Lỗi lấy lịch sử bài làm:", error.response?.status);
            // Nếu lỗi 403/401, trả về mảng rỗng để không crash giao diện
            return [];
        }
    },

    /**
     * BE-10.1: Lấy chi tiết một bài làm (Result Detail)
     * @param attemptId ID của lượt làm bài
     */
    getAttemptDetail: async (attemptId: string | number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/attempts/${attemptId}`, getAuthHeaders());
            return response.data;
        } catch (error: any) {
            console.error("Lỗi lấy chi tiết kết quả:", error.response?.status);
            throw error; // Quăng lỗi để màn hình DetailResult xử lý hiển thị thông báo
        }
    }
};