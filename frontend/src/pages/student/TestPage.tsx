import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentQuestions, submitTest, type StudentTestData } from '../../api/student';
import ConfirmModal from '../../components/ConfirmModal';
import { AxiosError } from 'axios';

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const tid = Number(testId);

  const [testData, setTestData] = useState<StudentTestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [tid]);

  async function loadQuestions() {
    try {
      const { data } = await getStudentQuestions(tid);
      setTestData(data);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Failed to load test';
      setError(msg || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: number, optionId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = testData?.totalQuestions ?? 0;
  const unansweredCount = totalQuestions - answeredCount;

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: optId,
      }));
      const { data } = await submitTest(tid, payload);
      navigate(`/results/${data.attemptId}`);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Submission failed';
      setError(msg || 'Failed to submit test');
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !testData) {
    return (
      <div className="py-20 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!testData) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{testData.testTitle}</h1>
        {testData.testDescription && (
          <p className="mt-1 text-sm text-gray-500">{testData.testDescription}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {answeredCount} of {totalQuestions} answered
          </span>
          <span className="text-gray-400">
            {unansweredCount > 0 ? `${unansweredCount} remaining` : 'All answered!'}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {testData.questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900">
                <span className="mr-2 text-indigo-600">Q{idx + 1}.</span>
                {q.questionText}
              </h3>
              <span className="ml-4 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {q.points} pts
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    answers[q.id] === opt.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt.id}
                    onChange={() => selectAnswer(q.id, opt.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{opt.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center pb-8">
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
        >
          Submit Test
        </button>
      </div>

      {/* Submit Confirmation Modal (FE-8.1) */}
      <ConfirmModal
        open={showConfirm}
        title="Submit Test"
        message={
          unansweredCount > 0
            ? `You have answered ${answeredCount} of ${totalQuestions} questions. ${unansweredCount} question${unansweredCount > 1 ? 's are' : ' is'} unanswered. Are you sure you want to submit?`
            : `You have answered all ${totalQuestions} questions. Ready to submit?`
        }
        confirmLabel={submitting ? 'Submitting...' : 'Confirm Submit'}
        cancelLabel="Go Back"
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
