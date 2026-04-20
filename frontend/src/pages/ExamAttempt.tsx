import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { extractError } from '../api/errorUtils';
import Spinner from '../components/Spinner';
import Timer from '../components/Timer';
import Modal from '../components/Modal';
import { RiSendPlaneLine, RiSaveLine, RiAlertLine } from 'react-icons/ri';

// Options are stored as plain strings in the DB (TEXT[])
interface Question {
  id: string;
  type: 'MCQ' | 'SUBJECTIVE' | 'CODING';
  text: string;
  marks: number;
  options: string[];
  starterCode?: string;
}
interface ExamDetail {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

type Answers = Record<string, string | string[]>;

export default function ExamAttempt() {
  const { id: examId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [error, setError] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref so the proctor handler always reads the latest value without re-registering
  const submittingRef = useRef(false);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  /* ── Load exam ─────────────────────────── */
  useEffect(() => {
    if (!examId) return;
    api.get(`/exams/${examId}`)
      .then((r) => setExam(r.data))
      .catch((err: any) => setError(extractError(err, 'Failed to load exam.')))
      .finally(() => setLoading(false));
  }, [examId]);

  /* ── Proctoring: tab switch only ────────
     • Only visibilitychange — window.blur fires on confirm dialogs, causing false positives
     • Guard: skip if exam is being submitted                                    */
  useEffect(() => {
    if (!attemptId) return;

    const triggerWarning = (eventType: string) => {
      // Do not flag during form submission / confirm dialog
      if (submittingRef.current) return;

      setProctorWarnings((w) => w + 1);
      setShowWarning(true);
      api.post(`/proctor/attempts/${attemptId}/events`, { eventType }).catch(() => {});
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
      warnTimeout.current = setTimeout(() => setShowWarning(false), 4000);
    };

    const onVisibility = () => {
      if (document.hidden) triggerWarning('TAB_SWITCH');
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
    };
  }, [attemptId]);

  /* ── Auto-save answer ───────────────────── */
  const autoSave = useCallback((questionId: string, answer: string | string[]) => {
    if (!attemptId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await api.post(`/attempts/${attemptId}/answer`, {
          questionId,
          answer: Array.isArray(answer) ? answer.join(',') : answer,
        });
      } catch { /* silent */ }
    }, 800);
  }, [attemptId]);

  const setAnswer = (qId: string, val: string | string[]) => {
    setAnswers((a) => ({ ...a, [qId]: val }));
    autoSave(qId, val);
  };

  /* ── Toggle MCQ option ───────────────────── */
  const toggleOption = (qId: string, optText: string) => {
    setAnswers((prev) => {
      const curr = (prev[qId] as string[] | undefined) || [];
      const updated = curr.includes(optText)
        ? curr.filter((o) => o !== optText)
        : [...curr, optText];
      autoSave(qId, updated);
      return { ...prev, [qId]: updated };
    });
  };

