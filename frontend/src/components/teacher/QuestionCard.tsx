import React from 'react';
import {
    Pencil,
    Trash2,
    ChevronUp,
    ChevronDown,
    CheckCircle2,
    HelpCircle,
    MoreVertical
} from 'lucide-react';
import type { Question } from '../../types';

interface QuestionCardProps {
    question: Question;
    index: number;
    totalQuestions: number;
    onEdit: () => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    totalQuestions,
    onEdit,
    onDelete,
    onMove
}) => {
    // Bảo vệ dữ liệu: Nếu question hoặc options bị undefined sẽ không crash
    const options = question?.options || [];
    const points = question?.points || 0;

    return (
        <div className="group bg-white p-6 transition-all">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    {/* Header: Số thứ tự và Điểm */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F0F4FA] text-[#0056D2] text-[10px] font-bold border border-[#CFE1F6]">
                            {index + 1}
                        </span>
                        <span className="text-[10px] font-bold text-[#636363] uppercase tracking-wider">
                            Multiple Choice • {points} Points
                        </span>
                    </div>

                    {/* Nội dung câu hỏi */}
                    <h3 className="text-base font-semibold text-[#1F1F1F] leading-relaxed mb-6">
                        {question?.questionText || "No question text provided"}
                    </h3>

                    {/* Danh sách Options - Đã fix lỗi .map() */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options.length > 0 ? (
                            options.map((option, optIdx) => (
                                <div
                                    key={option.id || `opt-${index}-${optIdx}`}
                                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${option.isCorrect
                                        ? 'bg-[#F6FFF8] border-[#008148] shadow-sm'
                                        : 'bg-white border-[#D1D7DC] opacity-80'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${option.isCorrect
                                        ? 'border-[#008148] bg-[#008148]'
                                        : 'border-[#D1D7DC]'
                                        }`}>
                                        {option.isCorrect && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${option.isCorrect ? 'font-bold text-[#008148]' : 'text-[#1F1F1F]'}`}>
                                        {option.optionText}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 p-4 bg-yellow-50 border border-yellow-100 rounded text-yellow-700 text-xs flex items-center gap-2">
                                <HelpCircle size={14} /> This question has no options defined.
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbar điều khiển bên phải */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onMove('up')}
                        disabled={index === 0}
                        className="p-2 text-[#636363] hover:bg-[#F0F4FA] hover:text-[#0056D2] rounded-md disabled:opacity-20"
                        title="Move Up"
                    >
                        <ChevronUp size={18} />
                    </button>

                    <button
                        onClick={onEdit}
                        className="p-2 text-[#636363] hover:bg-[#F0F4FA] hover:text-[#0056D2] rounded-md"
                        title="Quick Edit"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        onClick={onDelete}
                        className="p-2 text-[#636363] hover:bg-red-50 hover:text-red-600 rounded-md"
                        title="Remove Item"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        onClick={() => onMove('down')}
                        disabled={index === totalQuestions - 1}
                        className="p-2 text-[#636363] hover:bg-[#F0F4FA] hover:text-[#0056D2] rounded-md disabled:opacity-20"
                        title="Move Down"
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>
            </div>


        </div>
    );
};