import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    AlertCircle,
    FileText,
    ChevronUp,
    ChevronDown,
    Loader2,
    LayoutDashboard,
    Settings2
} from 'lucide-react';

import { testService } from '../services/testService';
import type { Question, QuestionPayload } from '../types';
import { QuestionCard } from '../components/teacher/QuestionCard';
import { QuestionForm } from '../components/teacher/QuestionForm';

export default function EditTest() {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    // State Management
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    /**
     * BE-3.2: Fetch Questions for a Test
     */
    const fetchQuestions = useCallback(async () => {
        if (!testId) return;
        setIsLoading(true);
        try {
            const data = await testService.getQuestions(testId);
            // Ensure questions are sorted by displayOrder per BE-3.2
            const sortedData = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
            setQuestions(sortedData);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Unable to retrieve lesson data from the server.');
        } finally {
            setIsLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    /**
     * BE-3.1 & BE-3.3: Create or Update Question
     */
    const handleSave = async (payload: QuestionPayload) => {
        if (!testId) return;
        try {
            if (editingId) {
                // BE-3.3 Update
                const updatedQ = await testService.updateQuestion(testId, editingId, payload);
                setQuestions(prev => prev.map(q => q.id === editingId ? updatedQ : q));
                setEditingId(null);
            } else {
                // BE-3.1 Create
                const newQ = await testService.createQuestion(testId, payload);
                setQuestions(prev => [...prev, newQ]);
                setIsAdding(false);
            }
        } catch (err: any) {
            const backendError = err.response?.data?.error || "Check that you have at least 2 options and exactly 1 correct answer.";
            alert(`Drafting Error: ${backendError}`);
        }
    };

    /**
     * BE-3.4: Delete Question
     */
    const handleDelete = async (id: string | number) => {
        if (!testId) return;
        const confirmMsg = "Remove this practice item? This will also delete all associated answer options.";
        if (!window.confirm(confirmMsg)) return;

        try {
            await testService.deleteQuestion(testId, id);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            alert("Failed to sync deletion with server. Please refresh.");
            fetchQuestions();
        }
    };

    /**
     * BE-3.5: Reorder Questions
     */
    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (!testId) return;
        const newQuestions = [...questions];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        if (swapIndex < 0 || swapIndex >= newQuestions.length) return;

        // Optimistic UI Update: Swap locally first
        [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
        setQuestions([...newQuestions]);

        try {
            // BE-3.5 Send the new ID array to server
            await testService.reorderQuestions(testId, newQuestions.map(q => q.id));
        } catch (err) {
            console.error("Reorder failed, reverting...");
            fetchQuestions();
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#F5F7F8] flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#0056D2] mb-4" size={32} />
            <p className="text-[#636363] font-medium animate-pulse">Loading Practice Designer...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-lg border border-red-100 shadow-sm text-center max-w-md">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
                <h2 className="text-[#1F1F1F] font-bold text-xl mb-2">Connection Issue</h2>
                <p className="text-[#636363] text-sm mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#0056D2] text-white px-6 py-2 rounded font-bold text-sm hover:bg-[#00419E]"
                >
                    RETRY CONNECTION
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F7F8] pb-32">
            {/* Coursera-Themed Sticky Header */}
            <header className="bg-white border-b border-[#D1D7DC] py-6 px-8 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">
                            <Settings2 size={12} />
                            Course Content Management
                        </div>
                        <h1 className="text-2xl font-semibold text-[#1F1F1F]">
                            {testId ? 'Customize Practice Session' : 'Draft New Practice'}
                        </h1>
                        <div className="flex items-center gap-3 pt-1">
                            <span className="text-xs bg-[#F0F4FA] text-[#0056D2] px-2 py-0.5 rounded font-bold border border-[#CFE1F6]">
                                {questions.length} Items
                            </span>
                            <span className="text-xs text-[#636363] font-medium">
                                Total Points: <b>{questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)}</b>
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="text-[#636363] hover:text-[#1F1F1F] font-bold text-sm px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { setIsAdding(true); setEditingId(null); }}
                            disabled={isAdding}
                            className="bg-[#0056D2] hover:bg-[#00419E] text-white font-bold px-6 py-2.5 rounded text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            <Plus size={18} strokeWidth={3} /> Add Question
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 mt-10">
                <div className="space-y-6">
                    {/* Render Questions */}
                    {questions.map((q, index) => (
                        <div key={q.id || `question-${index}`} className="scroll-mt-32">
                            {editingId === q.id ? (
                                <div className="bg-white rounded-lg shadow-xl border-2 border-[#0056D2] overflow-hidden">
                                    <div className="bg-[#F0F4FA] px-6 py-2 border-b border-[#CFE1F6]">
                                        <span className="text-[10px] font-bold text-[#0056D2] uppercase">Editing Item #{index + 1}</span>
                                    </div>
                                    <QuestionForm
                                        initialData={q}
                                        displayOrder={q.displayOrder}
                                        onSave={handleSave}
                                        onCancel={() => setEditingId(null)}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-[#D1D7DC] hover:border-[#0056D2] transition-all group shadow-sm">
                                    <QuestionCard
                                        question={q}
                                        index={index}
                                        totalQuestions={questions.length}
                                        onEdit={() => { setEditingId(q.id); setIsAdding(false); }}
                                        onDelete={() => handleDelete(q.id)}
                                        onMove={(dir) => handleReorder(index, dir)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add New Question Form */}
                    {isAdding && (
                        <div className="bg-white rounded-lg shadow-xl border-2 border-[#0056D2] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-[#F0F4FA] px-6 py-3 border-b border-[#CFE1F6] flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">Drafting New Entry</span>
                            </div>
                            <QuestionForm
                                displayOrder={questions.length + 1}
                                onSave={handleSave}
                                onCancel={() => setIsAdding(false)}
                            />
                        </div>
                    )}

                    {/* Empty State */}
                    {questions.length === 0 && !isAdding && (
                        <div className="text-center py-24 bg-white rounded-lg border border-dashed border-[#D1D7DC]">
                            <div className="w-16 h-16 bg-[#F5F7F8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#D1D7DC]">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1F1F1F] mb-2">No items in this practice yet</h3>
                            <p className="text-[#636363] text-sm max-w-xs mx-auto mb-8">Start by adding your first question to help students test their knowledge.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-[#0056D2] text-white font-bold text-sm px-8 py-3 rounded hover:bg-[#00419E] transition-all"
                            >
                                + CREATE FIRST ITEM
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Reference */}
                {questions.length > 0 && (
                    <div className="mt-12 text-center text-[#636363] text-xs font-medium uppercase tracking-[0.2em]">
                        End of practice session content
                    </div>
                )}
            </main>
        </div>
    );
}