  /* ── Submit ─────────────────────────────── */
  const doSubmit = async () => {
    if (!attemptId) return;
    setSubmitModalOpen(false);
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post(`/attempts/${attemptId}/submit`);
      navigate(`/result/${attemptId}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Could not submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimerExpire = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try { await api.post(`/attempts/${attemptId}/submit`); } catch { /* ignore */ }
    navigate(`/result/${attemptId}`);
  };

  if (loading) return <Spinner />;
  if (error || !exam) return (
    <div className="page"><div className="container"><div className="alert alert-error">{error || 'Exam not found.'}</div></div></div>
  );

  const q = exam.questions[current];
  const answered = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return Array.isArray(v) ? v.length > 0 : v.trim().length > 0;
  }).length;

  return (
    <div className="page">
      {/* ── Submit confirmation modal ── */}
      <Modal
        open={submitModalOpen}
        variant="danger"
        title="Submit Exam"
        message={`You have answered ${answered} of ${exam.questions.length} question${exam.questions.length !== 1 ? 's' : ''}. You cannot change your answers after submitting.`}
        confirmLabel="Yes, Submit"
        cancelLabel="Go Back"
        onConfirm={doSubmit}
        onCancel={() => setSubmitModalOpen(false)}
      />

      {/* ── Submit error modal ── */}
      <Modal
        open={!!submitError}
        variant="alert"
        title="Submission Failed"
        message={submitError}
        confirmLabel="OK"
        onConfirm={() => setSubmitError('')}
      />

      {/* ── Proctoring warning banner ── */}
      {showWarning && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '4rem', pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'var(--danger, #dc2626)',
              color: '#fff',
              borderRadius: 12,
              padding: '1rem 1.6rem',
              maxWidth: 480,
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'warnSlideIn 0.25s ease',
              pointerEvents: 'auto',
            }}
          >
            <RiAlertLine size={22} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>
                ⚠️ Tab switch detected!
              </p>
              <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                Incident recorded. Violation #{proctorWarnings} — stay on this page.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
              aria-label="Dismiss"
            >✕</button>
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{exam.title}</h1>
            <p className="text-sm text-muted">{answered} / {exam.questions.length} answered</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {proctorWarnings > 0 && (
              <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RiAlertLine size={12} /> {proctorWarnings} violation{proctorWarnings > 1 ? 's' : ''}
              </span>
            )}
            <Timer durationMinutes={exam.duration} onExpire={handleTimerExpire} />
          </div>
        </div>

        {/* Question navigator */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          {exam.questions.map((question, idx) => {
            const a = answers[question.id];
            const done = Array.isArray(a) ? a.length > 0 : typeof a === 'string' && a.trim().length > 0;
            return (
              <button
                key={question.id}
                id={`nav-q-${idx}`}
                onClick={() => setCurrent(idx)}
                style={{
                  width: 34, height: 34, borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  borderColor: idx === current ? 'var(--accent)' : done ? 'var(--success)' : 'var(--border)',
                  background: idx === current ? 'var(--accent)' : done ? '#14532d' : 'var(--surface2)',
                  color: idx === current || done ? '#fff' : 'var(--text-muted)',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question card */}
        {q && (
          <div className="question-card" style={{ marginBottom: '1.2rem' }}>
            <div className="question-num">
              Question {current + 1} of {exam.questions.length} · {q.marks} mark{q.marks > 1 ? 's' : ''} · {q.type}
            </div>
            <p className="question-text">{q.text}</p>

            {/* MCQ */}
            {q.type === 'MCQ' && (
              <div className="option-list">
                {q.options.map((opt, oi) => {
                  const sel = ((answers[q.id] as string[]) || []).includes(opt);
                  return (
                    <label key={oi} className={`option-item ${sel ? 'selected' : ''}`} id={`opt-${q.id}-${oi}`}>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggleOption(q.id, opt)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Subjective */}
            {q.type === 'SUBJECTIVE' && (
              <textarea
                id={`answer-${q.id}`}
                className="form-control"
                style={{ minHeight: 130 }}
                placeholder="Write your answer here…"
                value={(answers[q.id] as string) || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}

            {/* Coding */}
            {q.type === 'CODING' && (
              <textarea
                id={`code-${q.id}`}
                className="form-control"
                style={{ fontFamily: 'monospace', fontSize: '0.9rem', minHeight: 200 }}
                placeholder="Write your code here…"
                value={(answers[q.id] as string) || q.starterCode || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              id="prev-question"
              className="btn btn-ghost"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              ← Prev
            </button>
            <button
              id="next-question"
              className="btn btn-ghost"
              disabled={current === exam.questions.length - 1}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next →
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              id="save-answer"
              className="btn btn-ghost text-sm"
              onClick={() => {
                if (!q) return;
                autoSave(q.id, answers[q.id] || '');
              }}
            >
              <RiSaveLine size={14} /> Save
            </button>
            <button
              id="submit-exam"
              className="btn btn-danger"
              onClick={() => setSubmitModalOpen(true)}
              disabled={submitting}
            >
              <RiSendPlaneLine size={14} /> {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
