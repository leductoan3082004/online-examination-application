import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttemptResult, type AttemptResult } from '../../api/student';

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  async function loadResult() {
    try {
      const { data } = await getAttemptResult(Number(attemptId));
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!result) return null;

  const percentColor =
    result.percentage >= 80 ? 'text-green-600' :
    result.percentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="mx-auto max-w-3xl">
      {/* Score Summary */}
      <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-xl font-semibold text-gray-900">{result.testTitle}</h1>
        <div className="mt-4">
          <span className={`text-5xl font-bold ${percentColor}`}>
            {result.percentage.toFixed(0)}%
          </span>
        </div>
        <p className="mt-2 text-lg text-gray-600">
          {result.score} / {result.maxScore}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Submitted {new Date(result.submittedAt).toLocaleString()}
        </p>
      </div>

      {/* Question Breakdown */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Question Breakdown</h2>

        {result.questions.map((q, idx) => (
          <div
            key={q.questionId}
            className={`rounded-xl border-2 p-5 ${
              q.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900">
                <span className="mr-2 text-gray-500">Q{idx + 1}.</span>
                {q.questionText}
              </h3>
              <span
                className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  q.isCorrect
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {q.isCorrect ? `+${q.points}` : '0'} / {q.points}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-sm">
              <div className={`flex items-start gap-2 ${q.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                <span className="mt-0.5">{q.isCorrect ? '✓' : '✗'}</span>
                <span>
                  <strong>Your answer:</strong> {q.selectedOptionText}
                </span>
              </div>
              {!q.isCorrect && (
                <div className="flex items-start gap-2 text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Correct answer:</strong> {q.correctOptionText}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4 pb-8">
        <Link
          to="/my-results"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          My Results
        </Link>
        <Link
          to="/"
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
