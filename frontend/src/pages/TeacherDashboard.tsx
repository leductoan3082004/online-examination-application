import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, KeyRound, Clock, BarChart2 } from 'lucide-react';
import { TestService, type TestItem } from '../services/teacherTestService';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const data = await TestService.getTests();
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTests(sorted);
      } catch (error) {
        console.error('Failed to fetch tests', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleCreateTest = () => navigate('/teacher/create-test');
  const handleEditTest = (testId: string) => navigate(`/dashboard/tests/${testId}/edit`);

  const handleViewResults = (e: React.MouseEvent, testId: string) => {
    e.stopPropagation(); // Ngăn click vào card (mở trang edit)
    navigate(`/dashboard/tests/${testId}/results`);
  };

  const handleDeleteTest = async (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this test?');
    if (confirmDelete) {
      try {
        await TestService.deleteTest(testId);
        setTests(tests.filter((t) => t.id !== testId));
      } catch (error) {
        console.error('Failed to delete test', error);
        alert('Failed to delete the test. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Teacher Dashboard</h1>
            <p className="mt-1 text-gray-500 text-sm">Manage your online assessments and quizzes</p>
          </div>
          <button
            onClick={handleCreateTest}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-[#0056D2] hover:bg-[#00419E] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus size={18} /> Create New Test
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0056D2]"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-20 w-20 bg-blue-50 text-[#0056D2] rounded-2xl flex items-center justify-center mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm">Create your first test to start assessing students online.</p>
            <button onClick={handleCreateTest} className="flex items-center gap-2 bg-[#0056D2] hover:bg-[#00419E] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              <Plus size={20} /> Create your first test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                onClick={() => handleEditTest(test.id)}
                className="group bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl transition-all cursor-pointer relative flex flex-col"
              >
                <div className="flex justify-between items-start mb-4 pr-20">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-[#0056D2] transition-colors line-clamp-2">
                    {test.title}
                  </h3>

                  {/* Action Buttons Group */}
                  <div className="absolute top-6 right-6 flex gap-1">
                    <button
                      onClick={(e) => handleViewResults(e, test.id)}
                      className="p-2 text-slate-300 hover:text-[#0056D2] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="View Class Results"
                    >
                      <BarChart2 size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTest(e, test.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Test"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <KeyRound size={16} className="text-[#0056D2]" /> Passcode:
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-lg font-mono font-bold text-[#0056D2] tracking-wider text-xs">
                      {test.passcode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1.5 text-xs">
                      <FileText size={16} className="text-slate-300" /> {test.questionCount} Questions
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock size={16} className="text-slate-300" /> {formatDate(test.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;