// src/pages/LandingPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const passcodeRef = useRef<HTMLInputElement>(null);

  const [passcode, setPasscode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard: Đẩy giáo viên vào thẳng dashboard nếu đã login
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'TEACHER') {
      navigate('/dashboard');
    }
    passcodeRef.current?.focus();
  }, [navigate]);

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = studentName.trim();
    const trimmedPasscode = passcode.trim();

    if (!trimmedName || !trimmedPasscode) return;

    setIsLoading(true);
    try {
      // Đợi ghép API thật của nhóm sau
      const response = await axios.post('/api/student/access', {
        passcode: trimmedPasscode,
        name: trimmedName
      });
      
      localStorage.setItem('student_token', response.data.token);
      navigate(`/test/${response.data.testId}`);
      
    } catch (err: any) {
      setError("Invalid passcode. Check with your teacher.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !passcode.trim() || !studentName.trim() || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* PUBLIC HEADER (Tương đồng với AuthLayout nhưng có nút Login) */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Edu<span className="text-blue-600">Exam</span>
          </span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Teacher Login
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 tracking-tight">
            Enter your passcode to begin
          </h1>
          <p className="text-slate-500 mb-8 text-lg">
            No account needed — just your name and the code from your teacher.
          </p>

          <form 
            onSubmit={handleStartTest} 
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left"
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Passcode</label>
                <input
                  ref={passcodeRef}
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  maxLength={20}
                  autoComplete="off"
                  placeholder="e.g. MATH2024"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all
                  ${isButtonDisabled 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                  }`}
              >
                {isLoading ? 'Processing...' : 'Start Test'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;