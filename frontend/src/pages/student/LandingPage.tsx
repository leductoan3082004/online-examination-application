import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAccess } from '../../api/student';
import { useAuth } from '../../contexts/AuthContext';
import { AxiosError } from 'axios';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginStudent } = useAuth();
  const [form, setForm] = useState({ passcode: '', studentName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.passcode.trim() || !form.studentName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await studentAccess(form);
      loginStudent(data.token, data.testId, data.studentId, form.studentName);
      navigate(`/test/${data.testId}`);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Invalid passcode';
      setError(msg || 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ExamApp</h1>
          <p className="mt-2 text-lg text-gray-500">Enter your test passcode to begin</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Test Passcode</label>
              <input
                type="text"
                value={form.passcode}
                onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm tracking-wider focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter the passcode from your teacher"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Start Test'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
