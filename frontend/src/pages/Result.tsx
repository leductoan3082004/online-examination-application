import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { BookOpen, Calendar, ChevronRight, Loader2, Trophy, User } from 'lucide-react';

const Result = () => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Giả định lấy tên từ Token/Session
    const studentName = "Tran Quang Huy";

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await studentService.getMyResults();
                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7F8]">
            <Loader2 className="animate-spin text-[#0056D2] mb-4" size={32} />
            <p className="text-[#636363] font-medium animate-pulse">Gathering your achievements...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] py-12 px-8">
            <div className="max-w-5xl mx-auto">
                {/* Enhanced Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-[#EEE] pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[#E6F0FF] text-[#0056D2] p-1.5 rounded-md">
                                <User size={16} />
                            </div>
                            <span className="text-sm font-bold text-[#0056D2] uppercase tracking-widest">{studentName}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-[#1F1F1F] tracking-tight">
                            Learning History
                        </h1>
                        <p className="text-[#636363] text-lg mt-2">
                            You have completed <span className="text-[#1F1F1F] font-semibold">{results.length}</span> practice sessions.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#0056D2] text-white px-10 py-4 rounded-sm font-bold text-sm hover:bg-[#00419E] transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        START NEW PRACTICE
                    </button>
                </div>

                {results.length === 0 ? (
                    <div className="bg-white p-24 rounded-xl text-center border-2 border-dashed border-[#D1D7DC]">
                        <Trophy size={48} className="mx-auto mb-6 text-[#D1D7DC]" />
                        <h2 className="text-2xl font-semibold text-[#1F1F1F]">No records yet</h2>
                        <p className="text-[#636363] mt-2">Your journey is just beginning. Take your first test today!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {results.map((res) => (
                            <div
                                key={res.attemptId}
                                onClick={() => navigate(`/results/${res.attemptId}`)}
                                className="group bg-white p-7 rounded-lg border border-[#D1D7DC] flex items-center justify-between hover:border-[#0056D2] hover:shadow-[0_8px_24px_rgba(0,86,210,0.08)] cursor-pointer transition-all"
                            >
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 bg-[#F0F4FA] rounded-full flex items-center justify-center text-[#0056D2] group-hover:bg-[#0056D2] group-hover:text-white transition-colors">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1F1F1F] mb-2">{res.testTitle}</h3>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm">
                                            <span className="flex items-center gap-1.5 text-[#636363]">
                                                <Calendar size={15} />
                                                {new Date(res.submittedAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="px-3 py-1 bg-[#F8F9FA] rounded-full text-[#0056D2] font-bold border border-[#E9ECEF]">
                                                Score: {res.score}/{res.maxScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="hidden sm:block text-right border-r border-[#EEE] pr-10">
                                        <p className="text-[10px] text-[#636363] font-black uppercase tracking-[0.2em] mb-1">Status</p>
                                        <p className={`font-bold ${res.percentage >= 50 ? 'text-[#008148]' : 'text-[#B32D0F]'}`}>
                                            {res.percentage >= 50 ? 'PASSED' : 'REVIEW'}
                                        </p>
                                    </div>
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-3xl font-black text-[#1F1F1F] leading-none">{Math.round(res.percentage)}%</p>
                                    </div>
                                    <ChevronRight className="text-[#D1D7DC] group-hover:translate-x-1 group-hover:text-[#0056D2] transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Result;