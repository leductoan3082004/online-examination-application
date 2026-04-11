import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listTeacherTests, updateTest } from '../../api/tests';
import {
  listQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  type Question,
  type AnswerOption,
} from '../../api/questions';
import ConfirmModal from '../../components/ConfirmModal';
import axios from 'axios';
import api from '../../api/client';
import type { Test } from '../../api/tests';

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: string }).error === 'string') {
      return (data as { error: string }).error;
    }
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Cannot reach the API. Start the backend on port 8080 and run the app with npm run dev (Vite proxies /api).';
    }
    if (err.response) {
      return `Request failed (${err.response.status}).`;
    }
    return err.message || 'Request failed';
  }
  if (err instanceof Error) return err.message;
  return 'Failed to load test';
}

const emptyOption = (order: number): AnswerOption => ({
  optionText: '',
  isCorrect: false,
  displayOrder: order,
});

const emptyQuestion = (order: number): Question => ({
  questionText: '',
  points: 10,
  displayOrder: order,
  options: [emptyOption(1), emptyOption(2)],
});

export default function EditTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const tid = Number(testId);

  const [testForm, setTestForm] = useState({ title: '', description: '', passcode: '' });
  const [testSaving, setTestSaving] = useState(false);
  const [testError, setTestError] = useState('');
  const [testSuccess, setTestSuccess] = useState('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [questionSaving, setQuestionSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [detailSource, setDetailSource] = useState<'full' | 'list' | null>(null);

  useEffect(() => {
    loadData();
  }, [tid]);

  async function loadData() {
    setLoadError('');
    setLoading(true);
    setDetailSource(null);
    if (!Number.isFinite(tid)) {
      setLoadError('Invalid test link.');
      setLoading(false);
      return;
    }
    try {
      const [testSettled, qSettled] = await Promise.allSettled([
        api.get<Test>(`/teacher/tests/${tid}`),
        listQuestions(tid),
      ]);

      if (qSettled.status === 'rejected') {
        throw qSettled.reason;
      }
      setQuestions(qSettled.value.data);

      if (testSettled.status === 'fulfilled') {
        const d = testSettled.value.data;
        setTestForm({
          title: d.title,
          description: d.description || '',
          passcode: d.passcode,
        });
        setDetailSource('full');
        return;
      }

      const reason = testSettled.reason;
      const status = axios.isAxiosError(reason) ? reason.response?.status : undefined;
      const looksLikeMissingGetRoute = status === 404 || status === 405;

      if (looksLikeMissingGetRoute) {
        const { data: tests } = await listTeacherTests();
        const summary = tests.find((t) => t.id === tid);
        if (!summary) {
          setQuestions([]);
          setLoadError('This test was not found. It may have been deleted or you may not have access.');
          return;
        }
        setTestForm({
          title: summary.title,
          description: '',
          passcode: summary.passcode,
        });
        setDetailSource('list');
        return;
      }

      throw reason;
    } catch (err) {
      setLoadError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function retryLoadFullDetail() {
    setTestError('');
    setTestSuccess('');
    try {
      const { data } = await api.get<Test>(`/teacher/tests/${tid}`);
      setTestForm({
        title: data.title,
        description: data.description || '',
        passcode: data.passcode,
      });
      setDetailSource('full');
      setTestSuccess('Full test details loaded.');
      setTimeout(() => setTestSuccess(''), 3000);
    } catch (err) {
      setTestError(extractApiError(err));
    }
  }

  async function handleSaveTest(e: FormEvent) {
    e.preventDefault();
    if (detailSource === 'list') {
      setTestError('Load full test details before saving title, passcode, or description (avoids clearing your description).');
      return;
    }
    if (!testForm.title.trim() || !testForm.passcode.trim()) {
      setTestError('Title and passcode are required');
      return;
    }
    setTestSaving(true);
    setTestError('');
    setTestSuccess('');
    try {
      await updateTest(tid, testForm);
      setTestSuccess('Test details updated!');
      setTimeout(() => setTestSuccess(''), 3000);
    } catch (err) {
      setTestError(extractApiError(err));
    } finally {
      setTestSaving(false);
    }
  }

  function startAddQuestion() {
    setEditingQuestion(emptyQuestion(questions.length + 1));
    setIsNewQuestion(true);
    setQuestionError('');
  }

  function startEditQuestion(q: Question) {
    setEditingQuestion({ ...q, options: q.options.map((o) => ({ ...o })) });
    setIsNewQuestion(false);
    setQuestionError('');
  }

  function cancelEdit() {
    setEditingQuestion(null);
    setIsNewQuestion(false);
    setQuestionError('');
  }

  function updateEditingOption(index: number, field: keyof AnswerOption, value: string | boolean | number) {
    if (!editingQuestion) return;
    const options = editingQuestion.options.map((o, i) => {
      if (i === index) return { ...o, [field]: value };
      if (field === 'isCorrect' && value === true) return { ...o, isCorrect: false };
      return o;
    });
    setEditingQuestion({ ...editingQuestion, options });
  }

  function addOption() {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, emptyOption(editingQuestion.options.length + 1)],
    });
  }

  function removeOption(index: number) {
    if (!editingQuestion || editingQuestion.options.length <= 2) return;
    const options = editingQuestion.options
      .filter((_, i) => i !== index)
      .map((o, i) => ({ ...o, displayOrder: i + 1 }));
    setEditingQuestion({ ...editingQuestion, options });
  }

  async function handleSaveQuestion(e: FormEvent) {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.questionText.trim()) {
      setQuestionError('Question text is required');
      return;
    }
    if (editingQuestion.options.length < 2) {
      setQuestionError('At least 2 options are required');
      return;
    }
    if (editingQuestion.options.some((o) => !o.optionText.trim())) {
      setQuestionError('All options must have text');
      return;
    }
    if (!editingQuestion.options.some((o) => o.isCorrect)) {
      setQuestionError('Select one correct answer');
      return;
    }

    setQuestionSaving(true);
    setQuestionError('');
    try {
      const payload = {
        questionText: editingQuestion.questionText,
        points: editingQuestion.points,
        displayOrder: editingQuestion.displayOrder,
        options: editingQuestion.options,
      };

      if (isNewQuestion) {
        const { data } = await addQuestion(tid, payload);
        setQuestions((prev) => [...prev, data]);
      } else {
        const { data } = await updateQuestion(tid, editingQuestion.id!, payload);
        setQuestions((prev) => prev.map((q) => (q.id === data.id ? data : q)));
      }
      cancelEdit();
    } catch (err) {
      setQuestionError(extractApiError(err));
    } finally {
      setQuestionSaving(false);
    }
  }

  async function handleDeleteQuestion() {
    if (!deleteTarget?.id) return;
    try {
      await deleteQuestion(tid, deleteTarget.id);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // ignore
    }
  }

  async function moveQuestion(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setQuestions(reordered);
    const ids = reordered.map((q) => q.id!);
    await reorderQuestions(tid, ids);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 text-sm text-gray-500 hover:text-indigo-600"
      >
        &larr; Back to Dashboard
      </button>

      {/* Test Details Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Test Details</h2>

        {detailSource === 'list' && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p>
              Title and passcode were loaded from your test list. The API did not return full test details (often fixed
              by restarting the backend with the latest code). Saving these fields now could clear your description.
            </p>
            <button
              type="button"
              onClick={retryLoadFullDetail}
              className="mt-2 text-sm font-semibold text-amber-800 underline hover:text-amber-950"
            >
              Try loading full details again
            </button>
          </div>
        )}

        {testError && <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{testError}</div>}
        {testSuccess && <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{testSuccess}</div>}

        <form onSubmit={handleSaveTest} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Passcode</label>
              <input
                type="text"
                value={testForm.passcode}
                onChange={(e) => setTestForm({ ...testForm, passcode: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
              rows={2}
              disabled={detailSource === 'list'}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={testSaving || detailSource === 'list'}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Questions Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Questions ({questions.length})
          </h2>
          {!editingQuestion && (
            <button
              onClick={startAddQuestion}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Add Question
            </button>
          )}
        </div>

        {questions.length === 0 && !editingQuestion && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">No questions yet. Add your first question!</p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-900">{q.questionText}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{q.points} pts</span>
                    <span>{q.options.length} options</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                    title="Move up"
                  >
                    &#9650;
                  </button>
                  <button
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === questions.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                    title="Move down"
                  >
                    &#9660;
                  </button>
                  <button
                    onClick={() => startEditQuestion(q)}
                    className="rounded p-1 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(q)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Question Edit Form */}
        {editingQuestion && (
          <div className="mt-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-6">
            <h3 className="font-semibold text-gray-900">
              {isNewQuestion ? 'New Question' : 'Edit Question'}
            </h3>

            {questionError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{questionError}</div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <input
                  type="number"
                  min={1}
                  value={editingQuestion.points}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, points: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Answer Options (select the correct one)
                </label>
                <div className="space-y-2">
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => updateEditingOption(i, 'isCorrect', true)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => updateEditingOption(i, 'optionText', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder={`Option ${i + 1}`}
                      />
                      {editingQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="rounded p-1 text-gray-400 hover:text-red-600"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  + Add Option
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questionSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {questionSaving ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
