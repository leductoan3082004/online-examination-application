import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyResults, type PastAttempt } from '../../api/student';

export default function PastResultsPage() {
  const [results, setResults] = useState<PastAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      const { data } = await getMyResults();
      setResults(data);
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Past Results</h1>

      {results.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-gray-500">No results yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Take a Test
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {results.map((r) => {
            const percentColor =
              r.percentage >= 80 ? 'text-green-600' :
              r.percentage >= 50 ? 'text-yellow-600' : 'text-red-600';

            return (
              <Link
                key={r.attemptId}
                to={`/results/${r.attemptId}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.testTitle}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${percentColor}`}>
                      {r.percentage.toFixed(0)}%
                    </span>
                    <p className="text-sm text-gray-500">
                      {r.score} / {r.maxScore}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
