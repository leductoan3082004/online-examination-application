import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listTeacherTests, deleteTest, type Test } from '../../api/tests';
import ConfirmModal from '../../components/ConfirmModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    try {
      const { data } = await listTeacherTests();
      setTests(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTest(deleteTarget.id);
      setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
        <Link
          to="/dashboard/tests/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Create New Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="text-5xl">📝</div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No tests yet</h2>
          <p className="mt-1 text-sm text-gray-500">Create your first test to get started!</p>
          <Link
            to="/dashboard/tests/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create Test
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              onClick={() => navigate(`/dashboard/tests/${test.id}/edit`)}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                  {test.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(test);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete test"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs text-indigo-700">
                  {test.passcode}
                </span>
                <span>{test.questionCount ?? 0} questions</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Created {new Date(test.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Test"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will delete all questions and student results. This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
