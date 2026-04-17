import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Đổi tên import cho khớp với file service mới
import { StudentService } from '../services/studentService';
import { CheckCircle, XCircle, Info, ChevronLeft, Loader2, Award, UserCheck, Clock } from 'lucide-react';

const DetailResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDetail = async () => {
            if (!attemptId) return;
            try {
                // Đổi getAttemptDetail -> getAttemptResult
                const result = await StudentService.getAttemptResult(Number(attemptId));
                setData(result);
            } catch (error) {
                console.error("Error loading detail:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [attemptId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
            <Loader2 className="animate-spin text-[#0056D2]" size={40} />
        </div>
    );

    if (!data) return (
        <div className="p-20 text-center">
            <p className="text-gray-500 mb-4">Practice data could not be found.</p>
            <button onClick={() => navigate('/my-results')} className="text-[#0056D2] font-bold underline">
                Go back to history
            </button>
        </div>
    );

    // Mẹo: Nếu Backend trả về "details" thay vì "questions", mình gán lại để code dưới không lỗi
    const questionsList = data.questions || data.details || [];

    return (
        <div className="min-h-screen bg-[#F5F7F8] py-12 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-[#D1D7DC] overflow-hidden mb-8">
                    <div className="bg-[#0056D2] h-2 w-full" />
                    <div className="p-10">
                        <div className="flex justify-between items-start flex-wrap gap-6">
                            <div className="space-y-4">
                                <button
                                    onClick={() => navigate('/my-results')}
                                    className="text-[#0056D2] flex items-center gap-1 text-sm font-bold hover:underline mb-4"
                                >
                                    <ChevronLeft size={16} /> BACK TO HISTORY
                                </button>
                                <h1 className="text-4xl font-bold text-[#1F1F1F] tracking-tight leading-tight">
                                    {data.testTitle}
                                </h1>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 py-2 rounded-md border border-[#E9ECEF]">
                                        <UserCheck size={16} className="text-[#0056D2]" />
                                        <span className="text-sm text-[#1F1F1F]">
                                            Instructor: <b className="font-semibold text-[#0056D2]">{data.teacherName || "Academy Team"}</b>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#F8F9FA] px-4 py-2 rounded-md border border-[#E9ECEF]">
                                        <Clock size={16} className="text-[#636363]" />
                                        <span className="text-sm text-[#636363]">
                                            {data.submittedAt ? `${new Date(data.submittedAt).toLocaleTimeString('vi-VN')} • ${new Date(data.submittedAt).toLocaleDateString('vi-VN')}` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Score */}
                            <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-[#F0F4FA] bg-white">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-[#0056D2]">{Math.round(data.percentage || 0)}%</p>
                                    <p className="text-[9px] font-black text-[#636363] uppercase tracking-tighter">Final Grade</p>
                                </div>
                                {(data.percentage >= 80) && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-md">
                                        <Award size={20} className="text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-8">
                    <h2 className="text-xl font-bold text-[#1F1F1F] flex items-center gap-2 px-2">
                        Review Questions <span className="bg-[#D1D7DC] text-[#1F1F1F] text-xs px-2 py-0.5 rounded-full">{questionsList.length} Items</span>
                    </h2>

                    {questionsList.map((q: any, idx: number) => (
                        <div key={q.questionId || idx} className="bg-white rounded-xl border border-[#D1D7DC] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className={`px-8 py-4 flex justify-between items-center ${q.isCorrect ? 'bg-[#F6FFF8]' : 'bg-[#FFF9F9]'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold border border-[#D1D7DC]">
                                        {idx + 1}
                                    </span>
                                    <span className={`text-xs font-black uppercase tracking-widest ${q.isCorrect ? 'text-[#008148]' : 'text-[#B32D0F]'}`}>
                                        {q.isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-[#636363] bg-white px-3 py-1 rounded border border-[#D1D7DC]">
                                    {q.points || 0} / {q.points || 0} Pts
                                </span>
                            </div>

                            <div className="p-10">
                                <p className="text-xl text-[#1F1F1F] font-semibold mb-8 leading-relaxed">
                                    {q.questionText || q.content}
                                </p>

                                <div className="grid gap-4">
                                    <div className={`p-5 rounded-lg border-2 flex items-center gap-4 ${q.isCorrect ? 'bg-white border-[#008148]' : 'bg-white border-[#B32D0F]'}`}>
                                        {q.isCorrect ? <CheckCircle className="text-[#008148]" size={24} /> : <XCircle className="text-[#B32D0F]" size={24} />}
                                        <div>
                                            <p className="text-xs font-bold text-[#636363] uppercase mb-1">Your Selection</p>
                                            <p className="text-lg font-medium">{q.selectedOptionText || q.userAnswer || "No answer"}</p>
                                        </div>
                                    </div>

                                    {!q.isCorrect && (
                                        <div className="mt-4 p-6 bg-[#F0F4FA] rounded-lg border border-[#CFE1F6]">
                                            <div className="flex gap-3 items-start">
                                                <Info size={20} className="text-[#0056D2] mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#1F1F1F] mb-1">Correct Answer & Explanation:</p>
                                                    <p className="text-[#0056D2] font-bold text-lg mb-2">{q.correctOptionText || q.rightAnswer}</p>
                                                    <p className="text-sm text-[#636363] italic">"{q.explanation || "No further explanation provided."}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="mt-16 text-center border-t border-[#D1D7DC] pt-12">
                    <p className="text-sm text-[#636363] mb-8 font-medium italic">
                        "Every mistake is a lesson. Keep going, Huy!"
                    </p>
                    <button
                        onClick={() => navigate('/my-results')}
                        className="bg-[#0056D2] text-white px-12 py-5 rounded-sm font-bold text-sm tracking-widest hover:bg-[#00419E] shadow-xl transition-all active:scale-95"
                    >
                        RETURN TO MY DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailResult;