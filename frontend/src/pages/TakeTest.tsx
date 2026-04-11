import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, ClipboardList, ArrowRight, AlertCircle, Clock, BookOpen } from 'lucide-react';

const TakeTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<'welcome' | 'exam'>('welcome');
  const [studentInfo, setStudentInfo] = useState({ name: '', studentId: '' });
  const [error, setError] = useState<string | null>(null);

  // Giả lập thông tin đề thi (sau này sẽ lấy từ API)
  const testInfo = {
    title: "Midterm Examination - Web Development",
    duration: 60,
    questionsCount: 40,
    teacher: "Dr. Smith"
  };

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.name.trim()) {
      setError("Please enter your full name to start the test.");
      return;
    }
    setError(null);
    setStep('exam');
    // Save to local session if needed
    console.log("Student started exam:", studentInfo);
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Header Trang Chờ */}
            <div className="bg-primary p-8 text-white text-center">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold mb-1">{testInfo.title}</h1>
              <p className="text-blue-100 text-sm opacity-90">Teacher: {testInfo.teacher}</p>
            </div>

            <div className="p-8">
              {/* Thông tin đề thi */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Duration</span>
                  <span className="text-slate-900 font-bold">{testInfo.duration} mins</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <BookOpen className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Questions</span>
                  <span className="text-slate-900 font-bold">{testInfo.questionsCount} items</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleStartExam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Student ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. STU12345"
                    value={studentInfo.studentId}
                    onChange={(e) => setStudentInfo({ ...studentInfo, studentId: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  Start Examination
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-slate-400">
                Ensure you have a stable internet connection before starting.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{testInfo.title}</h1>
            <p className="text-sm text-slate-500">Student: <span className="font-bold text-slate-700">{studentInfo.name}</span></p>
          </div>
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 font-mono font-bold">
            60:00
          </div>
        </header>
        
        <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-400 italic">Exam questions markup will be rendered here...</p>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
