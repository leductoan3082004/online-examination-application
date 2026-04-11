import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import Provider của bạn vào đây
import { AppProvider } from './context/AppContext';
//import { AuthProvider } from './context/AuthContext';

import EditTest from './pages/EditTest';
import Result from './pages/Result';
import DetailResult from './pages/DetailResult';

export default function AppRoutes() {
    return (
        // 2. Bọc Provider ở ngoài cùng để tất cả các trang bên trong đều dùng được dữ liệu
        //<AuthProvider>
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    {/* Trang chỉnh sửa đề thi */}
                    <Route path="/dashboard/tests/:testId/edit" element={<EditTest />} />

                    {/* FE-11.1: Trang danh sách kết quả (My Past Results) */}
                    <Route path="/my-results" element={<Result />} />

                    {/* FE-10.1: Trang chi tiết kết quả (Result Screen) */}
                    <Route path="/results/:attemptId" element={<DetailResult />} />

                    {/* 3. QUAN TRỌNG: Chuyển Route path="*" xuống cuối cùng 
                            để nó không "chặn" mất các đường dẫn bên trên */}
                    <Route path="*" element={<Navigate to="/dashboard/tests/123/edit" replace />} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
        // </AuthProvider>
    );
}