import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentQuestions, submitTest, type StudentTestData } from '../../api/student';
import ConfirmModal from '../../components/ConfirmModal';
import { AxiosError } from 'axios';
import { enterFullscreen, exitFullscreenSafe, isFullscreenActive } from '../../utils/fullscreenApi';

/** Tab/window focus leaves before student must submit (cannot dismiss except by submitting). */
const MAX_TAB_FOCUS_LEAVES = 3;

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

  /** Not started until user clicks through the gate (required for fullscreen user gesture). */
  const [sessionStarted, setSessionStarted] = useState(false);
  const [fullscreenUnsupported, setFullscreenUnsupported] = useState(false);
  const [inFullscreen, setInFullscreen] = useState(false);

  const [tabLeaveCount, setTabLeaveCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [forceSubmitOpen, setForceSubmitOpen] = useState(false);

  const lastVisibilityRef = useRef<DocumentVisibilityState>('visible');

  const syncFullscreen = useCallback(() => {
    setInFullscreen(isFullscreenActive());
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [tid]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    syncFullscreen();
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, [syncFullscreen]);

  useEffect(() => {
    if (!sessionStarted || submitting) return;

    const onVisibility = () => {
      const v = document.visibilityState;
      if (v === 'hidden' && lastVisibilityRef.current === 'visible') {
        setTabLeaveCount((c) => {
          const next = c + 1;
          if (next >= MAX_TAB_FOCUS_LEAVES) {
            setShowTabWarning(false);
            setForceSubmitOpen(true);
          } else {
            setShowTabWarning(true);
          }
          return next;
        });
      }
      lastVisibilityRef.current = v;
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [sessionStarted, submitting]);

  useEffect(() => {
    return () => {
      void exitFullscreenSafe();
    };
  }, []);

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

  async function handleStartSecureSession() {
    try {
      await enterFullscreen();
      setFullscreenUnsupported(false);
      setInFullscreen(true);
    } catch {
      setFullscreenUnsupported(true);
      setInFullscreen(false);
    }
    setSessionStarted(true);
  }

  async function handleReturnToFullscreen() {
    try {
      await enterFullscreen();
      setInFullscreen(true);
    } catch {
      setFullscreenUnsupported(true);
      setInFullscreen(false);
    }
  }

  function selectAnswer(questionId: number, optionId: number) {
    if (forceSubmitOpen) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = testData?.totalQuestions ?? 0;
  const unansweredCount = totalQuestions - answeredCount;

  const blockedByFullscreen =
    sessionStarted && !fullscreenUnsupported && !inFullscreen && !submitting && !forceSubmitOpen;

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: optId,
      }));
      const { data } = await submitTest(tid, payload);
      await exitFullscreenSafe();
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

  if (!sessionStarted) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4">
        <div className="rounded-2xl border border-indigo-200 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-gray-900">Secure test mode</h1>
          <p className="mt-2 text-sm text-gray-600">
            This test asks your browser to use <strong>full screen</strong> and tracks when you leave this tab or
            window. You cannot answer questions until you start.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-gray-500">
            <li>Browsers cannot completely block switching tabs or other apps; leaving the tab is detected and counted.</li>
            <li>
              After {MAX_TAB_FOCUS_LEAVES} separate times leaving this page, you will be required to submit the test.
            </li>
            <li>Exiting full screen during the test pauses the test until you return to full screen.</li>
          </ul>
          <button
            type="button"
            onClick={handleStartSecureSession}
            className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Start secure test
          </button>
          <p className="mt-3 text-center text-xs text-gray-400">
            If full screen is blocked, you can still start; tab-leaving rules still apply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      {fullscreenUnsupported && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Full screen is not available in this browser or was denied. Tab-switch detection is still active.
        </div>
      )}

      {showTabWarning && !forceSubmitOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="tab-warning-title"
        >
          <div className="max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="tab-warning-title" className="text-lg font-semibold text-gray-900">
              You left the test
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This page was hidden or you switched away (tab or app). Focus leave #{tabLeaveCount} of{' '}
              {MAX_TAB_FOCUS_LEAVES} before submit is required.
            </p>
            <button
              type="button"
              onClick={() => setShowTabWarning(false)}
              className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              I am back — continue test
            </button>
          </div>
        </div>
      )}

      {blockedByFullscreen && (
        <div
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-gray-950/95 p-6 text-center text-white"
          role="alertdialog"
          aria-modal="true"
        >
          <p className="max-w-md text-lg font-medium">Full screen is required to continue the test.</p>
          <p className="max-w-sm text-sm text-gray-300">
            You left full-screen mode. Return to full screen to keep working. Your answers are saved.
          </p>
          <button
            type="button"
            onClick={handleReturnToFullscreen}
            className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Return to full screen
          </button>
        </div>
      )}

      <div className={blockedByFullscreen || forceSubmitOpen ? 'pointer-events-none opacity-40' : ''}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{testData.testTitle}</h1>
          {testData.testDescription && (
            <p className="mt-1 text-sm text-gray-500">{testData.testDescription}</p>
          )}
        </div>

        <div className="sticky top-0 z-10 mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-gray-700">
              {answeredCount} of {totalQuestions} answered
            </span>
            <span className="text-gray-400">
              {unansweredCount > 0 ? `${unansweredCount} remaining` : 'All answered!'}
            </span>
            {tabLeaveCount > 0 && (
              <span className="w-full text-xs text-amber-700 sm:w-auto">
                Focus leaves: {tabLeaveCount} / {MAX_TAB_FOCUS_LEAVES}
              </span>
            )}
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
                      disabled={forceSubmitOpen}
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
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={forceSubmitOpen}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Test
          </button>
        </div>
      </div>

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

      <ConfirmModal
        open={forceSubmitOpen}
        title="Submit required"
        message={`You left this test page ${MAX_TAB_FOCUS_LEAVES} times. You must submit your test now. Unanswered questions will count as blank.`}
        confirmLabel={submitting ? 'Submitting...' : 'Submit now'}
        hideCancel
        danger
        onConfirm={handleSubmit}
        onCancel={() => {}}
      />
    </div>
  );
}
